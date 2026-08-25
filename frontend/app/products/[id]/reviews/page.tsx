// app/products/[id]/reviews/page.tsx
export default async function ProductReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <section>
      <h1>Reviews for Product: {id}</h1>
      <p>No reviews posted yet.</p>
    </section>
  );
}