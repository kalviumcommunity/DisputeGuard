export default async function ArticlesPageGood() {
  const response = await fetch(
    "https://jsonplaceholder.typicode.com/posts"
  );

  const articles = await response.json();

  return (
    <main>
      <h1>Articles (Server Fetching)</h1>

      {(articles as any[]).slice(0, 5).map((article) => (
        <article key={article.id}>
          <h2>{article.title}</h2>
          <p>{article.body.substring(0, 100)}...</p>
        </article>
      ))}
    </main>
  );
}