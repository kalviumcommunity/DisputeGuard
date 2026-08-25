// app/products/page.tsx
import Link from "next/link";

export default function ProductsPage() {
  return (
    <section>
      <h1>Products Directory</h1>
      <ul>
        <li><Link href="/products/shoe-001">Running Shoes</Link></li>
        <li><Link href="/products/shirt-001">T-Shirt</Link></li>
        <li><Link href="/products/hat-001">Baseball Cap</Link></li>
      </ul>
    </section>
  );
}