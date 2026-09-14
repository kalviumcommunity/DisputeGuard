import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getDisputePage, paginationHref, PAGE_SIZE, type QueryParams } from '@/lib/dispute-pagination';
import { FilterControls } from './filter-controls';

export default async function DisputesPage({ searchParams }: { searchParams: Promise<QueryParams> }) {
  const params = await searchParams;
  const { records, query, page, total, totalPages, hasPrevious, hasNext } = await getDisputePage(prisma, params);
  if (params.page !== String(page)) redirect(paginationHref(query, page));
  const pageNumbers = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b);
  return (
    <section className="p-8">
      <h1 className="mb-6 text-2xl font-bold">DisputeGuard disputes</h1>
      <Suspense fallback={<p>Loading filters…</p>}>
        <FilterControls currentStatus={query.status} currentSort={query.sort} />
      </Suspense>
      <p className="my-4" role="status">
        {total === 0 ? 'No matching disputes.' : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total} disputes.`}
        {' '}Page {page} of {totalPages}.
      </p>
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Disputes on page {page}</caption>
        <thead><tr>{['Reference', 'Title', 'Amount', 'Status', 'Priority'].map((label) => <th key={label} scope="col" className="border-b p-3">{label}</th>)}</tr></thead>
        <tbody>{records.map((record) => <tr key={record.id}>
          <td className="border-b p-3">{record.reference}</td><td className="border-b p-3">{record.title}</td>
          <td className="border-b p-3">{record.currency} {(record.amountMinor / 100).toFixed(2)}</td>
          <td className="border-b p-3">{record.status}</td><td className="border-b p-3">{record.priority}</td>
        </tr>)}</tbody>
      </table>
      <nav aria-label="Dispute pagination" className="mt-6 flex items-center gap-4">
        {hasPrevious ? <Link href={paginationHref(query, page - 1)}>Previous</Link> : <span aria-disabled="true" className="text-gray-500">Previous</span>}
        {pageNumbers.map((number, index) => <span key={number}>
          {index > 0 && number - pageNumbers[index - 1] > 1 && <span className="mr-4">…</span>}
          <Link href={paginationHref(query, number)} aria-label={`Page ${number}`} aria-current={number === page ? 'page' : undefined} className={number === page ? 'font-bold underline' : ''}>{number}</Link>
        </span>)}
        {hasNext ? <Link href={paginationHref(query, page + 1)}>Next</Link> : <span aria-disabled="true" className="text-gray-500">Next</span>}
      </nav>
    </section>
  );
}
