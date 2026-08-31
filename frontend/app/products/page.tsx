export const revalidate = 60;

async function getProducts() {
  return {
    generatedAt: new Date().toISOString(),
    items: ["Notebook", "Keyboard", "Monitor"],
  };
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main>
      <h1>Products - ISR Demo</h1>
      <p>This page revalidates every 60 seconds.</p>

      <pre>{JSON.stringify(products, null, 2)}</pre>
    </main>
  );
}