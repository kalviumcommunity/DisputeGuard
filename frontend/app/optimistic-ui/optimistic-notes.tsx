'use client';

import {
  useOptimistic,
  useState,
  useTransition,
} from 'react';
import {
  addDisputeNote,
  type DisputeNote,
} from './actions';

type OptimisticNote = DisputeNote & {
  pending?: boolean;
};

type OptimisticAction = {
  type: 'add';
  note: DisputeNote;
};

const initialNotes: OptimisticNote[] = [
  {
    id: 'note-1',
    text: 'Verify the merchant response deadline.',
  },
  {
    id: 'note-2',
    text: 'Request supporting transaction evidence.',
  },
];

function notesReducer(
  currentNotes: OptimisticNote[],
  action: OptimisticAction,
): OptimisticNote[] {
  if (action.type === 'add') {
    const alreadyExists = currentNotes.some(
      (note) => note.id === action.note.id,
    );

    if (alreadyExists) {
      return currentNotes;
    }

    return [
      ...currentNotes,
      {
        ...action.note,
        pending: true,
      },
    ];
  }

  return currentNotes;
}

export default function OptimisticNotes() {
  const [notes, setNotes] =
    useState<OptimisticNote[]>(initialNotes);

  const [optimisticNotes, dispatchOptimistic] =
    useOptimistic(notes, notesReducer);

  const [isPending, startTransition] = useTransition();

  const [noteText, setNoteText] = useState('');
  const [shouldFail, setShouldFail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAddNote() {
    const text = noteText.trim();

    if (!text || isPending) {
      return;
    }

    const newNote: DisputeNote = {
      id: crypto.randomUUID(),
      text,
    };

    setError(null);
    setNoteText('');

    startTransition(async () => {
      dispatchOptimistic({
        type: 'add',
        note: newNote,
      });

      try {
        const savedNote = await addDisputeNote(
          newNote,
          shouldFail,
        );

        setNotes((currentNotes) => {
          const alreadyExists = currentNotes.some(
            (note) => note.id === savedNote.id,
          );

          if (alreadyExists) {
            return currentNotes;
          }

          return [
            ...currentNotes,
            {
              ...savedNote,
              pending: false,
            },
          ];
        });
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : 'Could not save the dispute note.',
        );
      }
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Dispute Review Notes
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Add a note and watch the optimistic update happen immediately.
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {isPending ? 'Saving...' : 'Ready'}
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={noteText}
          onChange={(event) => setNoteText(event.target.value)}
          placeholder="Enter a dispute review note"
          disabled={isPending}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />

        <button
          type="button"
          onClick={handleAddNote}
          disabled={isPending || !noteText.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Add note'}
        </button>
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={shouldFail}
          onChange={(event) => setShouldFail(event.target.checked)}
          disabled={isPending}
        />
        Simulate server failure
      </label>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <ul className="mt-6 space-y-3">
        {optimisticNotes.map((note) => (
          <li
            key={note.id}
            className={`rounded-lg border p-4 ${
              note.pending
                ? 'border-blue-300 bg-blue-50'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <p className="text-sm text-slate-800">
              {note.text}
            </p>

            {note.pending && (
              <p className="mt-1 text-xs font-medium text-blue-600">
                Adding optimistically...
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}