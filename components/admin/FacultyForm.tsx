'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { Field, describedBy } from '@/components/forms/Field';
import { Button } from '@/components/ui/Button';
import { Checkbox, Input, Select, Textarea } from '@/components/ui/Input';
import { createFaculty, updateFaculty } from '@/lib/actions/faculty';
import { slugify } from '@/lib/utils/slug';
import {
  facultySchema,
  type FacultyFormValues,
  type FacultyInput,
} from '@/lib/validations/content';

interface FacultyFormProps {
  initial?: FacultyFormValues & { id: string };
  departments: readonly { id: string; name: string }[];
}

export function FacultyForm({ initial, departments }: FacultyFormProps) {
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
  } = useForm<FacultyFormValues, unknown, FacultyInput>({
    resolver: zodResolver(facultySchema),
    defaultValues: initial ?? {
      name: '',
      slug: '',
      designation: '',
      qualification: '',
      experienceYears: null,
      bio: '',
      photoId: '',
      departmentId: '',
      isLeadership: false,
      displayOrder: 0,
      status: 'DRAFT',
      seoTitle: '',
      seoDescription: '',
    },
  });

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!slugTouched) {
      setValue('slug', slugify(event.target.value), { shouldValidate: false });
    }
  }

  async function onSubmit(values: FacultyInput) {
    setFormError(null);

    const result = isEdit
      ? await updateFaculty({ ...values, id: initial!.id })
      : await createFaculty(values);

    if (result.ok) {
      router.push('/admin/faculty');
      router.refresh();
      return;
    }

    if (result.fieldErrors) {
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        const message = messages[0];
        if (message && field in values) {
          setError(field as keyof FacultyFormValues, { type: 'server', message });
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
          <Field htmlFor="name" label="Full name" required error={errors.name?.message}>
            <Input
              id="name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={describedBy('name', false, Boolean(errors.name))}
              {...register('name', { onChange: handleNameChange })}
            />
          </Field>

          <Field
            htmlFor="designation"
            label="Designation"
            required
            hint="For example: Principal, Head of Mathematics, Primary Teacher."
            error={errors.designation?.message}
          >
            <Input
              id="designation"
              aria-invalid={Boolean(errors.designation)}
              {...register('designation')}
            />
          </Field>

          <Field
            htmlFor="qualification"
            label="Qualifications"
            hint="Teacher quality is one of the things parents look at most closely, so this is worth filling in."
            error={errors.qualification?.message}
          >
            <Input id="qualification" {...register('qualification')} />
          </Field>

          <Field htmlFor="bio" label="Biography" error={errors.bio?.message}>
            <Textarea id="bio" rows={10} {...register('bio')} />
          </Field>

          <Field
            htmlFor="slug"
            label="URL"
            required
            hint={
              isEdit
                ? 'Changing this creates a permanent redirect from the old address.'
                : 'Filled in from the name.'
            }
            error={errors.slug?.message}
          >
            <Input
              id="slug"
              aria-invalid={Boolean(errors.slug)}
              {...register('slug', { onChange: () => setSlugTouched(true) })}
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

          <Field htmlFor="departmentId" label="Department" error={errors.departmentId?.message}>
            <Select id="departmentId" {...register('departmentId')}>
              <option value="">No department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            htmlFor="experienceYears"
            label="Years of experience"
            error={errors.experienceYears?.message}
          >
            <Input
              id="experienceYears"
              type="number"
              min={0}
              max={70}
              {...register('experienceYears', {
                setValueAs: (value: string) => (value === '' ? null : Number(value)),
              })}
            />
          </Field>

          <Field
            htmlFor="displayOrder"
            label="Display order"
            hint="Lower numbers appear first. Leave at 0 to sort alphabetically."
            error={errors.displayOrder?.message}
          >
            <Input id="displayOrder" type="number" min={0} {...register('displayOrder')} />
          </Field>

          <div className="flex items-start gap-2.5">
            <Checkbox id="isLeadership" className="mt-0.5" {...register('isLeadership')} />
            <label htmlFor="isLeadership" className="text-body-sm text-foreground">
              Part of the leadership team
              <span className="block text-caption text-foreground-muted">
                Also appears on the Leadership page. Leadership are faculty, so
                there is only ever one record per person.
              </span>
            </label>
          </div>
        </aside>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-border pt-5">
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add teacher'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/faculty')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
