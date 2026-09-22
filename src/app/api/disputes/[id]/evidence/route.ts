import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser, canAccessDispute } from '@/lib/auth';
import { validateEvidenceFile, MAX_EVIDENCE_FILES_PER_DISPUTE } from '@/lib/validation';
import { sha256Buffer } from '@/lib/hash';
import { saveEvidenceFile } from '@/lib/storage';
import { writeAuditLog } from '@/lib/audit';

// GET /api/disputes/:id/evidence — list what's already been submitted.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await canAccessDispute(user, params.id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const evidence = await prisma.evidence.findMany({
    where: { disputeId: params.id },
    orderBy: { submittedAt: 'asc' },
  });
  return NextResponse.json({ evidence });
}

// POST /api/disputes/:id/evidence — FR-04/FR-05/FR-06.
// Accepts multipart/form-data with a single "file" field. Once this
// succeeds, the row it creates is permanent: there is no route in
// this app that can update or delete an Evidence record (NFR-10).
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'MERCHANT') {
    return NextResponse.json({ error: 'Only merchants submit evidence.' }, { status: 403 });
  }
  if (!(await canAccessDispute(user, params.id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const dispute = await prisma.dispute.findUnique({ where: { id: params.id }, include: { evidence: true } });
  if (!dispute) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Edge case (PRD §15): dispute already escalated or past its
  // deadline can't accept a normal evidence submission any more.
  if (dispute.status === 'ESCALATED') {
    return NextResponse.json({ error: 'This dispute has been escalated and no longer accepts evidence.' }, { status: 409 });
  }
  if (new Date() > dispute.deadlineAt) {
    return NextResponse.json({ error: 'The response deadline for this dispute has passed.' }, { status: 409 });
  }
  if (dispute.evidence.length >= MAX_EVIDENCE_FILES_PER_DISPUTE) {
    return NextResponse.json({ error: `Maximum of ${MAX_EVIDENCE_FILES_PER_DISPUTE} files per dispute reached.` }, { status: 409 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  // FR-11 / NFR-06: server-side validation, independent of whatever
  // the browser's <input accept> attribute already filtered.
  const validation = validateEvidenceFile({ type: file.type, size: file.size, name: file.name });
  if (!validation.ok) {
    return NextResponse.json({ error: validation.reason }, { status: 422 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const sha256Hash = sha256Buffer(buffer); // NFR-09

  const { url } = await saveEvidenceFile({
    disputeId: dispute.id,
    originalName: file.name,
    mimeType: file.type,
    buffer,
  });

  const evidence = await prisma.evidence.create({
    data: {
      disputeId: dispute.id,
      fileName: file.name,
      fileUrl: url,
      fileSize: file.size,
      mimeType: file.type,
      sha256Hash,
      submittedBy: user.id,
    },
  });

  await writeAuditLog({ disputeId: dispute.id, action: 'EVIDENCE_UPLOADED', actorId: user.id, metadata: { evidenceId: evidence.id } });
  await writeAuditLog({ disputeId: dispute.id, action: 'EVIDENCE_SUBMITTED', actorId: user.id, metadata: { evidenceId: evidence.id } });

  await prisma.dispute.update({
    where: { id: dispute.id },
    data: { status: 'EVIDENCE_SUBMITTED' },
  });

  return NextResponse.json({ evidence }, { status: 201 });
}

// No PUT, PATCH, or DELETE exported here on purpose — see file header.
