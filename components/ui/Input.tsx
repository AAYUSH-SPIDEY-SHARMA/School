import * as React from 'react';

import { cn } from '@/lib/utils/cn';

/**
 * Form controls.
 *
 * All are 44px minimum height — the WCAG 2.5.8 target size, and the primary
 * persona is tapping on a phone (26_ACCESSIBILITY).
 *
 * `aria-invalid` drives the error styling rather than a separate `error` prop,
 * so the visual state cannot drift from the state announced to a screen reader.
 * Error state is never colour alone: it combines colour, an icon and text
 * (10_DESIGN_SYSTEM).
 */

const controlBase = cn(
  'w-full rounded-md border border-border bg-surface px-3 text-body text-foreground',
  'placeholder:text-foreground-subtle',
  'transition-colors duration-(--duration-fast)',
  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring',
  'disabled:cursor-not-allowed disabled:opacity-60',
  'aria-[invalid=true]:border-error aria-[invalid=true]:border-2',
);

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(controlBase, 'h-11', className)}
        {...props}
      />
    );
  },
);

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, rows = 5, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(controlBase, 'py-2.5 leading-relaxed', className)}
        {...props}
      />
    );
  },
);

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(controlBase, 'h-11 pr-8', className)}
        {...props}
      >
        {children}
      </select>
    );
  },
);

export type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
>;

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          'size-5 shrink-0 rounded-sm border border-border-strong accent-primary',
          'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring',
          className,
        )}
        {...props}
      />
    );
  },
);
