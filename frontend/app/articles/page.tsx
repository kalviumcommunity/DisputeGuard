export default async function ArticlesPage() {
  const response = await fetch(
    'https://jsonplaceholder.typicode.com/posts'
  );

  const articles = await response.json();

  return (
    <main
      style={{
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      <h1>Articles</h1>

      <div>
        {(articles as any[]).slice(0, 5).map((article) => (
          <article
            key={article.id}
            style={{
              padding: '1rem',
              border: '1px solid #ddd',
              marginBottom: '1rem',
              borderRadius: '4px',
            }}
          >
            <h2>{article.title}</h2>
            <p>{article.body.substring(0, 100)}...</p>
          </article>
        ))}
      </div>
    </main>
  );
}