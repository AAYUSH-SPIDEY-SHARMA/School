import Link from 'next/link';

import {
  AwaitingContent,
  CardGridBlock,
  CtaBandBlock,
  FaqBlock,
  HeroBlock,
  ImageBlock,
  ImageTextBlock,
  RichTextBlock,
  SectionHeading,
  SpacerBlock,
  StatsBandBlock,
  StepsBlock,
  VideoBlock,
} from '@/components/sections/blocks';
import { Button } from '@/components/ui/Button';
import { PlaceholderText } from '@/components/ui/PlaceholderText';
import { getFeaturedAchievements } from '@/lib/queries/achievements';
import { getPastEvents, getUpcomingEvents } from '@/lib/queries/events';
import { getPublishedFacilities } from '@/lib/queries/facilities';
import { getLeadership, getPublishedFaculty } from '@/lib/queries/faculty';
import { getFeaturedAlbums } from '@/lib/queries/gallery';
import { getPublicMediaByIds, type PublicMedia } from '@/lib/queries/media';
import { getLatestNews } from '@/lib/queries/news';
import { getLatestNotices } from '@/lib/queries/notices';
import { getPublishedDocuments } from '@/lib/queries/documents';
import { getPublishedTestimonials } from '@/lib/queries/testimonials';
import { getSchoolIdentity } from '@/lib/queries/settings';
import { formatFileSize, thumbnailUrl } from '@/lib/media/urls';

/**
 * Renders a page's sections in order (ADR-0012).
 *
 * ⚠️ An unknown section type renders NOTHING rather than throwing. A section
 * added by a newer deployment and then rolled back must not take the whole page
 * down with it — a missing section is recoverable, a 500 on the homepage is not.
 */

export interface RenderableSection {
  id: string;
  type: string;
  content: unknown;
}

type Content = Record<string, unknown>;

function asContent(value: unknown): Content {
  return value && typeof value === 'object' ? (value as Content) : {};
}

function str(content: Content, key: string): string {
  const value = content[key];
  return typeof value === 'string' ? value : '';
}

function num(content: Content, key: string, fallback: number): number {
  const value = content[key];
  return typeof value === 'number' ? value : fallback;
}

function bool(content: Content, key: string, fallback = false): boolean {
  const value = content[key];
  return typeof value === 'boolean' ? value : fallback;
}

/** Every media id referenced anywhere in the page, so they load in one query. */
function collectMediaIds(sections: readonly RenderableSection[]): string[] {
  const ids: string[] = [];

  for (const section of sections) {
    const content = asContent(section.content);
    for (const key of ['imageId', 'mediaAssetId', 'backgroundImageId']) {
      const value = content[key];
      if (typeof value === 'string' && value) ids.push(value);
    }
  }

  return ids;
}

export async function SectionRenderer({
  sections,
}: {
  sections: readonly RenderableSection[];
}) {
  const media = await getPublicMediaByIds(collectMediaIds(sections));

  return (
    <>
      {sections.map((section) => (
        <Section key={section.id} section={section} media={media} />
      ))}
    </>
  );
}

async function Section({
  section,
  media,
}: {
  section: RenderableSection;
  media: Map<string, PublicMedia>;
}) {
  const content = asContent(section.content);

  const imageOf = (key: string) => {
    const id = content[key];
    return typeof id === 'string' && id ? (media.get(id) ?? null) : null;
  };

  switch (section.type) {
    case 'HERO':
      return <HeroBlock content={content} image={imageOf('backgroundImageId')} />;
    case 'RICH_TEXT':
      return <RichTextBlock content={content} />;
    case 'IMAGE_TEXT':
      return <ImageTextBlock content={content} image={imageOf('imageId')} />;
    case 'STATS_BAND':
      return <StatsBandBlock content={content} />;
    case 'CARD_GRID':
      return <CardGridBlock content={content} />;
    case 'CTA_BAND':
      return <CtaBandBlock content={content} />;
    case 'STEPS':
      return <StepsBlock content={content} />;
    case 'FAQ':
      return <FaqBlock content={content} />;
    case 'IMAGE':
      return <ImageBlock content={content} image={imageOf('mediaAssetId')} />;
    case 'VIDEO':
      return <VideoBlock content={content} media={imageOf('mediaAssetId')} />;
    case 'SPACER':
      return <SpacerBlock content={content} />;

    case 'NEWS_LIST':
      return <NewsSection content={content} />;
    case 'NOTICE_LIST':
      return <NoticeSection content={content} />;
    case 'EVENT_LIST':
      return <EventSection content={content} />;
    case 'GALLERY_PREVIEW':
      return <GallerySection content={content} />;
    case 'FACULTY_LIST':
      return <FacultySection content={content} />;
    case 'TESTIMONIALS':
      return <TestimonialSection content={content} />;
    case 'ACHIEVEMENTS':
      return <AchievementSection content={content} />;
    case 'DOCUMENT_LIST':
      return <DocumentSection content={content} />;
    case 'FACILITIES':
      return <FacilitySection content={content} />;
    case 'CONTACT_INFO':
      return <ContactSection content={content} />;

    default:
      // Unknown type — render nothing rather than crash the page.
      return null;
  }
}

