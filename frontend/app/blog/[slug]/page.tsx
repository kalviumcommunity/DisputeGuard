// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const posts = [
    { slug: "hello-world" },
    { slug: "next-js-tips" },
    { slug: "react-patterns" },
    { slug: "css-tricks" },
    { slug: "web-performance" },
  ];

  return posts;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const posts: Record<string, { title: string; content: string }> = {
    "hello-world": {
      title: "Hello World",
      content: "First post!",
    },

    "next-js-tips": {
      title: "Next.js Tips",
      content: "Performance tips",
    },

    "react-patterns": {
      title: "React Patterns",
      content: "Design patterns",
    },

    "css-tricks": {
      title: "CSS Tricks",
      content: "CSS tips",
    },

    "web-performance": {
      title: "Web Performance",
      content: "Speed tips",
    },
  };

  const post = posts[slug];

  if (!post) {
    notFound();
  }

  return (
    <article
      style={{
        padding: "2rem",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}