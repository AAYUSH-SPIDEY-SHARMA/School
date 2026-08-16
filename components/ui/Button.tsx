import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils/cn';

/**
 * Button.
 *
 * Sizes are set by minimum touch target, not by visual taste: `md` is 44px
 * because that is the WCAG 2.5.8 target size, and the primary persona is
 * tapping on a phone (26_ACCESSIBILITY).
 *
 * `focus-visible` always produces a visible ring. Disabled state never carries
 * meaning on its own — the reason a control is disabled must be in text too.
 */
const buttonVariants = cva(
  cn(
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap',
    'transition-colors duration-(--duration-fast)',
    'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'disabled:pointer-events-none disabled:opacity-50',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  ),
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:bg-primary-hover',
        /* ⚠️ Accent is the admissions CTA only. If gold fails 4.5:1 contrast on
           measurement, this variant is withdrawn and CTAs use `primary` —
           accessibility wins over palette preference (10_DESIGN_SYSTEM). */
        accent: 'bg-accent text-accent-foreground hover:bg-accent-hover',
        secondary:
          'border border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground',
        ghost:
          'bg-transparent text-foreground hover:bg-surface-sunken',
        link: 'bg-transparent text-primary underline underline-offset-4 hover:text-primary-hover',
        destructive: 'bg-error text-neutral-0 hover:opacity-90',
      },
      size: {
        sm: 'h-9 px-3 text-body-sm',
        md: 'h-11 px-5 text-body',
        lg: 'h-13 px-7 text-body-lg',
        icon: 'size-11',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as the child element — used to make a `<Link>` look like a button. */
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      // A button inside a form defaults to `submit`, which has caused more
      // accidental submissions than any other HTML default.
      type={asChild ? undefined : (type ?? 'button')}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
