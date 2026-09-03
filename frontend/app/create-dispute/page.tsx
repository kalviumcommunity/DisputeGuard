'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createDisputeAction, FormState } from '@/app/actions/dispute-actions';

const initialState: FormState = {
  success: false,
};

export default function CreateDisputePage() {
  const [state, formAction, isPending] = useActionState(createDisputeAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Task 4: Clear form on successful submission
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <main style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
      <h1>File a New Dispute</h1>

      {state.message && (
        <div
          style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            borderRadius: '4px',
            backgroundColor: state.success ? '#d1fae5' : '#fee2e2',
            color: state.success ? '#065f46' : '#991b1b',
          }}
        >
          {state.message}
        </div>
      )}

      <form ref={formRef} action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="title" style={{ display: 'block', fontWeight: 'bold' }}>
            Dispute Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
          {/* Task 3: Render field-level error messages */}
          {state.errors?.title && (
            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {state.errors.title[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="amount" style={{ display: 'block', fontWeight: 'bold' }}>
            Dispute Amount ($)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            step="0.01"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
          {/* Task 3: Render field-level error messages */}
          {state.errors?.amount && (
            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {state.errors.amount[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '0.75rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {isPending ? 'Submitting...' : 'Submit Dispute'}
        </button>
      </form>
    </main>
  );
}