// app/docs/[...catchAll]/page.tsx
export default async function DocsPage({
  params,
}: {
  params: Promise<{ catchAll: string[] }>;
}) {
  const { catchAll } = await params;

  const path = catchAll.join(" / ");
  const depth = catchAll.length;

  return (
    <section>
      <h1>Documentation</h1>
      <p>Current path: {path}</p>
      <p>Depth: {depth} segments</p>
      <ul>
        {catchAll.map((segment, index) => (
          <li key={index}>
            Segment {index + 1}: {segment}
          </li>
        ))}
      </ul>
    </section>
  );
}