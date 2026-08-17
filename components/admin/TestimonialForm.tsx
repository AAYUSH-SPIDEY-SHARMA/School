'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { Field, describedBy } from '@/components/forms/Field';
import { Button } from '@/components/ui/Button';
import { Checkbox, Input, Select, Textarea } from '@/components/ui/Input';
import { createTestimonial, updateTestimonial } from '@/lib/actions/testimonials';
import {
  testimonialSchema,
  type TestimonialFormValues,
  type TestimonialInput,
} from '@/lib/validations/content';

interface TestimonialFormProps {
  initial?: TestimonialFormValues & { id: string };
}

export function TestimonialForm({ initial }: TestimonialFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initial);
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TestimonialFormValues, unknown, TestimonialInput>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: initial ?? {
      quote: '',
      authorName: '',
      authorType: 'PARENT',
      authorDetail: '',
      photoId: '',
      featured: false,
      status: 'DRAFT',
    },
  });

  async function onSubmit(values: TestimonialInput) {
    setFormError(null);

    const result = isEdit
      ? await updateTestimonial({ ...values, id: initial!.id })
      : await createTestimonial(values);

    if (result.ok) {
      router.push('/admin/testimonials');
      router.refresh();
      return;
    }

    if (result.fieldErrors) {
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        const message = messages[0];
        if (message && field in values) {
          setError(field as keyof TestimonialFormValues, { type: 'server', message });
        }
      }
    }

    setFormError(result.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-5" noValidate>
      {formError ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-error bg-error-soft px-3 py-2.5 text-body-sm text-error"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{formError}</span>
        </div>
      ) : null}

      {/* Stated at the point of entry, because there is no technical control
          that can tell a genuine parent quote from an invented one. */}
      <p className="flex items-start gap-2 rounded-md border border-warning bg-warning-soft px-3 py-2.5 text-body-sm text-gold-900">
        <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>
          Only publish testimonials that were actually given, by a real person
          who agreed to have them shown. A written or emailed permission is worth
          keeping. Invented praise on a school&rsquo;s website misleads families
          making a six-year decision.
        </span>
      </p>

      <Field htmlFor="quote" label="What they said" required error={errors.quote?.message}>
        <Textarea
          id="quote"
          rows={6}
          aria-invalid={Boolean(errors.quote)}
          aria-describedby={describedBy('quote', false, Boolean(errors.quote))}
          {...register('quote')}
        />
      </Field>

      <Field
        htmlFor="authorName"
        label="Who said it"
        required
        error={errors.authorName?.message}
      >
        <Input
          id="authorName"
          aria-invalid={Boolean(errors.authorName)}
          {...register('authorName')}
        />
      </Field>

      <Field htmlFor="authorType" label="Relationship" required>
        <Select id="authorType" {...register('authorType')}>
          <option value="PARENT">Parent</option>
          <option value="ALUMNI">Alumnus</option>
          <option value="STUDENT">Student</option>
        </Select>
      </Field>

      <Field
        htmlFor="authorDetail"
        label="Context"
        hint='For example: "Parent, Class 5". Avoid anything that identifies a child more than necessary.'
        error={errors.authorDetail?.message}
      >
        <Input id="authorDetail" {...register('authorDetail')} />
      </Field>

      <Field htmlFor="status" label="Status" required>
        <Select id="status" {...register('status')}>
          <option value="DRAFT">Draft — not visible publicly</option>
          <option value="PUBLISHED">Published — live on the site</option>
          <option value="ARCHIVED">Archived</option>
        </Select>
      </Field>

      <div className="flex items-start gap-2.5">
        <Checkbox id="featured" className="mt-0.5" {...register('featured')} />
        <label htmlFor="featured" className="text-body-sm text-foreground">
          Feature on the homepage
        </label>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-border pt-5">
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add testimonial'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/testimonials')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
