"use client";

import { useEffect, useState } from "react";

export default function ArticlesPageBad() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.slice(0, 5));
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <main>
      <h1>Articles (Client Fetching)</h1>

      {articles.map((article) => (
        <article key={article.id}>
          <h2>{article.title}</h2>
          <p>{article.body.substring(0, 100)}...</p>
        </article>
      ))}
    </main>
  );
}