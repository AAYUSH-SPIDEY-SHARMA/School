import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { Suspense } from 'react';

import { MasonryGallery } from '@/components/media/MasonryGallery';
import { getAlbumBySlug } from '@/lib/queries/gallery';
import { resolveRetiredSlug } from '@/lib/queries/slugHistory';

interface AlbumPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * ⚠️ No `generateStaticParams` here, deliberately.
 *
 * Under Cache Components, `generateStaticParams` must return at least one
 * result — Next.js uses it for build-time validation and fails the build on an
 * empty array. The album table is legitimately empty until the school adds
 * content, so a build would break on a fresh deployment.
 *
 * The Suspense boundary below already gives a prerendered shell, and the
 * album query is cached with a tag, so the practical difference is one cache
 * miss on the first request for a given album.
 */
export async function generateMetadata({
  params,
}: AlbumPageProps): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);

  if (!album) return { title: 'Album not found' };

  return {
    title: album.title,
    description: album.description ?? undefined,
  };
}

function AlbumSkeleton() {
  return (
    <div className="shell section-y" aria-hidden="true">
      <div className="columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4">
        {[320, 240, 400, 280, 360, 300, 260, 380].map((height, index) => (
          <div
            key={index}
            style={{ height }}
            className="animate-pulse break-inside-avoid rounded-lg bg-surface-sunken"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Everything that depends on the slug.
 *
 * Isolated so the request-time data access sits inside a Suspense boundary and
 * the surrounding page can still be prerendered (Cache Components).
 */
async function AlbumContent({ params }: AlbumPageProps) {
  const { slug } = await params;

  const album = await getAlbumBySlug(slug);

  if (!album) {
    /**
     * ⚠️ Before giving up, check whether this slug was retired.
     *
     * Resolved HERE rather than in `proxy.ts`, which has no database access. An
     * album URL may have been shared in a parent WhatsApp group months ago; if
     * the slug has since changed, that link gets a permanent redirect to the
     * current one instead of a dead end (NFR-028).
     */
    const currentSlug = await resolveRetiredSlug('gallery', slug);
    if (currentSlug) permanentRedirect(`/gallery/${currentSlug}`);
    notFound();
  }

  const items = album.images.map((image) => ({
    ...image.mediaAsset,
    // Overrides come AFTER the spread, deliberately: the GalleryImage row
    // carries the id that is unique within this album, and a caption written
    // for this album specifically. The asset's own caption is the fallback,
    // since the same photograph may appear in more than one album with
    // different wording.
    id: image.id,
    caption: image.caption ?? image.mediaAsset.caption,
  }));

  return (
    <>
      <section className="ink-surface">
        <div className="shell py-14 md:py-16">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-body-sm text-navy-200 transition-colors hover:text-gold-300"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            All albums
          </Link>

          <p className="mt-6 text-overline text-gold-400 uppercase">
            {album.category.charAt(0) + album.category.slice(1).toLowerCase()}
          </p>

          <h1 className="mt-2 font-serif text-h1">{album.title}</h1>

          {album.description ? (
            <p className="mt-4 max-w-prose-measure text-body-lg text-navy-100">
              {album.description}
            </p>
          ) : null}

          <p className="mt-4 text-body-sm text-navy-300">
            {album.images.length} {album.images.length === 1 ? 'item' : 'items'}
            {album.eventDate
              ? ` · ${album.eventDate.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}`
              : ''}
          </p>
        </div>
      </section>

      <section className="section-y">
        <div className="shell">
          {items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border-strong bg-surface-sunken px-6 py-12 text-center text-body text-foreground-muted">
              This album has no photographs yet.
            </p>
          ) : (
            <MasonryGallery items={items} />
          )}

          {/* Required by 48_MEDIA_CONSENT_AND_CHILD_SAFETY: any parent may ask
              for a photograph to be removed, without justifying the request. */}
          <p className="mt-14 border-t border-border pt-6 text-caption text-foreground-muted">
            If you would like a photograph removed, please{' '}
            <Link href="/contact" className="underline underline-offset-4">
              contact the school
            </Link>
            . Requests are actioned promptly and without question.
          </p>
        </div>
      </section>
    </>
  );
}

export default function AlbumPage({ params }: AlbumPageProps) {
  return (
    <Suspense fallback={<AlbumSkeleton />}>
      <AlbumContent params={params} />
    </Suspense>
  );
}
