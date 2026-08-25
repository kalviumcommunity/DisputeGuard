// app/products/[id]/page.tsx
import Link from "next/link";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const products: Record<string, { name: string; price: number }> = {
    "shoe-001": { name: "Running Shoes", price: 99.99 },
    "shirt-001": { name: "T-Shirt", price: 29.99 },
    "hat-001": { name: "Baseball Cap", price: 19.99 },
  };

  const product = products[id];

  if (!product) {
    return (
      <section>
        <h1>Product Not Found</h1>
        <p>No product with ID: {id}</p>
      </section>
    );
  }

  return (
    <section>
      <h1>{product.name}</h1>
      <p>Product ID: {id}</p>
      <p>Price: ${product.price}</p>
      <Link href={`/products/${id}/reviews`}>View Reviews</Link>
    </section>
  );
}