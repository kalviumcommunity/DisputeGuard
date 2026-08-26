import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <h1>404</h1>
      <h2>Page Not Found</h2>

      <p>
        Sorry, the page you are looking for does not exist.
      </p>

      <div>
        <Link href="/">Go Home</Link>
        {" | "}
        <Link href="/blog">Browse Blog</Link>
      </div>
    </main>
  );
}