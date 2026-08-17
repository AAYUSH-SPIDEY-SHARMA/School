'use client';

import { AlertCircle, CheckCircle2, Info, Link2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Field } from '@/components/forms/Field';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { addExternalMedia } from '@/lib/actions/media';
import {
  DRIVE_SHARING_NOTE,
  parseExternalMedia,
} from '@/lib/media/externalMedia';

/**
 * Add media by pasting a Google Drive or YouTube link.
 *
 * Exists because a school video can run to gigabytes. Re-uploading that to an
 * image CDN would be slow and expensive when the school already has it in Drive
 * or on YouTube.
 *
 * The link is parsed as it is typed so the person pasting sees immediately
 * whether it was understood, rather than finding out after saving that the
 * gallery shows a blank tile.
 */
export function ExternalMediaForm() {
  const router = useRouter();

  const [url, setUrl] = React.useState('');
  const [kind, setKind] = React.useState<'IMAGE' | 'VIDEO'>('VIDEO');
  const [title, setTitle] = React.useState('');
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  const parsed = url.trim() ? parseExternalMedia(url, kind) : null;
  const looksInvalid = url.trim().length > 8 && !parsed;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);

    const result = await addExternalMedia({
      externalUrl: url,
      kind,
      title,
      containsMinors: false,
    });

    setPending(false);

    if (result.ok) {
      setSaved(true);
      setUrl('');
      setTitle('');
      router.refresh();
      return;
    }

    setError(result.error);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-error bg-error-soft px-3 py-2.5 text-body-sm text-error"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {saved ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-md border border-success bg-success-soft px-3 py-2.5 text-body-sm text-foreground"
        >
          <CheckCircle2 aria-hidden="true" className="size-4 shrink-0" />
          Added to the media library.
        </p>
      ) : null}

      <Field htmlFor="external-kind" label="What is it?" required>
        <Select
          id="external-kind"
          value={kind}
          onChange={(event) => setKind(event.target.value as 'IMAGE' | 'VIDEO')}
        >
          <option value="VIDEO">Video — YouTube or Google Drive</option>
          <option value="IMAGE">Image — Google Drive</option>
        </Select>
      </Field>

      <Field
        htmlFor="external-url"
        label="Link"
        required
        hint={
          kind === 'VIDEO'
            ? 'Paste a YouTube link, or a Google Drive link for large videos.'
            : 'Paste a Google Drive link to the image.'
        }
        error={looksInvalid ? 'That link was not recognised.' : undefined}
      >
        <Input
          id="external-url"
          type="url"
          inputMode="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          aria-invalid={looksInvalid}
          placeholder="https://…"
          required
        />
      </Field>

      {/* Immediate confirmation that the link was understood. */}
      {parsed ? (
        <div className="flex items-start gap-3 rounded-md border border-success bg-success-soft px-3 py-3">
          <Link2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
          <div className="min-w-0 text-body-sm">
            <p className="font-medium text-foreground">
              Recognised as{' '}
              {parsed.provider === 'YOUTUBE' ? 'a YouTube video' : 'a Google Drive file'}
            </p>
            <p className="mt-0.5 break-all text-caption text-foreground-muted">
              ID {parsed.id}
            </p>
          </div>
        </div>
      ) : null}

      <Field
        htmlFor="external-title"
        label="Name"
        required
        hint="How this appears in the media library. Describe the occasion, not a child."
      >
        <Input
          id="external-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </Field>

      {parsed?.provider === 'GOOGLE_DRIVE' ? (
        <p className="flex items-start gap-2 rounded-md border border-warning bg-warning-soft px-3 py-2.5 text-body-sm text-gold-900">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{DRIVE_SHARING_NOTE}</span>
        </p>
      ) : null}

      {/* Stated plainly rather than buried, because it is a real limitation of
          linking rather than uploading. */}
      <p className="rounded-md border border-border bg-surface-sunken px-3 py-2.5 text-caption text-foreground-muted">
        <strong className="font-medium text-foreground">
          Linked media is not under the school&rsquo;s control here.
        </strong>{' '}
        If the file is deleted or its sharing changes, it disappears from the
        website without warning. Location data cannot be removed from a file we
        did not upload, so it is not claimed to be. For photographs of children,
        uploading is the safer option.
      </p>

      <div>
        <Button
          type="submit"
          disabled={pending || !parsed || title.trim().length === 0}
          aria-busy={pending}
        >
          {pending ? 'Adding…' : 'Add to library'}
        </Button>
      </div>
    </form>
  );
}
