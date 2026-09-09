-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('ACTION_REQUIRED', 'UNDER_REVIEW', 'RESOLVED', 'ESCALATED');

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "status" "DisputeStatus" NOT NULL DEFAULT 'ACTION_REQUIRED',
    "responseDeadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "merchantId" TEXT NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id"),
    -- Business invariants not representable as Prisma schema attributes.
    CONSTRAINT "Dispute_amountMinor_positive" CHECK ("amountMinor" > 0),
    CONSTRAINT "Dispute_currency_uppercase" CHECK ("currency" ~ '^[A-Z]{3}$')
);

CREATE UNIQUE INDEX "Dispute_reference_key" ON "Dispute"("reference");
CREATE INDEX "Dispute_merchantId_status_responseDeadline_idx" ON "Dispute"("merchantId", "status", "responseDeadline");
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
