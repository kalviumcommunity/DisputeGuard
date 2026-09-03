'use client';

import { useActionState } from 'react';
import { createTask } from './actions';

const initialState = {
  success: false,
  message: '',
};

export default function TaskForm() {
  const [state, formAction, pending] = useActionState(
    createTask,
    initialState
  );

  return (
    <form action={formAction}>
      <label htmlFor="title">Task title</label>

      <input
        id="title"
        name="title"
        type="text"
        placeholder="Enter a task title"
        required
      />

      <button type="submit" disabled={pending}>
        {pending ? 'Creating...' : 'Create Task'}
      </button>

      {state.message && (
        <p>
          {state.message}
        </p>
      )}
    </form>
  );
}
