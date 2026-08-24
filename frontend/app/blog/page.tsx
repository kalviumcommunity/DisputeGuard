import Link from "next/link";

export default function BlogIndexPage() {
  return (
    <main>
      <h1>Blog</h1>

      <ul>
        <li>
          <Link href="/blog/getting-started">
            Getting Started
          </Link>
        </li>

        <li>
          <Link href="/blog/announcing-our-launch">
            Announcing Our Launch
          </Link>
        </li>
      </ul>
    </main>
  );
}