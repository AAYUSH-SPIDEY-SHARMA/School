import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names, letting later Tailwind utilities win over earlier ones.
 *
 * `clsx` handles conditionals; `twMerge` resolves genuine conflicts, so a
 * variant's `px-4` and an override's `px-6` do not both end up in the class
 * list with the winner decided by stylesheet order.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
