'use client';

import { AlertCircle, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Field } from '@/components/forms/Field';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { updateFacilities } from '@/lib/actions/settings';
import { ensureSlug } from '@/lib/utils/slug';

interface FacilityRow {
  id?: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  displayOrder: number;
  status: string;
}

interface FacilitiesEditorProps {
  facilities: readonly FacilityRow[];
}

const CATEGORIES = [
  { value: 'ACADEMIC', label: 'Academic' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'ARTS', label: 'Arts' },
  { value: 'SUPPORT', label: 'Support' },
  { value: 'SAFETY', label: 'Safety' },
] as const;

/**
 * Facilities editor.
 *
 * ⚠️ Facilities live inside Settings and are SUPER_ADMIN only (decision D-B23).
 * There is deliberately no `/admin/facilities` route: about a dozen records
 * changed roughly once a year does not justify a full CRUD module with its own
 * listing, pagination and permissions.
 *
 * The whole set is saved in one submission, which is why removing a row here
 * genuinely removes the facility on save rather than needing a separate delete.
 *
 * ⚠️ SAFETY-category facilities appear on the public Safety page. Only describe
 * provisions the school actually has — a claimed CCTV system or trained nurse
 * that does not exist is a safety misrepresentation to parents, not marketing.
 */
export function FacilitiesEditor({ facilities }: FacilitiesEditorProps) {
  const router = useRouter();
  const [rows, setRows] = React.useState<FacilityRow[]>(() => [...facilities]);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  function updateRow(index: number, patch: Partial<FacilityRow>) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function addRow() {
    setRows((current) => [
      ...current,
      {
        slug: '',
        name: '',
        description: '',
        category: 'ACADEMIC',
        displayOrder: current.length,
        status: 'DRAFT',
      },
    ]);
  }

  function removeRow(index: number) {
    setRows((current) => current.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setPending(true);
    setError(null);
    setSaved(false);

    const payload = rows.map((row, index) => ({
      ...(row.id ? { id: row.id } : {}),
      name: row.name,
      slug: row.slug || ensureSlug(row.name, 'facility'),
      description: row.description,
      category: row.category,
      displayOrder: index,
      status: row.status,
    }));

    const result = await updateFacilities({ facilities: payload });

    setPending(false);

    if (result.ok) {
      setSaved(true);
      router.refresh();
      return;
    }

    setError(result.error);
  }

  return (
    <div className="flex flex-col gap-5">
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
          Facilities saved.
        </p>
      ) : null}

      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-border-strong bg-surface-sunken px-4 py-6 text-center text-body-sm text-foreground-muted">
          No facilities added yet. These appear on the Infrastructure page and,
          for safety items, on the Safety page.
        </p>
      ) : null}

      <ul className="flex flex-col gap-4">
        {rows.map((row, index) => (
          <li
            key={row.id ?? `new-${index}`}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field htmlFor={`facility-name-${index}`} label="Name" required>
                <Input
                  id={`facility-name-${index}`}
                  value={row.name}
                  onChange={(event) => updateRow(index, { name: event.target.value })}
                />
              </Field>

              <Field htmlFor={`facility-category-${index}`} label="Category" required>
                <Select
                  id={`facility-category-${index}`}
                  value={row.category}
                  onChange={(event) =>
                    updateRow(index, { category: event.target.value })
                  }
                >
                  {CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                htmlFor={`facility-description-${index}`}
                label="Description"
                required
                className="sm:col-span-2"
                hint={
                  row.category === 'SAFETY'
                    ? 'This appears on the Safety page. Describe only provisions the school actually has.'
                    : undefined
                }
              >
                <Textarea
                  id={`facility-description-${index}`}
                  rows={3}
                  value={row.description}
                  onChange={(event) =>
                    updateRow(index, { description: event.target.value })
                  }
                />
              </Field>

              <Field htmlFor={`facility-status-${index}`} label="Status">
                <Select
                  id={`facility-status-${index}`}
                  value={row.status}
                  onChange={(event) => updateRow(index, { status: event.target.value })}
                >
                  <option value="DRAFT">Draft — hidden</option>
                  <option value="PUBLISHED">Published — visible</option>
                </Select>
              </Field>
            </div>

            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeRow(index)}
                aria-label={`Remove ${row.name || 'this facility'}`}
              >
                <Trash2 aria-hidden="true" className="size-4 text-error" />
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={addRow}>
          <Plus aria-hidden="true" />
          Add facility
        </Button>

        <Button type="button" onClick={handleSave} disabled={pending} aria-busy={pending}>
          {pending ? 'Saving…' : 'Save facilities'}
        </Button>
      </div>

      <p className="text-caption text-foreground-muted">
        Removing a facility here hides it from the site when you save. It is kept
        in the database and can be restored by an administrator.
      </p>
    </div>
  );
}
