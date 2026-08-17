import { ImageIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

import { Pagination } from '@/components/admin/Pagination';
import { thumbnailUrl } from '@/lib/media/urls';
import { getPublishedAlbums } from '@/lib/queries/gallery';
import { SCHOOL_CONFIRMED } from '@/lib/constants/site';

export const metadata = {
  title: 'Gallery',
  description: `Photographs from life at ${SCHOOL_CONFIRMED.name}.`,
};

interface GalleryPageProps {
  searchParams: Promise<{ page?: string }>;
}

/**
 * Album index.
 *
 * ⚠️ Every album here contains photographs of identifiable children. The query
 * returns only published, non-deleted albums, and the consent record on each
 * asset is never sent to the browser (48_MEDIA_CONSENT_AND_CHILD_SAFETY).
 */
function AlbumGridSkeleton() {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <li
          key={index}
          className="h-80 animate-pulse rounded-lg bg-surface-sunken"
        />
      ))}
    </ul>
  );
}

/**
 * The paginated grid.
 *
 * Split out so `searchParams` — request-time data — is read inside a Suspense
 * boundary, letting the page's heading and chrome prerender (Cache Components).
 */
async function AlbumGrid({ searchParams }: GalleryPageProps) {
  const params = await searchParams;

  const { items, page, pageCount } = await getPublishedAlbums({
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <>
          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border-strong bg-surface-sunken px-6 py-16 text-center">
              <ImageIcon
                aria-hidden="true"
                className="mx-auto size-9 text-foreground-subtle"
              />
              <h2 className="mt-4 font-serif text-h3">No albums yet</h2>
              <p className="mx-auto mt-2 max-w-prose-measure text-body text-foreground-muted">
                Photographs of the school will appear here once they have been
                added. Nothing is shown in the meantime — stock images of
                children are not used on this site.
              </p>
            </div>
          ) : (
            <>
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((album) => (
                  <li key={album.id}>
                    <Link
                      href={`/gallery/${album.slug}`}
                      className="group block overflow-hidden rounded-lg border border-border bg-surface transition-all duration-(--duration-base) hover:-translate-y-1 hover:border-gold-400 hover:shadow-lg"
                    >
                      <div className="relative aspect-4/3 overflow-hidden bg-surface-sunken">
                        {album.coverImage ? (
                          <Image
                            src={thumbnailUrl(album.coverImage, 800)}
                            alt={album.coverImage.altText ?? ''}
                            fill
                            quality={100}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-(--duration-slow) group-hover:scale-105"
                          />
                        ) : (
                          <div className="grid size-full place-items-center">
                            <ImageIcon
                              aria-hidden="true"
                              className="size-8 text-foreground-subtle"
                            />
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <p className="text-overline text-accent-ink uppercase">
                          {album.category.charAt(0) +
                            album.category.slice(1).toLowerCase()}
                        </p>
                        <h2 className="mt-2 font-serif text-h4">{album.title}</h2>
                        <p className="mt-1 text-body-sm text-foreground-muted">
                          {album._count.images}{' '}
                          {album._count.images === 1 ? 'photograph' : 'photographs'}
                          {album.eventDate
                            ? ` · ${album.eventDate.toLocaleDateString('en-IN', {
                                month: 'short',
                                year: 'numeric',
                              })}`
                            : ''}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Pagination page={page} pageCount={pageCount} basePath="/gallery" />
              </div>
            </>
          )}
    </>
  );
}

export default function GalleryPage({ searchParams }: GalleryPageProps) {
  return (
    <>
      <section className="ink-surface">
        <div className="shell py-16 md:py-20">
          <p className="text-overline text-gold-400 uppercase">Gallery</p>
          <h1 className="mt-3 font-serif text-h1">Life at the school</h1>
          <p className="mt-4 max-w-prose-measure text-body-lg text-navy-100">
            Photographs from lessons, sports, celebrations and everyday life on
            campus.
          </p>
        </div>
      </section>

      <section className="section-y">
        <div className="shell">
          <Suspense fallback={<AlbumGridSkeleton />}>
            <AlbumGrid searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
