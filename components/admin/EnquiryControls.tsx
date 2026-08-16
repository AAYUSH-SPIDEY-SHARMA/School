'use client';

import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/forms/Field';
import { Select, Textarea } from '@/components/ui/Input';
import {
  addEnquiryNote,
  assignEnquiry,
  updateEnquiryStatus,
} from '@/lib/actions/enquiries';

interface EnquiryControlsProps {
  enquiryId: string;
  status: string;
  assignedToId: string | null;
  staff: readonly { id: string; name: string }[];
}

const STATUSES = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
] as const;

/**
 * Status, assignment and notes for one enquiry.
 *
 * Each control saves on change rather than behind a "Save" button: admissions
 * staff work through a list quickly, and a separate save step is the kind of
 * friction that leads to a status never being updated at all — which then makes
 * the whole list untrustworthy.
 */
export function EnquiryControls({
  enquiryId,
  status,
  assignedToId,
  staff,
}: EnquiryControlsProps) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [note, setNote] = React.useState('');

  async function run(work: () => Promise<{ ok: boolean; error?: string }>) {
    setPending(true);
    setError(null);

    const result = await work();

    setPending(false);

    if (result.ok) {
      router.refresh();
      return true;
    }

    setError(result.error ?? 'Something went wrong.');
    return false;
  }

  return (
    <div className="flex flex-col gap-5">
      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md border border-error bg-error-soft px-3 py-2 text-body-sm text-error"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}

      <Field htmlFor="enquiry-status" label="Status">
        <Select
          id="enquiry-status"
          defaultValue={status}
          disabled={pending}
          onChange={(event) =>
            void run(() =>
              updateEnquiryStatus({ id: enquiryId, status: event.target.value }),
            )
          }
        >
          {STATUSES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        htmlFor="enquiry-assignee"
        label="Assigned to"
        hint="Only staff who can open enquiries appear here."
      >
        <Select
          id="enquiry-assignee"
          defaultValue={assignedToId ?? ''}
          disabled={pending}
          onChange={(event) =>
            void run(() =>
              assignEnquiry({ id: enquiryId, assignedToId: event.target.value }),
            )
          }
        >
          <option value="">Unassigned</option>
          {staff.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </Select>
      </Field>

      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const saved = await run(() =>
            addEnquiryNote({ enquiryId, body: note }),
          );
          if (saved) setNote('');
        }}
        className="flex flex-col gap-2"
      >
        <Field
          htmlFor="enquiry-note"
          label="Add a note"
          hint="Notes are shared with other admissions staff. Recording that you have called stops a second person calling the same family."
        >
          <Textarea
            id="enquiry-note"
            rows={4}
            value={note}
            disabled={pending}
            onChange={(event) => setNote(event.target.value)}
          />
        </Field>

        <Button
          type="submit"
          size="sm"
          disabled={pending || note.trim().length === 0}
          aria-busy={pending}
          className="self-start"
        >
          {pending ? 'Saving…' : 'Add note'}
        </Button>
      </form>
    </div>
  );
}
