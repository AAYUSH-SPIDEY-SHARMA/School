'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { Field, describedBy } from '@/components/forms/Field';
import { Button } from '@/components/ui/Button';
import { Checkbox, Input, Select, Textarea } from '@/components/ui/Input';
import { createNews, updateNews } from '@/lib/actions/news';
import {
  newsSchema,
  type NewsFormValues,
  type NewsInput,
} from '@/lib/validations/content';
import { slugify } from '@/lib/utils/slug';

interface NewsFormProps {
  /** Present when editing; absent when creating. */
  initial?: NewsFormValues & { id: string };
}

/**
 * News editor.
 *
 * Client validation here is USER EXPERIENCE ONLY — it exists so an editor sees
 * a mistake before submitting. The same Zod schema runs again on the server,
 * which is where the real check happens: the Server Action is a directly
 * invocable endpoint and never trusts what the form did (locked rules B and E).
 *
 * The slug auto-fills from the title while creating, then stops following it
 * once the article has been saved. Silently changing a published slug would
 * break every existing link to it; a deliberate edit still works and is
 * recorded in SlugHistory as a 301.
 */
export function NewsForm({ initial }: NewsFormProps) {
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
    // Three generics: values held by the form, context, and the transformed
    // values the submit handler receives after the resolver has applied
    // defaults. Omitting the third is what makes the resolver appear
    // incompatible.
  } = useForm<NewsFormValues, unknown, NewsInput>({
    resolver: zodResolver(newsSchema),
    defaultValues: initial ?? {
      title: '',
      slug: '',
      excerpt: '',
      body: '',
      coverImageId: '',
      category: '',
      featured: false,
      authorName: '',
      status: 'DRAFT',
      seoTitle: '',
      seoDescription: '',
    },
  });

  /**
   * Derive the slug from the title until the editor takes control of it.
   *
   * Done in the change handler rather than an effect watching the title:
   * writing state from an effect causes a cascading render, and the slug is a
   * consequence of the keystroke, not of the rendered value.
   */
  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!slugTouched) {
      setValue('slug', slugify(event.target.value), { shouldValidate: false });
    }
  }

  async function onSubmit(values: NewsInput) {
    setFormError(null);

    const result = isEdit
      ? await updateNews({ ...values, id: initial!.id })
      : await createNews(values);

    if (result.ok) {
      router.push('/admin/news');
      // Refresh so the listing reflects the write immediately rather than
      // showing a stale cached page.
      router.refresh();
      return;
    }

    // Map server-side field errors back onto the form, so the message appears
    // beside the offending input rather than as a generic banner.
    if (result.fieldErrors) {
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        const message = messages[0];
        if (message && field in values) {
          setError(field as keyof NewsFormValues, { type: 'server', message });
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
              {...register('title', { onChange: handleTitleChange })}
            />
          </Field>

          <Field
            htmlFor="slug"
            label="URL"
            required
            hint={
              isEdit
                ? 'Changing this creates a permanent redirect from the old address, so existing links keep working.'
                : 'Filled in from the title. You can edit it.'
            }
            error={errors.slug?.message}
          >
            <Input
              id="slug"
              aria-invalid={Boolean(errors.slug)}
              aria-describedby={describedBy('slug', true, Boolean(errors.slug))}
              {...register('slug', {
                onChange: () => setSlugTouched(true),
              })}
            />
          </Field>

          <Field
            htmlFor="excerpt"
            label="Summary"
            hint="Shown on listing cards and used as the search-result description."
            error={errors.excerpt?.message}
          >
            <Textarea
              id="excerpt"
              rows={3}
              aria-invalid={Boolean(errors.excerpt)}
              aria-describedby={describedBy('excerpt', true, Boolean(errors.excerpt))}
              {...register('excerpt')}
            />
          </Field>

          <Field htmlFor="body" label="Article" required error={errors.body?.message}>
            <Textarea
              id="body"
              rows={16}
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

          <Field
            htmlFor="category"
            label="Category"
            hint="A free-text tag, for filtering the news listing."
            error={errors.category?.message}
          >
            <Input id="category" {...register('category')} />
          </Field>

          <Field
            htmlFor="authorName"
            label="Byline"
            hint="The name shown on the article, if different from your account."
            error={errors.authorName?.message}
          >
            <Input id="authorName" {...register('authorName')} />
          </Field>

          <div className="flex items-start gap-2.5">
            <Checkbox id="featured" className="mt-0.5" {...register('featured')} />
            <label htmlFor="featured" className="text-body-sm text-foreground">
              Feature on the homepage
            </label>
          </div>

          <fieldset className="flex flex-col gap-4 rounded-md border border-border p-4">
            <legend className="px-1 text-label font-medium text-foreground">
              Search engine listing
            </legend>

            <Field
              htmlFor="seoTitle"
              label="SEO title"
              hint="Falls back to the article title."
              error={errors.seoTitle?.message}
            >
              <Input id="seoTitle" {...register('seoTitle')} />
            </Field>

            <Field
              htmlFor="seoDescription"
              label="SEO description"
              hint="Falls back to the summary."
              error={errors.seoDescription?.message}
            >
              <Textarea id="seoDescription" rows={3} {...register('seoDescription')} />
            </Field>
          </fieldset>
        </aside>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-border pt-5">
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create article'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/news')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
