'use client';

import { AlertCircle, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Field } from '@/components/forms/Field';
import { Button } from '@/components/ui/Button';
import { Checkbox, Input, Select } from '@/components/ui/Input';
import { createUser, updateUser } from '@/lib/actions/users';

interface UserFormProps {
  initial?: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
}

const ROLES = [
  {
    value: 'EDITOR',
    label: 'Editor',
    description: 'Creates and publishes content. Cannot see admission enquiries.',
  },
  {
    value: 'ADMISSIONS_MANAGER',
    label: 'Admissions',
    description: 'Works admission enquiries. Cannot edit website content.',
  },
  {
    value: 'SUPER_ADMIN',
    label: 'Administrator',
    description: 'Full control, including settings, users and the audit log.',
  },
] as const;

export function UserForm({ initial }: UserFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initial);

  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);
  const [role, setRole] = React.useState(initial?.role ?? 'EDITOR');

  const selectedRole = ROLES.find((option) => option.value === role);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFieldErrors({});

    const form = new FormData(event.currentTarget);

    const result = isEdit
      ? await updateUser({
          id: initial!.id,
          name: String(form.get('name') ?? ''),
          role: String(form.get('role') ?? ''),
          isActive: form.get('isActive') === 'on',
        })
      : await createUser({
          name: String(form.get('name') ?? ''),
          email: String(form.get('email') ?? ''),
          password: String(form.get('password') ?? ''),
          role: String(form.get('role') ?? ''),
        });

    setPending(false);

    if (result.ok) {
      router.push('/admin/users');
      router.refresh();
      return;
    }

    if (result.fieldErrors) {
      const mapped: Record<string, string> = {};
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        if (messages[0]) mapped[field] = messages[0];
      }
      setFieldErrors(mapped);
    }

    setError(result.error);
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-5" noValidate>
      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-error bg-error-soft px-3 py-2.5 text-body-sm text-error"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <Field htmlFor="name" label="Full name" required error={fieldErrors.name}>
        <Input
          id="name"
          name="name"
          defaultValue={initial?.name}
          required
          aria-invalid={Boolean(fieldErrors.name)}
        />
      </Field>

      <Field
        htmlFor="email"
        label="Email address"
        required
        hint={isEdit ? 'The sign-in address cannot be changed.' : 'Used to sign in.'}
        error={fieldErrors.email}
      >
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={initial?.email}
          // Changing a sign-in identity is an account-takeover vector, so it is
          // not editable here. Create a new account instead.
          readOnly={isEdit}
          required={!isEdit}
          aria-invalid={Boolean(fieldErrors.email)}
        />
      </Field>

      {!isEdit ? (
        <Field
          htmlFor="password"
          label="Initial password"
          required
          hint="At least 12 characters. Length matters far more than mixing symbols — share it with the person directly and ask them to change it."
          error={fieldErrors.password}
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            aria-invalid={Boolean(fieldErrors.password)}
          />
        </Field>
      ) : null}

      <Field htmlFor="role" label="Role" required error={fieldErrors.role}>
        <Select
          id="role"
          name="role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
        >
          {ROLES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      {selectedRole ? (
        <p className="flex items-start gap-2 rounded-md border border-info bg-info-soft px-3 py-2.5 text-body-sm text-foreground-muted">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-info" />
          <span>{selectedRole.description}</span>
        </p>
      ) : null}

      {isEdit ? (
        <div className="flex items-start gap-2.5">
          <Checkbox
            id="isActive"
            name="isActive"
            defaultChecked={initial?.isActive}
            className="mt-0.5"
          />
          <label htmlFor="isActive" className="text-body-sm text-foreground">
            Account is active
            <span className="block text-caption text-foreground-muted">
              Deactivating signs the person out immediately and blocks sign-in.
              Accounts are never deleted, so their history stays intact.
            </span>
          </label>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-border pt-5">
        <Button type="submit" disabled={pending} aria-busy={pending}>
          {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create account'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/users')}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
