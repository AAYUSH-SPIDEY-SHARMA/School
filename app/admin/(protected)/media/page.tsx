import { AlertTriangle, Film, ImageOff, Link2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { AccessDenied } from '@/components/admin/AccessDenied';
import { ExternalMediaForm } from '@/components/admin/ExternalMediaForm';
import { MediaDetailsDialog } from '@/components/admin/MediaDetailsDialog';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { PageHeader } from '@/components/admin/PageHeader';
import { Pagination } from '@/components/admin/Pagination';
import { ADMIN_ONLY, CONTENT_ROLES } from '@/lib/auth/guards';
import { requirePageSession } from '@/lib/auth/pageGuards';
import { thumbnailUrl } from '@/lib/media/urls';
import { getMediaCounts, listMedia } from '@/lib/queries/media';
import { cn } from '@/lib/utils/cn';

export const metadata = { title: 'Media library' };

interface MediaPageProps {
  searchParams: Promise<{ page?: string; filter?: string }>;
}

export default async function MediaLibraryPage({ searchParams }: MediaPageProps) {
  const user = await requirePageSession('/admin/media');

  if (!CONTENT_ROLES.includes(user.role)) {
    return <AccessDenied />;
  }

  const params = await searchParams;
  const needsAttention = params.filter === 'attention';

  const [{ items, page, pageCount, total }, counts] = await Promise.all([
    listMedia({
      page: params.page ? Number(params.page) : 1,
      needsAttention,
    }),
    getMediaCounts(),
  ]);

  const canTakedown = ADMIN_ONLY.includes(user.role);
  const attentionCount = counts.missingAlt + counts.missingConsent;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Media library"
        description="Photographs, documents and videos. Uploads are stored at full quality — nothing is compressed."
      />

      {/* The review queue, surfaced first. An image without alt text cannot be
          published, and an image of children without a recorded consent basis
          is the single thing most worth catching before it goes live. */}
      {attentionCount > 0 || counts.unverifiedExif > 0 ? (
        <div className="rounded-lg border border-warning bg-warning-soft p-4">
          <p className="flex items-center gap-2 text-body font-medium text-gold-900">
            <AlertTriangle aria-hidden="true" className="size-5 shrink-0" />
            {attentionCount + counts.unverifiedExif} item
            {attentionCount + counts.unverifiedExif === 1 ? '' : 's'} need attention
          </p>

          <ul className="mt-2 flex flex-col gap-1 text-body-sm text-gold-900">
            {counts.missingAlt > 0 ? (
              <li>{counts.missingAlt} without alt text — these cannot be published.</li>
            ) : null}
            {counts.missingConsent > 0 ? (
              <li>
                {counts.missingConsent} marked as showing children with no
                recorded consent basis.
              </li>
            ) : null}
            {counts.unverifiedExif > 0 ? (
              <li>
                {counts.unverifiedExif} where location data could not be
                confirmed as removed.
              </li>
            ) : null}
          </ul>

          <Link
            href="/admin/media?filter=attention"
            className="mt-3 inline-block text-body-sm font-medium text-gold-900 underline underline-offset-4"
          >
            Show only these
          </Link>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="upload-heading">
          <h2 id="upload-heading" className="mb-3 text-h4 font-medium text-foreground">
            Upload files
          </h2>
          <MediaUploader />
        </section>

        <section aria-labelledby="link-heading">
          <h2 id="link-heading" className="mb-3 text-h4 font-medium text-foreground">
            Or add a link
          </h2>
          <div className="rounded-lg border border-border bg-surface p-5">
            <ExternalMediaForm />
          </div>
        </section>
      </div>

      <section aria-labelledby="library-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="library-heading" className="text-h4 font-medium text-foreground">
            {needsAttention ? 'Needing attention' : 'All media'}
            <span className="ml-2 text-body-sm font-normal text-foreground-muted">
              {total}
            </span>
          </h2>

          {needsAttention ? (
            <Link
              href="/admin/media"
              className="text-body-sm text-cta underline underline-offset-4"
            >
              Show all
            </Link>
          ) : null}
        </div>

        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border-strong bg-surface-sunken px-6 py-12 text-center text-body-sm text-foreground-muted">
            {needsAttention
              ? 'Nothing needs attention. Every asset has alt text and a consent basis where required.'
              : 'No media yet. Upload photographs or paste a Drive or YouTube link above.'}
          </p>
        ) : (
          <>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((asset) => {
                const missingAlt = !asset.altText?.trim();
                const missingConsent =
                  asset.containsMinors && !asset.consentBasis?.trim();
                const flagged = missingAlt || missingConsent;

                return (
                  <li
                    key={asset.id}
                    className={cn(
                      'overflow-hidden rounded-lg border bg-surface',
                      flagged ? 'border-warning' : 'border-border',
                    )}
                  >
                    <div className="relative aspect-square bg-surface-sunken">
                      {asset.kind === 'DOCUMENT' ? (
                        <div className="flex size-full flex-col items-center justify-center gap-2 p-3 text-center">
                          <Link2 aria-hidden="true" className="size-7 text-foreground-subtle" />
                          <span className="text-caption break-all text-foreground-muted">
                            {asset.fileName}
                          </span>
                        </div>
                      ) : (
                        <Image
                          src={thumbnailUrl(asset, 480)}
                          alt={asset.altText ?? ''}
                          fill
                          quality={100}
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover"
                        />
                      )}

                      {asset.kind === 'VIDEO' ? (
                        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-sm bg-navy-900/85 px-2 py-1 text-caption text-cream-50">
                          <Film aria-hidden="true" className="size-3" />
                          {asset.source === 'YOUTUBE' ? 'YouTube' : 'Drive'}
                        </span>
                      ) : null}

                      {asset.containsMinors ? (
                        <span className="absolute top-2 left-2 rounded-sm bg-navy-900/85 px-2 py-1 text-caption text-cream-50">
                          Children
                        </span>
                      ) : null}

                      {missingAlt ? (
                        <span
                          className="absolute top-2 right-2 rounded-sm bg-warning px-2 py-1 text-caption font-medium text-navy-900"
                          title="No alt text — cannot be published"
                        >
                          <ImageOff aria-hidden="true" className="size-3.5" />
                          <span className="sr-only">No alt text</span>
                        </span>
                      ) : null}
                    </div>

                    <div className="p-2">
                      <p className="truncate text-caption text-foreground-muted">
                        {asset.fileName}
                      </p>
                      <MediaDetailsDialog
                        asset={{
                          id: asset.id,
                          fileName: asset.fileName,
                          altText: asset.altText,
                          caption: asset.caption,
                          containsMinors: asset.containsMinors,
                          consentBasis: asset.consentBasis,
                          source: asset.source,
                          metadataStripped: asset.metadataStripped,
                        }}
                        canTakedown={canTakedown}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6">
              <Pagination
                page={page}
                pageCount={pageCount}
                basePath="/admin/media"
                params={{ filter: params.filter }}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
