import { AlertCircle } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils/cn';

interface FieldProps {
  /** Must match the control's `id`. */
  htmlFor: string;
  label: string;
  /** Guidance shown ABOVE the control, so it is read before the input. */
  hint?: string;
  error?: string | undefined;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * A labelled form field.
 *
 * Non-negotiables, all enforced by this component so no individual form can
 * forget one (10_DESIGN_SYSTEM, 26_ACCESSIBILITY):
 *
 *  - a VISIBLE `<label>`, programmatically associated. Never
 *    placeholder-as-label: the placeholder vanishes the moment typing starts,
 *    which is exactly when a distracted parent needs to check what the field
 *    was for
 *  - required state indicated IN TEXT, not by a red asterisk alone
 *  - errors inline, specific, `aria-describedby`-linked and announced via
 *    `role="alert"`
 *  - error state carries colour AND icon AND text, so it survives both
 *    colour-blindness and a monochrome print
 *  - hint text sits ABOVE the control, not below the error, where it would be
 *    read after the correction it was meant to prevent
 */
export function Field({
  htmlFor,
  label,
  hint,
  error,
  required = false,
  className,
  children,
}: FieldProps) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="text-label font-medium text-foreground"
      >
        {label}
        {required ? (
          <span className="ml-1 text-foreground-muted">(required)</span>
        ) : (
          <span className="ml-1 text-foreground-subtle">(optional)</span>
        )}
      </label>

      {hint ? (
        <p id={hintId} className="text-caption text-foreground-muted">
          {hint}
        </p>
      ) : null}

      {/* The control is cloned by the caller with aria-describedby set to
          `describedBy(htmlFor, hint, error)`. */}
      {children}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="flex items-start gap-1.5 text-body-sm text-error"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

/**
 * Build the `aria-describedby` value for a control inside a `Field`.
 *
 * Exists so the id convention lives in one place — a mismatched id produces a
 * field whose error is invisible to a screen reader while looking correct.
 */
export function describedBy(
  id: string,
  hasHint: boolean,
  hasError: boolean,
): string | undefined {
  const ids = [
    hasHint ? `${id}-hint` : null,
    hasError ? `${id}-error` : null,
  ].filter(Boolean);

  return ids.length > 0 ? ids.join(' ') : undefined;
}
