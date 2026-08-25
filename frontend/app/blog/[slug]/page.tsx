// app/blog/[slug]/page.tsx
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const posts: Record<string, { title: string; content: string }> = {
    "my-first-post": {
      title: "My First Post",
      content: "This is the content of the first post.",
    },
    "hello-world": {
      title: "Hello World",
      content: "A classic introduction.",
    },
    "nextjs-routing": {
      title: "Understanding Next.js Routing",
      content: "Dynamic routes make building flexible apps easy.",
    },
  };

  const post = posts[slug];

  if (!post) {
    return <h1>Post not found: {slug}</h1>;
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}