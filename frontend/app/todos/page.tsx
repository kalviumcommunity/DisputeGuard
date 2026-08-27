import TodoList from '@/components/TodoList';

export default async function TodosPage() {
  // Fetch data on the server
  const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');
  const todos = await response.json();

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Todos</h1>
      <TodoList initialTodos={todos} />
    </main>
  );
}