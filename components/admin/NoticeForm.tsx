'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { Field, describedBy } from '@/components/forms/Field';
import { Button } from '@/components/ui/Button';
import { Checkbox, Input, Select, Textarea } from '@/components/ui/Input';
import { createNotice, updateNotice } from '@/lib/actions/notices';
import {
  noticeSchema,
  type NoticeFormValues,
  type NoticeInput,
} from '@/lib/validations/content';

interface NoticeFormProps {
  initial?: NoticeFormValues & { id: string };
}

const CATEGORIES = [
  { value: 'GENERAL', label: 'General' },
  { value: 'ACADEMIC', label: 'Academic' },
  { value: 'EXAMINATION', label: 'Examination' },
  { value: 'EVENT', label: 'Event' },
  { value: 'HOLIDAY', label: 'Holiday' },
  { value: 'CBSE', label: 'CBSE' },
] as const;

/**
 * `<input type="date">` needs `yyyy-mm-dd`.
 *
 * Takes `unknown` because `z.coerce.date()` accepts anything on the way in, so
 * the form's input type for this field is genuinely `unknown` rather than
 * `Date`. Narrowing here is more honest than casting at the call site.
 */
function toDateInput(value: unknown): string {
  if (!value) return '';

  const date =
    value instanceof Date
      ? value
      : typeof value === 'string' || typeof value === 'number'
        ? new Date(value)
        : null;

  if (!date || Number.isNaN(date.getTime())) return '';

  return date.toISOString().slice(0, 10);
}

export function NoticeForm({ initial }: NoticeFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initial);
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NoticeFormValues, unknown, NoticeInput>({
    resolver: zodResolver(noticeSchema),
    defaultValues: initial ?? {
      title: '',
      body: '',
      category: 'GENERAL',
      attachmentId: '',
      pinned: false,
      expiresAt: null,
      status: 'DRAFT',
    },
  });

  async function onSubmit(values: NoticeInput) {
    setFormError(null);

    const result = isEdit
      ? await updateNotice({ ...values, id: initial!.id })
      : await createNotice(values);

    if (result.ok) {
      router.push('/admin/notices');
      router.refresh();
      return;
    }

    if (result.fieldErrors) {
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        const message = messages[0];
        if (message && field in values) {
          setError(field as keyof NoticeFormValues, { type: 'server', message });
        }
      }
    }

    setFormError(result.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      {formError ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-error bg-error-soft px-3 py-2.5 text-body-sm text-error"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{formError}</span>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <Field htmlFor="title" label="Title" required error={errors.title?.message}>
            <Input
              id="title"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={describedBy('title', false, Boolean(errors.title))}
              {...register('title')}
            />
          </Field>

          <Field htmlFor="body" label="Notice" required error={errors.body?.message}>
            <Textarea
              id="body"
              rows={10}
              aria-invalid={Boolean(errors.body)}
              aria-describedby={describedBy('body', false, Boolean(errors.body))}
              {...register('body')}
            />
          </Field>
        </div>

        <aside className="flex flex-col gap-5">
          <Field htmlFor="status" label="Status" required error={errors.status?.message}>
            <Select id="status" {...register('status')}>
              <option value="DRAFT">Draft — not visible publicly</option>
              <option value="PUBLISHED">Published — live on the site</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          </Field>

          <Field htmlFor="category" label="Category" required error={errors.category?.message}>
            <Select id="category" {...register('category')}>
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Select>
          </Field>

          {/* The single most important field on this form. */}
          <Field
            htmlFor="expiresAt"
            label="Remove from the site on"
            hint="After this date the notice disappears automatically. Leave blank only for notices that genuinely never go out of date."
            error={errors.expiresAt?.message}
          >
            <Input
              id="expiresAt"
              type="date"
              defaultValue={toDateInput(initial?.expiresAt)}
              aria-invalid={Boolean(errors.expiresAt)}
              aria-describedby={describedBy('expiresAt', true, Boolean(errors.expiresAt))}
              {...register('expiresAt', {
                setValueAs: (value: string) => (value ? new Date(value) : null),
              })}
            />
          </Field>

          <p className="flex items-start gap-2 rounded-md border border-info bg-info-soft px-3 py-2.5 text-caption text-foreground-muted">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-info" />
            <span>
              Notices without an expiry date stay live until somebody removes
              them by hand. That is how school websites end up showing notices
              from several years ago.
            </span>
          </p>

          <div className="flex items-start gap-2.5">
            <Checkbox id="pinned" className="mt-0.5" {...register('pinned')} />
            <label htmlFor="pinned" className="text-body-sm text-foreground">
              Pin to the top of the list
            </label>
          </div>
        </aside>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-border pt-5">
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create notice'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/notices')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
