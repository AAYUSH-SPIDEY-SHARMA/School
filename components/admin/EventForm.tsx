'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { Field, describedBy } from '@/components/forms/Field';
import { Button } from '@/components/ui/Button';
import { Checkbox, Input, Select, Textarea } from '@/components/ui/Input';
import { createEvent, updateEvent } from '@/lib/actions/events';
import { slugify } from '@/lib/utils/slug';
import {
  eventSchema,
  type EventFormValues,
  type EventInput,
} from '@/lib/validations/content';

interface EventFormProps {
  initial?: EventFormValues & { id: string };
}

/** `<input type="date">` needs `yyyy-mm-dd`. */
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

export function EventForm({ initial }: EventFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [formError, setFormError] = React.useState<string | null>(null);
  const [slugTouched, setSlugTouched] = React.useState(isEdit);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues, unknown, EventInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: initial ?? {
      title: '',
      slug: '',
      description: '',
      startDate: '',
      endDate: null,
      venue: '',
      coverImageId: '',
      isAcademicCalendar: false,
      status: 'DRAFT',
      seoTitle: '',
      seoDescription: '',
    },
  });

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!slugTouched) {
      setValue('slug', slugify(event.target.value), { shouldValidate: false });
    }
  }

  async function onSubmit(values: EventInput) {
    setFormError(null);

    const result = isEdit
      ? await updateEvent({ ...values, id: initial!.id })
      : await createEvent(values);

    if (result.ok) {
      router.push('/admin/events');
      router.refresh();
      return;
    }

    if (result.fieldErrors) {
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        const message = messages[0];
        if (message && field in values) {
          setError(field as keyof EventFormValues, { type: 'server', message });
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
          <Field htmlFor="title" label="Event name" required error={errors.title?.message}>
            <Input
              id="title"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={describedBy('title', false, Boolean(errors.title))}
              {...register('title', { onChange: handleTitleChange })}
            />
          </Field>

          <Field
            htmlFor="slug"
            label="URL"
            required
            hint={
              isEdit
                ? 'Changing this creates a permanent redirect from the old address.'
                : 'Filled in from the name. You can edit it.'
            }
            error={errors.slug?.message}
          >
            <Input
              id="slug"
              aria-invalid={Boolean(errors.slug)}
              {...register('slug', { onChange: () => setSlugTouched(true) })}
            />
          </Field>

          <Field
            htmlFor="description"
            label="Description"
            required
            error={errors.description?.message}
          >
            <Textarea
              id="description"
              rows={12}
              aria-invalid={Boolean(errors.description)}
              {...register('description')}
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

          <Field
            htmlFor="startDate"
            label="Starts on"
            required
            error={errors.startDate?.message}
          >
            <Input
              id="startDate"
              type="date"
              defaultValue={toDateInput(initial?.startDate)}
              aria-invalid={Boolean(errors.startDate)}
              {...register('startDate', {
                setValueAs: (value: string) => (value ? new Date(value) : ''),
              })}
            />
          </Field>

          <Field
            htmlFor="endDate"
            label="Ends on"
            hint="Only needed for events running over more than one day. A multi-day event stays listed as upcoming until its end date."
            error={errors.endDate?.message}
          >
            <Input
              id="endDate"
              type="date"
              defaultValue={toDateInput(initial?.endDate)}
              aria-invalid={Boolean(errors.endDate)}
              {...register('endDate', {
                setValueAs: (value: string) => (value ? new Date(value) : null),
              })}
            />
          </Field>

          <Field htmlFor="venue" label="Venue" error={errors.venue?.message}>
            <Input id="venue" {...register('venue')} />
          </Field>

          <div className="flex items-start gap-2.5">
            <Checkbox
              id="isAcademicCalendar"
              className="mt-0.5"
              {...register('isAcademicCalendar')}
            />
            <label htmlFor="isAcademicCalendar" className="text-body-sm text-foreground">
              Show on the academic calendar
              <span className="block text-caption text-foreground-muted">
                For term dates, examinations and holidays.
              </span>
            </label>
          </div>

          <fieldset className="flex flex-col gap-4 rounded-md border border-border p-4">
            <legend className="px-1 text-label font-medium text-foreground">
              Search engine listing
            </legend>

            <Field htmlFor="seoTitle" label="SEO title" hint="Falls back to the event name.">
              <Input id="seoTitle" {...register('seoTitle')} />
            </Field>

            <Field
              htmlFor="seoDescription"
              label="SEO description"
              hint="Falls back to the description."
            >
              <Textarea id="seoDescription" rows={3} {...register('seoDescription')} />
            </Field>
          </fieldset>
        </aside>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-border pt-5">
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create event'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/events')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
