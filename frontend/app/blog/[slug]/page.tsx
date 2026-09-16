import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface BlogPost {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
}

const posts: Record<string, BlogPost> = {
  "hello-world": {
    title: "Hello World",
    content: "First post!",
    excerpt: "Welcome to our blog and first post!",
    coverImage: "/og-images/hello-world.png",
  },
  "next-js-tips": {
    title: "Next.js Tips",
    content: "Performance tips",
    excerpt: "Essential tips to optimize Next.js performance.",
    coverImage: "/og-images/next-js-tips.png",
  },
  "react-patterns": {
    title: "React Patterns",
    content: "Design patterns",
    excerpt: "Modern design patterns for React developers.",
    coverImage: "/og-images/react-patterns.png",
  },
  "css-tricks": {
    title: "CSS Tricks",
    content: "CSS tips",
    excerpt: "Useful techniques for modern CSS layouts.",
    coverImage: "/og-images/css-tricks.png",
  },
  "web-performance": {
    title: "Web Performance",
    content: "Speed tips",
    excerpt: "Actionable strategies for lightning-fast websites.",
    coverImage: "/og-images/web-performance.png",
  },
};

export async function generateStaticParams() {
  return [
    { slug: "hello-world" },
    { slug: "next-js-tips" },
    { slug: "react-patterns" },
    { slug: "css-tricks" },
    { slug: "web-performance" },
  ];
}

// Task 3 & 4: Dynamic Metadata generator
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug];

  // Returning empty object on 404 ensures clean fallback without server errors
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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