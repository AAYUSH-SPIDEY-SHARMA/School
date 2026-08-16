'use client';

import { AlertCircle } from 'lucide-react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/Button';
import { Field, describedBy } from '@/components/forms/Field';
import { Input } from '@/components/ui/Input';
import { signInAction } from '@/lib/actions/auth';

interface LoginFormProps {
  callbackUrl: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending}
      className="w-full"
      // Width is preserved while loading so the button does not resize and
      // shift the layout under the user's finger.
      aria-busy={pending}
    >
      {pending ? 'Signing in…' : 'Sign in'}
    </Button>
  );
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const [state, formAction] = useActionState(signInAction, null);

  const error = state && !state.ok ? state.error : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      {error ? (
        /* `role="alert"` so the failure is announced rather than only seen.
           Deliberately generic: it never reveals whether the account exists. */
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-error bg-error-soft px-3 py-2.5 text-body-sm text-error"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <Field htmlFor="email" label="Email address" required>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy('email', false, false)}
        />
      </Field>

      <Field htmlFor="password" label="Password" required>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy('password', false, false)}
        />
      </Field>

      <SubmitButton />

      <p className="text-caption text-foreground-muted">
        {/* Self-service reset is deliberately absent in v1: an email-based
            account-recovery flow is a meaningful attack surface to maintain for
            a handful of staff accounts (19_AUTHORIZATION_AND_ROLES). */}
        Forgotten your password? Ask a site administrator to reset it.
      </p>
    </form>
  );
}
