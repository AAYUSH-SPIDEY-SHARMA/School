'use client';

import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Field } from '@/components/forms/Field';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { updateSiteSettings } from '@/lib/actions/settings';
import { isPlaceholder } from '@/lib/constants/site';

interface SettingRow {
  key: string;
  value: string;
  group: string;
}

interface SettingsFormProps {
  settings: readonly SettingRow[];
}

/** Human labels and guidance, keyed by setting. */
const FIELD_META: Record<string, { label: string; hint?: string; type?: string }> = {
  'school.name': { label: 'School name' },
  'school.shortName': { label: 'Short name', hint: 'Used where space is tight.' },
  'school.address': { label: 'Address' },
  'school.city': { label: 'City' },
  'school.state': { label: 'State' },
  'school.postalCode': { label: 'PIN code' },
  'school.phone': { label: 'Phone number', type: 'tel' },
  'school.alternatePhone': { label: 'Alternate phone', type: 'tel' },
  'school.email': { label: 'Email address', type: 'email' },
  'school.admissionsEmail': { label: 'Admissions email', type: 'email' },
  'school.principalName': { label: 'Principal' },
  'school.affiliationNumber': { label: 'CBSE affiliation number' },
  'school.latitude': { label: 'Latitude', hint: 'For the map on the contact page.' },
  'school.longitude': { label: 'Longitude' },

  'stats.established': { label: 'Year established' },
  'stats.students': { label: 'Number of students' },
  'stats.faculty': { label: 'Number of teachers' },
  'stats.boardResult': { label: 'Board result (%)' },

  'seo.defaultTitle': { label: 'Default page title' },
  'seo.defaultDescription': {
    label: 'Default description',
    hint: 'Shown in search results for pages without their own description.',
  },
  'seo.defaultOgImage': { label: 'Default share image URL' },

  'admissions.cycleStatus': { label: 'Admissions status' },
  'admissions.academicYear': { label: 'Academic year', hint: 'Format: 2026-27' },

  'social.facebook': { label: 'Facebook URL' },
  'social.instagram': { label: 'Instagram URL' },
  'social.youtube': { label: 'YouTube URL' },
};

const GROUP_META: Record<string, { title: string; description: string }> = {
  contact: {
    title: 'School details',
    description: 'Shown in the header, footer, contact page and search results.',
  },
  stats: {
    title: 'Trust statistics',
    description:
      'Shown on the homepage. Only enter figures the school can stand behind — a wrong board result misleads families making a six-year decision.',
  },
  seo: {
    title: 'Search engines',
    description: 'How the site appears in search results and when shared.',
  },
  admissions: {
    title: 'Admissions cycle',
    description:
      'The most time-sensitive setting on the site. An out-of-date status tells parents they can still apply when they cannot.',
  },
  social: {
    title: 'Social media',
    description: 'Leave blank if the school does not use a platform. A broken link is worse than none.',
  },
};

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  const groups = React.useMemo(() => {
    const map = new Map<string, SettingRow[]>();
    for (const row of settings) {
      const existing = map.get(row.group);
      if (existing) existing.push(row);
      else map.set(row.group, [row]);
    }
    return map;
  }, [settings]);

  const placeholderCount = settings.filter((row) => isPlaceholder(row.value)).length;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);

    const form = new FormData(event.currentTarget);

    const payload = settings.map((row) => ({
      key: row.key,
      value: String(form.get(row.key) ?? ''),
    }));

    const result = await updateSiteSettings({ settings: payload });

    setPending(false);

    if (result.ok) {
      setSaved(true);
      router.refresh();
      return;
    }

    setError(result.error);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>
      {placeholderCount > 0 ? (
        <p className="rounded-md border border-warning bg-warning-soft px-4 py-3 text-body-sm text-gold-900">
          <strong className="font-medium">
            {placeholderCount} {placeholderCount === 1 ? 'value is' : 'values are'}{' '}
            still a placeholder.
          </strong>{' '}
          Anything shown in square brackets appears on the public site exactly as
          written, deliberately — nothing has been invented to fill the gap.
        </p>
      ) : null}

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
          Settings saved. The public site updates immediately.
        </p>
      ) : null}

      {[...groups.entries()].map(([group, rows]) => {
        const meta = GROUP_META[group];

        return (
          <fieldset key={group} className="rounded-lg border border-border bg-surface p-5">
            <legend className="px-2 text-h4 font-medium text-foreground">
              {meta?.title ?? group}
            </legend>

            {meta ? (
              <p className="mb-4 max-w-prose-measure text-body-sm text-foreground-muted">
                {meta.description}
              </p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              {rows.map((row) => {
                const field = FIELD_META[row.key];
                const label = field?.label ?? row.key;

                if (row.key === 'admissions.cycleStatus') {
                  return (
                    <Field key={row.key} htmlFor={row.key} label={label}>
                      <Select id={row.key} name={row.key} defaultValue={row.value}>
                        <option value="OPEN">Open — accepting enquiries</option>
                        <option value="OPENING_SOON">Opening soon</option>
                        <option value="CLOSED">Closed</option>
                      </Select>
                    </Field>
                  );
                }

                return (
                  <Field
                    key={row.key}
                    htmlFor={row.key}
                    label={label}
                    hint={field?.hint}
                  >
                    <Input
                      id={row.key}
                      name={row.key}
                      type={field?.type ?? 'text'}
                      defaultValue={row.value}
                      // Placeholder values are shown in a monospace face so an
                      // unfilled token is obvious at a glance in a long form.
                      className={
                        isPlaceholder(row.value)
                          ? 'font-mono text-foreground-muted'
                          : undefined
                      }
                    />
                  </Field>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      <div className="flex gap-3 border-t border-border pt-5">
        <Button type="submit" disabled={pending} aria-busy={pending}>
          {pending ? 'Saving…' : 'Save settings'}
        </Button>
      </div>
    </form>
  );
}