/* ── CMS-driven sections ──────────────────────────────────────────────────── */

function ViewAll({ href, label }: { href: string; label: string }) {
  return (
    <div className="mt-10">
      <Button asChild variant="secondary">
        <Link href={href}>{label}</Link>
      </Button>
    </div>
  );
}

async function NewsSection({ content }: { content: Content }) {
  const items = await getLatestNews(num(content, 'limit', 3));

  return (
    <section className="section-y">
      <div className="shell">
        <SectionHeading
          eyebrow={str(content, 'eyebrow')}
          heading={str(content, 'heading')}
          intro={str(content, 'intro')}
        />

        {items.length === 0 ? (
          <div className="mt-10">
            <AwaitingContent what="News articles" />
          </div>
        ) : (
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/news/${item.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition-all duration-(--duration-base) hover:-translate-y-1 hover:border-gold-400 hover:shadow-lg"
                >
                  {item.coverImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={thumbnailUrl(item.coverImage, 800)}
                      alt={item.coverImage.altText ?? ''}
                      loading="lazy"
                      className="aspect-16/9 w-full object-cover"
                    />
                  ) : null}

                  <div className="flex flex-1 flex-col p-6">
                    {item.publishedAt ? (
                      <time
                        dateTime={item.publishedAt.toISOString()}
                        className="text-caption text-foreground-subtle"
                      >
                        {item.publishedAt.toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </time>
                    ) : null}
                    <h3 className="mt-2 font-serif text-h4">{item.title}</h3>
                    {item.excerpt ? (
                      <p className="mt-2 text-body-sm text-foreground-muted">
                        {item.excerpt}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {bool(content, 'showViewAll', true) && items.length > 0 ? (
          <ViewAll href="/news" label="All news" />
        ) : null}
      </div>
    </section>
  );
}

async function NoticeSection({ content }: { content: Content }) {
  const items = await getLatestNotices(num(content, 'limit', 5));

  return (
    <section className="section-y bg-surface-sunken">
      <div className="shell">
        <SectionHeading
          eyebrow={str(content, 'eyebrow')}
          heading={str(content, 'heading')}
          intro={str(content, 'intro')}
        />

        {items.length === 0 ? (
          <div className="mt-10">
            <AwaitingContent what="Notices" />
          </div>
        ) : (
          <ul className="mt-10 flex flex-col gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-border bg-surface p-5"
              >
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-overline text-accent-ink uppercase">
                    {item.category.charAt(0) + item.category.slice(1).toLowerCase()}
                  </span>
                  {item.publishedAt ? (
                    <time
                      dateTime={item.publishedAt.toISOString()}
                      className="text-caption text-foreground-subtle"
                    >
                      {item.publishedAt.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </time>
                  ) : null}
                </div>
                <h3 className="mt-1 font-serif text-h4">{item.title}</h3>
                <p className="mt-2 text-body-sm whitespace-pre-line text-foreground-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        )}

        {bool(content, 'showViewAll', true) && items.length > 0 ? (
          <ViewAll href="/notices" label="All notices" />
        ) : null}
      </div>
    </section>
  );
}

async function EventSection({ content }: { content: Content }) {
  const past = str(content, 'mode') === 'past';
  const limit = num(content, 'limit', 4);

  const items = past
    ? (await getPastEvents({ page: 1 })).items.slice(0, limit)
    : await getUpcomingEvents(limit);

  return (
    <section className="section-y">
      <div className="shell">
        <SectionHeading
          eyebrow={str(content, 'eyebrow')}
          heading={str(content, 'heading')}
          intro={str(content, 'intro')}
        />

        {items.length === 0 ? (
          <div className="mt-10">
            <AwaitingContent what={past ? 'Past events' : 'Upcoming events'} />
          </div>
        ) : (
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/events/${item.slug}`}
                  className="group flex h-full flex-col rounded-lg border border-border bg-surface p-6 transition-all duration-(--duration-base) hover:-translate-y-1 hover:border-gold-400 hover:shadow-lg"
                >
                  <time
                    dateTime={item.startDate.toISOString()}
                    className="text-overline text-accent-ink uppercase"
                  >
                    {item.startDate.toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </time>
                  <h3 className="mt-2 font-serif text-h4">{item.title}</h3>
                  {item.venue ? (
                    <p className="mt-1 text-body-sm text-foreground-muted">
                      {item.venue}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {bool(content, 'showViewAll', true) && items.length > 0 ? (
          <ViewAll href="/events" label="All events" />
        ) : null}
      </div>
    </section>
  );
}

async function GallerySection({ content }: { content: Content }) {
  const albums = await getFeaturedAlbums(num(content, 'limit', 4));

  return (
    <section className="section-y">
      <div className="shell">
        <SectionHeading
          eyebrow={str(content, 'eyebrow')}
          heading={str(content, 'heading')}
          intro={str(content, 'intro')}
        />

        {albums.length === 0 ? (
          <div className="mt-10">
            <AwaitingContent what="Photo albums" />
          </div>
        ) : (
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {albums.map((album) => (
              <li key={album.id}>
                <Link
                  href={`/gallery/${album.slug}`}
                  className="group block overflow-hidden rounded-lg border border-border bg-surface transition-all duration-(--duration-base) hover:-translate-y-1 hover:border-gold-400 hover:shadow-lg"
                >
                  <div className="aspect-4/3 overflow-hidden bg-surface-sunken">
                    {album.coverImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={thumbnailUrl(album.coverImage, 640)}
                        alt={album.coverImage.altText ?? ''}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-(--duration-slow) group-hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif text-h4">{album.title}</h3>
                    <p className="mt-1 text-caption text-foreground-muted">
                      {album._count.images} photographs
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {bool(content, 'showViewAll', true) && albums.length > 0 ? (
          <ViewAll href="/gallery" label="Full gallery" />
        ) : null}
      </div>
    </section>
  );
}

async function FacultySection({ content }: { content: Content }) {
  const leadershipOnly = bool(content, 'leadershipOnly');
  const department = str(content, 'departmentSlug');

  const people = leadershipOnly
    ? await getLeadership()
    : await getPublishedFaculty(department ? { departmentSlug: department } : {});

  const items = people.slice(0, num(content, 'limit', 8));

  return (
    <section className="section-y bg-surface-sunken">
      <div className="shell">
        <SectionHeading
          eyebrow={str(content, 'eyebrow')}
          heading={str(content, 'heading')}
          intro={str(content, 'intro')}
        />

        {items.length === 0 ? (
          <div className="mt-10">
            <AwaitingContent what="Teacher profiles" />
          </div>
        ) : (
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((person) => (
              <li key={person.id}>
                <Link
                  href={`/academics/faculty/${person.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition-all duration-(--duration-base) hover:-translate-y-1 hover:border-gold-400 hover:shadow-lg"
                >
                  <div className="aspect-3/4 overflow-hidden bg-cream-200">
                    {person.photo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={thumbnailUrl(person.photo, 480)}
                        alt={person.photo.altText ?? ''}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif text-h4">{person.name}</h3>
                    <p className="mt-0.5 text-body-sm text-foreground-muted">
                      {person.designation}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {bool(content, 'showViewAll', true) && items.length > 0 ? (
          <ViewAll href="/academics/faculty" label="All teachers" />
        ) : null}
      </div>
    </section>
  );
}

async function TestimonialSection({ content }: { content: Content }) {
  const items = await getPublishedTestimonials(num(content, 'limit', 3));

  if (items.length === 0) return null;

  return (
    <section className="section-y">
      <div className="shell">
        <SectionHeading
          eyebrow={str(content, 'eyebrow')}
          heading={str(content, 'heading')}
          intro={str(content, 'intro')}
          align="center"
        />

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col rounded-lg border border-border bg-surface p-7"
            >
              <blockquote className="flex-1 text-body text-foreground">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 border-t border-border pt-4">
                <span className="block font-medium text-foreground">
                  {item.authorName}
                </span>
                {item.authorDetail ? (
                  <span className="block text-caption text-foreground-muted">
                    {item.authorDetail}
                  </span>
                ) : null}
              </figcaption>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

async function AchievementSection({ content }: { content: Content }) {
  const items = await getFeaturedAchievements(num(content, 'limit', 4));

  if (items.length === 0) return null;

  return (
    <section className="section-y bg-surface-sunken">
      <div className="shell">
        <SectionHeading
          eyebrow={str(content, 'eyebrow')}
          heading={str(content, 'heading')}
          intro={str(content, 'intro')}
        />

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-border bg-surface p-6"
            >
              <p className="text-overline text-accent-ink uppercase">
                {item.type.charAt(0) + item.type.slice(1).toLowerCase()}
              </p>
              <h3 className="mt-2 font-serif text-h4">{item.title}</h3>
              {item.level ? (
                <p className="mt-1 text-body-sm text-foreground-muted">{item.level}</p>
              ) : null}
              <time
                dateTime={item.achievedOn.toISOString()}
                className="mt-3 block text-caption text-foreground-subtle"
              >
                {item.achievedOn.toLocaleDateString('en-IN', {
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            </li>
          ))}
        </ul>

        {bool(content, 'showViewAll', true) ? (
          <ViewAll href="/achievements" label="All achievements" />
        ) : null}
      </div>
    </section>
  );
}

async function DocumentSection({ content }: { content: Content }) {
  const documents = await getPublishedDocuments();
  const items = documents.slice(0, num(content, 'limit', 8));

  if (items.length === 0) return null;

  return (
    <section className="section-y">
      <div className="shell">
        <SectionHeading
          eyebrow={str(content, 'eyebrow')}
          heading={str(content, 'heading')}
          intro={str(content, 'intro')}
        />

        <ul className="mt-10 flex flex-col gap-3">
          {items.map((doc) => (
            <li key={doc.id}>
              <a
                href={doc.mediaAsset.url}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface p-5 transition-colors hover:border-gold-400"
                download
              >
                <span>
                  <span className="block font-medium text-foreground">{doc.title}</span>
                  {doc.description ? (
                    <span className="block text-body-sm text-foreground-muted">
                      {doc.description}
                    </span>
                  ) : null}
                </span>
                {/* Size shown BEFORE the tap — a parent on metered mobile data
                    needs to know what they are about to download. */}
                <span className="shrink-0 text-caption text-foreground-subtle">
                  {formatFileSize(doc.fileSize)}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

async function FacilitySection({ content }: { content: Content }) {
  const facilities = await getPublishedFacilities();
  const items = facilities.slice(0, num(content, 'limit', 8));

  if (items.length === 0) return null;

  return (
    <section className="section-y">
      <div className="shell">
        <SectionHeading
          eyebrow={str(content, 'eyebrow')}
          heading={str(content, 'heading')}
          intro={str(content, 'intro')}
        />

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((facility) => (
            <li
              key={facility.id}
              className="overflow-hidden rounded-lg border border-border bg-surface"
            >
              {facility.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={thumbnailUrl(facility.image, 640)}
                  alt={facility.image.altText ?? ''}
                  loading="lazy"
                  className="aspect-16/9 w-full object-cover"
                />
              ) : null}
              <div className="p-6">
                <h3 className="font-serif text-h4">{facility.name}</h3>
                <p className="mt-2 text-body-sm text-foreground-muted">
                  {facility.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

async function ContactSection({ content }: { content: Content }) {
  const school = await getSchoolIdentity();

  return (
    <section className="section-y bg-surface-sunken">
      <div className="shell">
        <SectionHeading
          eyebrow={str(content, 'eyebrow')}
          heading={str(content, 'heading')}
          intro={str(content, 'body')}
        />

        <dl className="mt-10 grid gap-6 sm:grid-cols-3">
          <div>
            <dt className="text-overline text-foreground-subtle uppercase">Address</dt>
            <dd className="mt-2 text-body text-foreground">
              <PlaceholderText value={school.address} />
            </dd>
          </div>
          <div>
            <dt className="text-overline text-foreground-subtle uppercase">Phone</dt>
            <dd className="mt-2 text-body">
              <a href={`tel:${school.phone}`} className="text-cta underline underline-offset-4">
                <PlaceholderText value={school.phone} />
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-overline text-foreground-subtle uppercase">Email</dt>
            <dd className="mt-2 text-body">
              <a href={`mailto:${school.email}`} className="text-cta underline underline-offset-4">
                <PlaceholderText value={school.email} />
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
