'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Button } from '@/components/ui/Button';
import type { ActionResult } from '@/lib/actions/actionResult';

interface DeleteButtonProps {
  id: string;
  /** What is being removed, e.g. "this article". Used in the confirmation. */
  label: string;
  action: (input: unknown) => Promise<ActionResult<{ id: string }>>;
  /** Explains what "delete" actually does, so the choice is informed. */
  consequence?: string;
}

/**
 * Delete, behind a confirmation.
 *
 * ⚠️ This is a Radix AlertDialog, NOT `window.confirm`. A native confirm blocks
 * the whole browser, cannot be styled, and is inconsistent across platforms.
 * AlertDialog also gets focus trapping, focus restoration and `Escape` handling
 * right, which a hand-rolled modal usually does not.
 *
 * The wording says what will actually happen. Deletion here is a SOFT delete —
 * the row is retained and can be recovered without a database restore — and
 * telling staff that is the difference between a confident click and a support
 * request.
 */
export function DeleteButton({
  id,
  label,
  action,
  consequence = 'It will be removed from the website immediately. This can be undone by an administrator.',
}: DeleteButtonProps) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleDelete() {
    setPending(true);
    setError(null);

    const result = await action({ id });

    setPending(false);

    if (result.ok) {
      router.refresh();
      return;
    }

    setError(result.error);
  }

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <Button variant="ghost" size="sm" aria-label={`Delete ${label}`}>
          <Trash2 aria-hidden="true" className="size-4 text-error" />
          <span className="sr-only sm:not-sr-only">Delete</span>
        </Button>
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-neutral-900/50" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-xl focus:outline-none">
          <AlertDialog.Title className="font-serif text-h3 text-foreground">
            Delete {label}?
          </AlertDialog.Title>

          <AlertDialog.Description className="mt-2 text-body-sm text-foreground-muted">
            {consequence}
          </AlertDialog.Description>

          {error ? (
            <p role="alert" className="mt-3 text-body-sm text-error">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <Button variant="ghost" disabled={pending}>
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={pending}
              aria-busy={pending}
            >
              {pending ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
