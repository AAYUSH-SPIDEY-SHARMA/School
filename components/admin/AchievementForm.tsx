'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { Field, describedBy } from '@/components/forms/Field';
import { Button } from '@/components/ui/Button';
import { Checkbox, Input, Select, Textarea } from '@/components/ui/Input';
import { createAchievement, updateAchievement } from '@/lib/actions/achievements';
import {
  achievementSchema,
  type AchievementFormValues,
  type AchievementInput,
} from '@/lib/validations/content';

interface AchievementFormProps {
  initial?: AchievementFormValues & { id: string };
}

const TYPES = [
  { value: 'ACADEMIC', label: 'Academic' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'OLYMPIAD', label: 'Olympiad' },
  { value: 'CULTURAL', label: 'Cultural' },
  { value: 'SCHOOL', label: 'School-wide' },
] as const;

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

export function AchievementForm({ initial }: AchievementFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initial);
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AchievementFormValues, unknown, AchievementInput>({
    resolver: zodResolver(achievementSchema),
    defaultValues: initial ?? {
      title: '',
      description: '',
      type: 'ACADEMIC',
      achieverName: '',
      level: '',
      achievedOn: '',
      imageId: '',
      featured: false,
      status: 'DRAFT',
    },
  });

  async function onSubmit(values: AchievementInput) {
    setFormError(null);

    const result = isEdit
      ? await updateAchievement({ ...values, id: initial!.id })
      : await createAchievement(values);

    if (result.ok) {
      router.push('/admin/achievements');
      router.refresh();
      return;
    }

    if (result.fieldErrors) {
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        const message = messages[0];
        if (message && field in values) {
          setError(field as keyof AchievementFormValues, { type: 'server', message });
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
          <Field htmlFor="title" label="Achievement" required error={errors.title?.message}>
            <Input
              id="title"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={describedBy('title', false, Boolean(errors.title))}
              {...register('title')}
            />
          </Field>

          <Field htmlFor="description" label="Details" error={errors.description?.message}>
            <Textarea id="description" rows={6} {...register('description')} />
          </Field>

          {/* ⚠️ The highest-identification-risk field on the site. Naming a
              student publicly is a child-privacy decision, not a content
              choice, and the form says so at the point of decision rather than
              in a policy document nobody opens. */}
          <Field
            htmlFor="achieverName"
            label="Student or team name"
            hint="Optional. Leave blank unless you have consent for this specific recognition."
            error={errors.achieverName?.message}
          >
            <Input id="achieverName" {...register('achieverName')} />
          </Field>

          <p className="flex items-start gap-2 rounded-md border border-warning bg-warning-soft px-3 py-2.5 text-body-sm text-gold-900">
            <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>
              Naming a student publicly is a child-privacy decision. Recognition
              is good for the child and the school, and it is also the highest
              identification risk on the site. Where full identification is not
              necessary, prefer a first name and class.
            </span>
          </p>
        </div>

        <aside className="flex flex-col gap-5">
          <Field htmlFor="status" label="Status" required error={errors.status?.message}>
            <Select id="status" {...register('status')}>
              <option value="DRAFT">Draft — not visible publicly</option>
              <option value="PUBLISHED">Published — live on the site</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          </Field>

          <Field htmlFor="type" label="Category" required error={errors.type?.message}>
            <Select id="type" {...register('type')}>
              {TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            htmlFor="level"
            label="Level"
            hint="School, district, state, national or international."
            error={errors.level?.message}
          >
            <Input id="level" {...register('level')} />
          </Field>

          <Field
            htmlFor="achievedOn"
            label="Date achieved"
            required
            error={errors.achievedOn?.message}
          >
            <Input
              id="achievedOn"
              type="date"
              defaultValue={toDateInput(initial?.achievedOn)}
              aria-invalid={Boolean(errors.achievedOn)}
              {...register('achievedOn', {
                setValueAs: (value: string) => (value ? new Date(value) : ''),
              })}
            />
          </Field>

          <div className="flex items-start gap-2.5">
            <Checkbox id="featured" className="mt-0.5" {...register('featured')} />
            <label htmlFor="featured" className="text-body-sm text-foreground">
              Feature on the homepage
            </label>
          </div>
        </aside>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-border pt-5">
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add achievement'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/achievements')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
