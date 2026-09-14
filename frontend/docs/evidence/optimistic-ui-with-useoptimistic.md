# Optimistic UI with useOptimistic

## Assignment

Implemented an optimistic dispute-review note list using React's `useOptimistic` hook.

## Features

- New notes appear immediately before the simulated server action completes.
- Pending notes display `Adding optimistically...`.
- The interface displays `Saving...` while the action is pending.
- Successful notes remain in the list after the server action completes.
- Failed actions roll back the optimistic note automatically.
- A clear error message is displayed when the server action fails.
- Duplicate notes are prevented when the confirmed state is updated.
- The server action calls `revalidatePath('/optimistic-ui')` after success.

## Verification

### Successful optimistic update

1. Left `Simulate server failure` unchecked.
2. Added `Confirm merchant evidence 1`.
3. The note appeared immediately with the pending label.
4. After the simulated server delay, the note remained once without the pending label.

### Failed optimistic update

1. Enabled `Simulate server failure`.
2. Added a new dispute note.
3. The note appeared temporarily with the pending label.
4. The server action failed.
5. The note disappeared from the list.
6. The error message `The server rejected this dispute note.` was displayed.

## Implementation Notes

The server action uses a simulated delay and failure flag for demonstration purposes. The list state is local to the client component, while `useOptimistic` provides the temporary UI state during the transition.
