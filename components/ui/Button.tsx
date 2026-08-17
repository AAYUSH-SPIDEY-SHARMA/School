import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils/cn';

/**
 * Button.
 *
 * Sizes are set by minimum touch target, not visual taste: `md` is 44px because
 * that is the WCAG 2.5.8 target size, and the primary persona is tapping on a
 * phone (26_ACCESSIBILITY).
 *
 * ⚠️ THERE IS NO GOLD BUTTON, DELIBERATELY.
 *
 * 10_DESIGN_SYSTEM left open whether gold could serve as a CTA background. It
 * cannot: a gold light enough to look like gold cannot reach 4.5:1 against
 * white text, and darkening it until it does turns it brown. So the call to
 * action is `cta` (royal blue) or `primary` (navy), and gold stays decorative —
 * rules, frames, eyebrows and figures. Accessibility wins over palette
 * preference, which is the rule the design system already stated.
 */
const buttonVariants = cva(
  cn(
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap',
    'transition-[background-color,color,border-color,box-shadow,transform] duration-(--duration-fast)',
    'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:translate-y-px',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  ),
  {
    variants: {
      variant: {
        /** The admissions call to action. */
        cta: 'bg-cta text-cta-foreground shadow-sm hover:bg-cta-hover hover:shadow-md',
        /** Primary action on a light surface. */
        primary:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover hover:shadow-md',
        /** Alternative action on a light surface. */
        secondary:
          'border border-primary/25 bg-transparent text-primary hover:border-primary hover:bg-primary hover:text-primary-foreground',
        /** On a navy block: solid cream, reading as the light-on-dark primary. */
        onInk:
          'bg-cream-50 text-navy-900 shadow-sm hover:bg-white hover:shadow-md',
        /** On a navy block: gold hairline outline. Gold as border, never as text bg. */
        onInkOutline:
          'border border-gold-500/60 bg-transparent text-gold-300 hover:border-gold-400 hover:bg-gold-500/10 hover:text-gold-200',
        ghost: 'bg-transparent text-foreground hover:bg-surface-sunken',
        link: 'bg-transparent text-primary underline underline-offset-4 hover:text-cta',
        destructive: 'bg-error text-white hover:opacity-90',
      },
      size: {
        sm: 'h-9 px-3.5 text-body-sm',
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
