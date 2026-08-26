import Link from "next/link";

export default function BlogNotFound() {
  return (
    <main
      style={{
        padding: "2rem",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h1>Post Not Found</h1>

      <p>
        The blog post you are looking for does not exist. It may have been
        removed or the URL may be incorrect.
      </p>

      <section
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#f0f0f0",
        }}
      >
        <h2>Recent Posts</h2>

        <ul>
          <li>
            <Link href="/blog/my-first-post">My First Post</Link>
          </li>

          <li>
            <Link href="/blog/hello-world">Hello World</Link>
          </li>

          <li>
            <Link href="/blog/nextjs-routing">
              Next.js Routing
            </Link>
          </li>
        </ul>
      </section>

      <nav style={{ marginTop: "2rem" }}>
        <Link href="/blog">← All Posts</Link>
        {" | "}
        <Link href="/">Go Home</Link>
      </nav>
    </main>
  );
}