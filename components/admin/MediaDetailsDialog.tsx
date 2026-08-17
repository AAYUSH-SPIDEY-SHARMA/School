'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { AlertCircle, Pencil, ShieldAlert, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Field } from '@/components/forms/Field';
import { Button } from '@/components/ui/Button';
import { Checkbox, Input, Textarea } from '@/components/ui/Input';
import { deleteMedia, updateMediaMetadata } from '@/lib/actions/media';

interface MediaDetailsDialogProps {
  asset: {
    id: string;
    fileName: string;
    altText: string | null;
    caption: string | null;
    containsMinors: boolean;
    consentBasis: string | null;
    source: string;
    metadataStripped: boolean;
  };
  canTakedown: boolean;
}

/**
 * Edit an asset's alt text, caption and consent record.
 *
 * ⚠️ These two fields are the whole safeguarding workflow:
 *
 *  - **Alt text** is required before the asset can be published (AR-009), and
 *    must describe the ACTIVITY. Never a child's name — alt text is
 *    machine-readable and indexable, so a name there is more exposed than one
 *    in a caption, not less.
 *
 *  - **Consent basis** is required whenever the image contains children. The
 *    system cannot verify consent; it has no student records and no exclusion
 *    list. All it can do is force the question, record the answer, and make the
 *    person who published it identifiable afterwards. That deliberate friction
 *    is the only control that actually catches an exclusion-list child.
 */
export function MediaDetailsDialog({ asset, canTakedown }: MediaDetailsDialogProps) {
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [altText, setAltText] = React.useState(asset.altText ?? '');
  const [caption, setCaption] = React.useState(asset.caption ?? '');
  const [containsMinors, setContainsMinors] = React.useState(asset.containsMinors);
  const [consentBasis, setConsentBasis] = React.useState(asset.consentBasis ?? '');

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const result = await updateMediaMetadata({
      id: asset.id,
      altText,
      caption,
      containsMinors,
      consentBasis,
    });

    setPending(false);

    if (result.ok) {
      setOpen(false);
      router.refresh();
      return;
    }

    setError(
      result.fieldErrors?.consentBasis?.[0] ?? result.error,
    );
  }

  async function handleRemove(takedown: boolean) {
    setPending(true);
    setError(null);

    const result = await deleteMedia({ id: asset.id, takedown });

    setPending(false);

    if (result.ok) {
      setOpen(false);
      router.refresh();
      return;
    }

    setError(result.error);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="sm" className="w-full">
          <Pencil aria-hidden="true" className="size-4" />
          Details
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-navy-900/60" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-xl focus:outline-none">
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title className="font-serif text-h3 text-foreground">
              Media details
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="inline-flex size-9 items-center justify-center rounded-md text-foreground-muted hover:bg-surface-sunken"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="mt-1 truncate text-body-sm text-foreground-muted">
            {asset.fileName}
          </Dialog.Description>

          {asset.source !== 'CLOUDINARY' ? (
            <p className="mt-4 flex items-start gap-2 rounded-md border border-warning bg-warning-soft px-3 py-2.5 text-body-sm text-gold-900">
              <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>
                This is a linked file, not one uploaded here. Its location data
                cannot be removed by this system, and it will disappear if the
                sharing setting changes.
              </span>
            </p>
          ) : !asset.metadataStripped ? (
            <p className="mt-4 flex items-start gap-2 rounded-md border border-error bg-error-soft px-3 py-2.5 text-body-sm text-error">
              <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>
                Location data could not be confirmed as removed from this file.
                Do not publish it until this is resolved.
              </span>
            </p>
          ) : null}

          <form onSubmit={handleSave} className="mt-5 flex flex-col gap-5">
            {error ? (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-md border border-error bg-error-soft px-3 py-2.5 text-body-sm text-error"
              >
                <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {error}
              </p>
            ) : null}

            <Field
              htmlFor={`alt-${asset.id}`}
              label="Alt text"
              required
              hint="Describe what is happening, for someone who cannot see the image. Never use a child's name — this text is indexed by search engines."
            >
              <Textarea
                id={`alt-${asset.id}`}
                rows={3}
                value={altText}
                onChange={(event) => setAltText(event.target.value)}
              />
            </Field>

            <Field
              htmlFor={`caption-${asset.id}`}
              label="Caption"
              hint="Shown beneath the image. A class or year group is fine; avoid full names of students."
            >
              <Input
                id={`caption-${asset.id}`}
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
              />
            </Field>

            <div className="rounded-md border border-border bg-surface-sunken p-4">
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id={`minors-${asset.id}`}
                  checked={containsMinors}
                  onChange={(event) => setContainsMinors(event.target.checked)}
                  className="mt-0.5"
                />
                <label
                  htmlFor={`minors-${asset.id}`}
                  className="text-body-sm font-medium text-foreground"
                >
                  This shows identifiable children
                </label>
              </div>

              {containsMinors ? (
                <div className="mt-4">
                  <Field
                    htmlFor={`consent-${asset.id}`}
                    label="Consent basis"
                    required
                    hint='Record how consent was obtained and that the exclusion list was checked — for example "Admission media consent 2026-27; exclusion list checked 17 Aug 2026".'
                  >
                    <Textarea
                      id={`consent-${asset.id}`}
                      rows={2}
                      value={consentBasis}
                      onChange={(event) => setConsentBasis(event.target.value)}
                    />
                  </Field>

                  <p className="mt-3 text-caption text-foreground-muted">
                    This system cannot check consent for you — it has no student
                    records and no exclusion list. Only the school knows which
                    children must not appear.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
              <div className="flex gap-2">
                <Button type="submit" disabled={pending} aria-busy={pending}>
                  {pending ? 'Saving…' : 'Save'}
                </Button>
                <Dialog.Close asChild>
                  <Button type="button" variant="ghost" disabled={pending}>
                    Cancel
                  </Button>
                </Dialog.Close>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => void handleRemove(false)}
                >
                  Remove
                </Button>

                {/* The safeguarding path: deletes from the provider and purges
                    the CDN, and does not wait on a soft-delete window. */}
                {canTakedown ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={pending}
                    onClick={() => void handleRemove(true)}
                  >
                    Takedown
                  </Button>
                ) : null}
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
