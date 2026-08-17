import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { VideoEmbed } from '@/components/media/VideoEmbed';
import { Button } from '@/components/ui/Button';
import { PlaceholderText } from '@/components/ui/PlaceholderText';
import { resolveIcon } from '@/components/sections/icons';
import { displayUrl, thumbnailUrl, type MediaAssetLike } from '@/lib/media/urls';
import { cn } from '@/lib/utils/cn';

/**
 * The rendered form of each section type.
 *
 * ⚠️ The markup lives HERE, not in the database. The school controls content
 * and order; heading levels, spacing, contrast and responsive behaviour are
 * properties of these components. That is the whole basis on which ADR-0012
 * reversed the "no page builder" rejection.
 *
 * Every section renders `<h2>`, never `<h1>`. The page's own title is the
 * `<h1>`, and a page whose sections each claim `<h1>` has no usable heading
 * outline for a screen reader — which is exactly the accessibility regression a
 * free-form builder causes.
 */

type Content = Record<string, unknown>;

/* ── Small helpers for reading loosely-typed content safely ───────────────── */

function str(content: Content, key: string): string {
  const value = content[key];
  return typeof value === 'string' ? value : '';
}

function bool(content: Content, key: string, fallback = false): boolean {
  const value = content[key];
  return typeof value === 'boolean' ? value : fallback;
}

function list<T = Content>(content: Content, key: string): T[] {
  const value = content[key];
  return Array.isArray(value) ? (value as T[]) : [];
}

function linkOf(
  content: Content,
  key: string,
): { label: string; href: string } | null {
  const value = content[key];
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const label = typeof record.label === 'string' ? record.label : '';
  const href = typeof record.href === 'string' ? record.href : '';
  if (!label || !href) return null;
  return { label, href };
}

