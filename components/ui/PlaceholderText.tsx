import { cn } from '@/lib/utils/cn';
import { isPlaceholder } from '@/lib/constants/site';

interface PlaceholderTextProps {
  value: string | null | undefined;
  className?: string;
  /** Rendered when the value is empty rather than a placeholder token. */
  fallback?: string;
}

/**
 * Renders a school-owned value, making unfilled placeholders visually obvious.
 *
 * The whole point is that a placeholder must NOT look like real content. A
 * value that reads plausibly — an invented phone number, a made-up pass
 * percentage — survives review precisely because nobody questions it, and then
 * misinforms a family choosing a school.
 *
 * So an unfilled token is deliberately marked: dashed outline, muted colour,
 * and a `data-placeholder` attribute the pre-launch audit greps for.
 */
export function PlaceholderText({
  value,
  className,
  fallback = '—',
}: PlaceholderTextProps) {
  if (!value) {
    return <span className={className}>{fallback}</span>;
  }

  if (!isPlaceholder(value)) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span
      data-placeholder="true"
      title="Awaiting content from the school"
      className={cn(
        'rounded-sm border border-dashed border-warning px-1 font-mono text-[0.9em] text-foreground-subtle',
        className,
      )}
    >
      {value}
    </span>
  );
}
