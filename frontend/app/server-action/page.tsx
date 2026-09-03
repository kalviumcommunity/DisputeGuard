import TaskForm from './TaskForm';

export default function ServerActionPage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Server Action Task Creator</h1>

      <p>
        Submit a task using a Next.js Server Action without a manual fetch call.
      </p>

      <TaskForm />
    </main>
  );
}