/** Eyebrow + heading, used by most sections so the rhythm stays identical. */
function SectionHeading({
  eyebrow,
  heading,
  intro,
  align = 'left',
  onInk = false,
}: {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  align?: 'left' | 'center';
  onInk?: boolean;
}) {
  if (!eyebrow && !heading && !intro) return null;

  return (
    <div className={cn(align === 'center' && 'text-center')}>
      {eyebrow ? (
        <p
          className={cn(
            'text-overline uppercase',
            onInk ? 'text-gold-400' : 'text-accent-ink',
          )}
        >
          {eyebrow}
        </p>
      ) : null}

      {heading ? (
        <h2
          className={cn(
            'gold-rule mt-3 font-serif text-h1',
            align === 'center' && 'gold-rule-center',
          )}
        >
          {heading}
        </h2>
      ) : null}

      {intro ? (
        <p
          className={cn(
            'mt-6 max-w-prose-measure text-body text-foreground-muted',
            align === 'center' && 'mx-auto',
            onInk && 'text-navy-100',
          )}
        >
          {intro}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Plain text with paragraph breaks preserved.
 *
 * Deliberately NOT `dangerouslySetInnerHTML`. A content field that renders raw
 * HTML is a stored-XSS hole, and no section schema offers one.
 */
function Prose({ text, className }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n{2,}/).filter(Boolean);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="max-w-prose-measure whitespace-pre-line">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

/** Shown where a section needs content the school has not supplied. */
function AwaitingContent({ what }: { what: string }) {
  return (
    <p className="rounded-lg border border-dashed border-border-strong bg-surface-sunken px-5 py-8 text-center text-body-sm text-foreground-muted">
      {what} will appear here once added. Nothing is shown in the meantime —
      no placeholder content is invented.
    </p>
  );
}

/* ── Sections ─────────────────────────────────────────────────────────────── */

export function HeroBlock({
  content,
  image,
}: {
  content: Content;
  image?: MediaAssetLike | null;
}) {
  const onInk = str(content, 'variant') !== 'light';
  const primary = linkOf(content, 'primaryCta');
  const secondary = linkOf(content, 'secondaryCta');
  const accent = str(content, 'headlineAccent');

  return (
    <section
      className={cn('relative overflow-hidden', onInk ? 'ink-surface' : 'bg-surface')}
    >
      {image ? (
        <>
          <Image
            src={displayUrl(image, { width: 2560 })}
            alt=""
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover"
          />
          {/* The scrim is what keeps the headline readable over any photograph.
              Without it, contrast depends on whichever image was uploaded. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-navy-950/72"
          />
        </>
      ) : onInk ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_15%,var(--color-navy-600),transparent_60%)] opacity-70"
        />
      ) : null}

      <div className="shell relative py-20 md:py-28 lg:py-36">
        <div className="max-w-3xl">
          {str(content, 'eyebrow') ? (
            <p
              className={cn(
                'text-overline uppercase',
                onInk || image ? 'text-gold-400' : 'text-accent-ink',
              )}
            >
              {str(content, 'eyebrow')}
            </p>
          ) : null}

          <h2 className="mt-6 font-serif text-display">
            {accent ? <span className="block text-gold-400">{accent}</span> : null}
            <span className={cn('block', onInk || image ? 'text-cream-50' : 'text-primary')}>
              {str(content, 'headline')}
            </span>
          </h2>

          {str(content, 'body') ? (
            <p
              className={cn(
                'mt-7 max-w-xl text-body-lg',
                onInk || image ? 'text-navy-100' : 'text-foreground-muted',
              )}
            >
              {str(content, 'body')}
            </p>
          ) : null}

          {primary || secondary ? (
            <div className="mt-10 flex flex-wrap gap-4">
              {primary ? (
                <Button asChild variant={onInk || image ? 'onInk' : 'cta'} size="lg">
                  <Link href={primary.href}>
                    {primary.label}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
              {secondary ? (
                <Button
                  asChild
                  variant={onInk || image ? 'onInkOutline' : 'secondary'}
                  size="lg"
                >
                  <Link href={secondary.href}>{secondary.label}</Link>
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function RichTextBlock({ content }: { content: Content }) {
  const align = str(content, 'align') === 'center' ? 'center' : 'left';

  return (
    <section className="section-y">
      <div className="shell">
        <SectionHeading
          eyebrow={str(content, 'eyebrow')}
          heading={str(content, 'heading')}
          align={align}
        />
        <Prose
          text={str(content, 'body')}
          className={cn('mt-8 text-body text-foreground-muted', align === 'center' && 'mx-auto text-center')}
        />
      </div>
    </section>
  );
}

export function ImageTextBlock({
  content,
  image,
}: {
  content: Content;
  image?: MediaAssetLike | null;
}) {
  const imageRight = str(content, 'imagePosition') !== 'left';
  const cta = linkOf(content, 'cta');

  return (
    <section className="section-y">
      <div className="shell grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className={cn(imageRight ? 'lg:order-1' : 'lg:order-2')}>
          <SectionHeading
            eyebrow={str(content, 'eyebrow')}
            heading={str(content, 'heading')}
          />
          <Prose
            text={str(content, 'body')}
            className="mt-8 text-body text-foreground-muted"
          />
          {cta ? (
            <Button asChild variant="secondary" className="mt-8">
              <Link href={cta.href}>
                {cta.label}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
        </div>

        <div className={cn(imageRight ? 'lg:order-2' : 'lg:order-1')}>
          {image ? (
            <div className="gold-frame overflow-hidden p-1">
              <Image
                src={displayUrl(image, { width: 1440 })}
                alt={image.altText ?? ''}
                width={image.width ?? 1200}
                height={image.height ?? 900}
                quality={100}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-auto w-full"
              />
            </div>
          ) : (
            <div className="gold-frame grid aspect-4/3 place-items-center bg-surface-sunken p-1">
              <p className="px-8 text-center text-body-sm text-foreground-muted">
                A photograph goes here.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function StatsBandBlock({ content }: { content: Content }) {
  const stats = list<{ value?: string; label?: string }>(content, 'stats');

  if (stats.length === 0) return null;

  return (
    <section className="border-y border-border bg-surface">
      <div className="shell grid grid-cols-2 gap-y-10 py-12 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            {/* PlaceholderText makes an unfilled figure visibly unfilled.
                A plausible invented number is far more dangerous than an
                obvious placeholder on a real school's website. */}
            <p className="font-serif text-h2 text-accent-ink">
              <PlaceholderText value={stat.value ?? ''} />
            </p>
            <p className="mt-1 text-overline text-foreground-subtle uppercase">
              {stat.label ?? ''}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CardGridBlock({ content }: { content: Content }) {
  const cards = list<{
    icon?: string;
    title?: string;
    body?: string;
    href?: string;
  }>(content, 'cards');

  const columns = typeof content.columns === 'number' ? content.columns : 3;

  if (cards.length === 0) return null;

  return (
    <section className="section-y">
      <div className="shell">
        <SectionHeading
          eyebrow={str(content, 'eyebrow')}
          heading={str(content, 'heading')}
          intro={str(content, 'intro')}
        />

        <ul
          className={cn(
            'mt-12 grid gap-6 sm:grid-cols-2',
            columns === 4 ? 'lg:grid-cols-4' : columns === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3',
          )}
        >
          {cards.map((card, index) => {
            const Icon = resolveIcon(card.icon);

            const inner = (
              <>
                <span className="grid size-12 place-items-center rounded-sm bg-navy-800 text-gold-400">
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <h3 className="mt-5 font-serif text-h4">{card.title ?? ''}</h3>
                {card.body ? (
                  <p className="mt-2 text-body-sm text-foreground-muted">{card.body}</p>
                ) : null}
                {card.href ? (
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-body-sm font-medium text-cta">
                    Read more
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform group-hover:translate-x-1"
                    />
                  </span>
                ) : null}
              </>
            );

            return (
              <li key={index}>
                {card.href ? (
                  <Link
                    href={card.href}
                    className="group flex h-full flex-col rounded-lg border border-border bg-surface p-7 transition-all duration-(--duration-base) hover:-translate-y-1 hover:border-gold-400 hover:shadow-lg"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="flex h-full flex-col rounded-lg border border-border bg-surface p-7">
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function CtaBandBlock({ content }: { content: Content }) {
  const primary = linkOf(content, 'primaryCta');
  const secondary = linkOf(content, 'secondaryCta');

  return (
    <section className="ink-surface relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,var(--color-navy-600),transparent_65%)] opacity-60"
      />

      <div className="shell relative flex flex-col items-start gap-8 py-16 md:py-20 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          {str(content, 'eyebrow') ? (
            <p className="text-overline text-gold-400 uppercase">
              {str(content, 'eyebrow')}
            </p>
          ) : null}
          {str(content, 'heading') ? (
            <h2 className="mt-3 font-serif text-h1">{str(content, 'heading')}</h2>
          ) : null}
          {str(content, 'body') ? (
            <p className="mt-4 max-w-prose-measure text-body-lg text-navy-100">
              {str(content, 'body')}
            </p>
          ) : null}
        </div>

        {primary || secondary ? (
          <div className="flex shrink-0 flex-wrap gap-4">
            {primary ? (
              <Button asChild variant="onInk" size="lg">
                <Link href={primary.href}>
                  {primary.label}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            ) : null}
            {secondary ? (
              <Button asChild variant="onInkOutline" size="lg">
                <Link href={secondary.href}>{secondary.label}</Link>
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function StepsBlock({ content }: { content: Content }) {
  const steps = list<{ title?: string; body?: string }>(content, 'steps');

  if (steps.length === 0) return null;

  return (
    <section className="section-y bg-surface-sunken">
      <div className="shell">
        <SectionHeading
          eyebrow={str(content, 'eyebrow')}
          heading={str(content, 'heading')}
          intro={str(content, 'intro')}
        />

        {/* An ordered list, so the sequence is conveyed to a screen reader by
            the markup rather than only by the numbers drawn on screen. */}
        <ol className="mt-12 flex flex-col gap-6">
          {steps.map((step, index) => (
            <li
              key={index}
              className="flex gap-5 rounded-lg border border-border bg-surface p-6"
            >
              <span
                aria-hidden="true"
                className="grid size-11 shrink-0 place-items-center rounded-full bg-navy-800 font-serif text-h4 text-gold-400"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="font-serif text-h4">{step.title ?? ''}</h3>
                {step.body ? (
                  <p className="mt-2 text-body text-foreground-muted">{step.body}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function FaqBlock({ content }: { content: Content }) {
  const items = list<{ question?: string; answer?: string }>(content, 'items');

  if (items.length === 0) return null;

  return (
    <section className="section-y">
      <div className="shell max-w-3xl">
        <SectionHeading
          eyebrow={str(content, 'eyebrow')}
          heading={str(content, 'heading')}
        />

        {/* Native <details>, so answers are readable before hydration and
            findable by the browser's own in-page search. */}
        <div className="mt-10 flex flex-col gap-3">
          {items.map((item, index) => (
            <details
              key={index}
              className="group rounded-lg border border-border bg-surface px-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-foreground focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring">
                {item.question ?? ''}
                <span
                  aria-hidden="true"
                  className="shrink-0 text-foreground-subtle transition-transform group-open:rotate-180"
                >
                  ▾
                </span>
              </summary>
              <div className="pb-5 text-body text-foreground-muted">
                <Prose text={item.answer ?? ''} />
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ImageBlock({
  content,
  image,
}: {
  content: Content;
  image?: MediaAssetLike | null;
}) {
  if (!image) return null;

  const full = str(content, 'width') === 'full';

  return (
    <section className={cn(full ? '' : 'section-y')}>
      <figure className={cn(full ? '' : 'shell')}>
        <Image
          src={displayUrl(image, { width: 2560 })}
          alt={image.altText ?? ''}
          width={image.width ?? 1920}
          height={image.height ?? 1080}
          quality={100}
          sizes={full ? '100vw' : '(max-width: 1440px) 100vw, 1440px'}
          className={cn('h-auto w-full', !full && 'rounded-lg')}
        />
        {str(content, 'caption') ? (
          <figcaption className={cn('mt-3 text-caption text-foreground-muted', full && 'shell')}>
            {str(content, 'caption')}
          </figcaption>
        ) : null}
      </figure>
    </section>
  );
}

export function VideoBlock({
  content,
  media,
}: {
  content: Content;
  media?: MediaAssetLike | null;
}) {
  return (
    <section className="section-y">
      <div className="shell max-w-4xl">
        <SectionHeading heading={str(content, 'heading')} />

        <div className="mt-8">
          {media?.externalId ? (
            <VideoEmbed
              source={media.source === 'YOUTUBE' ? 'YOUTUBE' : 'GOOGLE_DRIVE'}
              externalId={media.externalId}
              title={str(content, 'caption') || 'School video'}
              posterUrl={media.thumbnailUrl}
            />
          ) : (
            <AwaitingContent what="A video" />
          )}
        </div>

        {str(content, 'caption') ? (
          <p className="mt-3 text-caption text-foreground-muted">
            {str(content, 'caption')}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function SpacerBlock({ content }: { content: Content }) {
  const size = str(content, 'size') || 'md';
  const height = size === 'sm' ? 'h-8' : size === 'lg' ? 'h-24' : 'h-16';

  return (
    <div className={cn('shell', height)} aria-hidden="true">
      {bool(content, 'showRule') ? (
        <div className="h-px w-full translate-y-1/2 bg-border" />
      ) : null}
    </div>
  );
}

export { SectionHeading, Prose, AwaitingContent, thumbnailUrl };
