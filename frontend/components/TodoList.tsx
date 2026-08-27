'use client';

import { useState } from 'react';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export default function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState(initialTodos);
  const [showCompleted, setShowCompleted] = useState(true);

  const filtered = todos.filter(
    (todo) => showCompleted || !todo.completed
  );

  const handleToggle = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={showCompleted}
          onChange={(e) => setShowCompleted(e.target.checked)}
        />
        Show completed
      </label>

      <ul style={{ marginTop: '1rem', listStyle: 'none', padding: 0 }}>
        {filtered.map((todo) => (
          <li
            key={todo.id}
            style={{
              padding: '0.5rem 0',
              textDecoration: todo.completed ? 'line-through' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id)}
            />
            {todo.title}
          </li>
        ))}
      </ul>
    </div>
  );
}