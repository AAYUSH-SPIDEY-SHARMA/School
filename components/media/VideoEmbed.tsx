'use client';

import { Play } from 'lucide-react';
import * as React from 'react';

interface VideoEmbedProps {
  source: 'YOUTUBE' | 'GOOGLE_DRIVE';
  externalId: string;
  title: string;
  posterUrl?: string | null;
}

/**
 * Video embed behind a click-to-play facade.
 *
 * ⚠️ NOTHING IS REQUESTED FROM YOUTUBE OR GOOGLE UNTIL THE VISITOR CLICKS.
 *
 * A normal YouTube iframe contacts Google on page load and pulls in several
 * hundred kilobytes of player JavaScript, whether or not anyone watches. That
 * is a privacy cost for every visitor — including parents who only came to read
 * the notices — and a performance cost on the 4G connections this site is built
 * for (29_ANALYTICS, 27_PERFORMANCE).
 *
 * The facade shows the poster frame, which is a single image. The real player
 * loads only on a deliberate click, and via `youtube-nocookie.com`.
 *
 * The blueprint rejects social media embeds outright for the same reason. Video
 * is the one exception, because the school genuinely needs to show video it
 * cannot host — and it is a deliberate, visible action rather than a silent
 * background request.
 */
export function VideoEmbed({
  source,
  externalId,
  title,
  posterUrl,
}: VideoEmbedProps) {
  const [playing, setPlaying] = React.useState(false);

  const embedUrl =
    source === 'YOUTUBE'
      ? `https://www.youtube-nocookie.com/embed/${externalId}?autoplay=1&rel=0&modestbranding=1`
      : `https://drive.google.com/file/d/${externalId}/preview`;

  const poster =
    posterUrl ??
    (source === 'YOUTUBE'
      ? `https://i.ytimg.com/vi/${externalId}/maxresdefault.jpg`
      : `https://drive.google.com/thumbnail?id=${externalId}&sz=w1600`);

  if (playing) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-lg bg-navy-950">
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative block aspect-video w-full overflow-hidden rounded-lg bg-navy-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {/* A plain <img>, not next/image: these are third-party poster frames of
          unknown dimensions, and the optimiser would add a round trip for no
          benefit on an image that is already sized by the provider. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt=""
        loading="lazy"
        decoding="async"
        className="size-full object-cover opacity-85 transition-opacity duration-(--duration-base) group-hover:opacity-100"
        onError={(event) => {
          // maxresdefault does not exist for every YouTube video.
          if (source === 'YOUTUBE') {
            event.currentTarget.src = `https://i.ytimg.com/vi/${externalId}/hqdefault.jpg`;
          }
        }}
      />

      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-16 place-items-center rounded-full bg-cream-50/95 shadow-lg transition-transform duration-(--duration-base) group-hover:scale-110">
          <Play
            aria-hidden="true"
            className="size-7 translate-x-0.5 fill-navy-900 text-navy-900"
          />
        </span>
      </span>

      <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-navy-950/90 to-transparent p-4 text-left">
        <span className="block text-body-sm font-medium text-cream-50">{title}</span>
        <span className="mt-0.5 block text-caption text-navy-200">
          Play video · loads from{' '}
          {source === 'YOUTUBE' ? 'YouTube' : 'Google Drive'} when you click
        </span>
      </span>
    </button>
  );
}
