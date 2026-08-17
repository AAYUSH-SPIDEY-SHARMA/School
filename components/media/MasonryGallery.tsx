'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

import { VideoEmbed } from '@/components/media/VideoEmbed';
import { displayUrl, thumbnailUrl, type MediaAssetLike } from '@/lib/media/urls';

export interface GalleryItem extends MediaAssetLike {
  id: string;
  caption?: string | null;
  fileName?: string;
}

interface MasonryGalleryProps {
  items: readonly GalleryItem[];
}

/**
 * Pinterest-style masonry gallery.
 *
 * Laid out with CSS multi-column, not a JavaScript masonry library. Columns
 * reflow natively, cost no JavaScript, and work before hydration — which
 * matters because the gallery is image-heavy and the audience is on 4G. The
 * trade is that reading order runs down each column rather than across, which
 * is acceptable for a photo gallery where the images have no narrative order.
 *
 * ⚠️ QUALITY: tiles are width-limited at q_100 — resized, never lossily
 * recompressed. Opening an image serves the UNTOUCHED ORIGINAL, so what a
 * visitor views full-screen is exactly the file the school uploaded.
 *
 * ⚠️ SAFEGUARDING: these images contain identifiable children. Alt text
 * describes the activity and never names a child, because it is indexed. The
 * consent record lives on the asset and is never sent to the browser.
 */
export function MasonryGallery({ items }: MasonryGalleryProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const current = openIndex === null ? null : (items[openIndex] ?? null);

  const go = React.useCallback(
    (delta: number) => {
      setOpenIndex((index) => {
        if (index === null || items.length === 0) return index;
        return (index + delta + items.length) % items.length;
      });
    },
    [items.length],
  );

  return (
    <>
      {/* Multi-column masonry. `break-inside: avoid` keeps a tile intact. */}
      <div className="columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4">
        {items.map((item, index) => {
          const isVideo = item.kind === 'VIDEO';

          return (
            <figure key={item.id} className="break-inside-avoid">
              {isVideo && item.externalId ? (
                <VideoEmbed
                  source={item.source === 'YOUTUBE' ? 'YOUTUBE' : 'GOOGLE_DRIVE'}
                  externalId={item.externalId}
                  title={item.caption ?? item.fileName ?? 'School video'}
                  posterUrl={item.thumbnailUrl}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setOpenIndex(index)}
                  className="group relative block w-full overflow-hidden rounded-lg bg-surface-sunken focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  aria-label={
                    item.altText
                      ? `View larger: ${item.altText}`
                      : 'View larger image'
                  }
                >
                  <Image
                    src={thumbnailUrl(item, 640)}
                    alt={item.altText ?? ''}
                    // Intrinsic dimensions where known, so the column does not
                    // jump as images load. Falls back to a 4:3 assumption.
                    width={item.width ?? 800}
                    height={item.height ?? 600}
                    quality={100}
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="h-auto w-full transition-transform duration-(--duration-slow) group-hover:scale-[1.03]"
                  />

                  <span className="pointer-events-none absolute inset-0 bg-navy-950/0 transition-colors duration-(--duration-base) group-hover:bg-navy-950/15" />
                </button>
              )}

              {item.caption ? (
                <figcaption className="px-1 pt-2 text-caption text-foreground-muted">
                  {item.caption}
                </figcaption>
              ) : null}
            </figure>
          );
        })}
      </div>

      {/* Lightbox — serves the untouched original. */}
      <Dialog.Root
        open={openIndex !== null}
        onOpenChange={(open) => !open && setOpenIndex(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-navy-950/95" />
          <Dialog.Content
            className="fixed inset-0 z-50 flex flex-col focus:outline-none"
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') go(1);
              if (event.key === 'ArrowLeft') go(-1);
            }}
          >
            <Dialog.Title className="sr-only">
              {current?.altText ?? 'Gallery image'}
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              Use the left and right arrow keys to move between images, and
              Escape to close.
            </Dialog.Description>

            <div className="flex items-center justify-between gap-4 p-4">
              <p className="text-body-sm text-navy-200">
                {openIndex !== null ? `${openIndex + 1} of ${items.length}` : ''}
              </p>

              <div className="flex items-center gap-2">
                {current && current.source === 'CLOUDINARY' && current.publicId ? (
                  <a
                    href={displayUrl(current, { full: true })}
                    download
                    className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-body-sm text-navy-200 transition-colors hover:bg-navy-800 hover:text-cream-50"
                  >
                    <Download aria-hidden="true" className="size-4" />
                    Full quality
                  </a>
                ) : null}

                <Dialog.Close asChild>
                  <button
                    type="button"
                    aria-label="Close"
                    className="inline-flex size-11 items-center justify-center rounded-md text-navy-200 transition-colors hover:bg-navy-800 hover:text-cream-50"
                  >
                    <X aria-hidden="true" className="size-6" />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4">
              {items.length > 1 ? (
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous image"
                  className="absolute left-2 z-10 inline-flex size-12 items-center justify-center rounded-full bg-navy-900/80 text-cream-50 transition-colors hover:bg-navy-800"
                >
                  <ChevronLeft aria-hidden="true" className="size-6" />
                </button>
              ) : null}

              {current ? (
                /* The untouched original — `full: true` produces a Cloudinary
                   URL with no transformation segment at all. Deliberately a
                   plain <img>: routing it through the optimiser would re-encode
                   the very file we promised not to touch. */
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={displayUrl(current, { full: true })}
                  alt={current.altText ?? ''}
                  className="max-h-full max-w-full object-contain"
                />
              ) : null}

              {items.length > 1 ? (
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next image"
                  className="absolute right-2 z-10 inline-flex size-12 items-center justify-center rounded-full bg-navy-900/80 text-cream-50 transition-colors hover:bg-navy-800"
                >
                  <ChevronRight aria-hidden="true" className="size-6" />
                </button>
              ) : null}
            </div>

            {current?.caption ? (
              <p className="px-6 pb-6 text-center text-body-sm text-navy-200">
                {current.caption}
              </p>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
