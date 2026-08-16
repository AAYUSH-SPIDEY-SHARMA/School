import type { Metadata, Viewport } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';

import './globals.css';

/**
 * Fonts are self-hosted. `next/font` downloads and serves them from our own
 * origin at build time, so there is no third-party font CDN at runtime — one
 * fewer blocking origin, and no visitor data leaked to a third party
 * (10_DESIGN_SYSTEM, 29_ANALYTICS).
 *
 * `display: swap` with a metric-matched fallback means the swap causes no
 * layout shift (NFR-005).
 */
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
  adjustFontFallback: true,
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-source-serif',
  adjustFontFallback: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Never disable zoom — pinch-zoom is an accessibility necessity, not a
  // design inconvenience (WCAG 1.4.4).
  maximumScale: 5,
  themeColor: '#2c3a52',
};

export const metadata: Metadata = {
  // ⚠️ Placeholder title. The school's real name is not known (OD-001).
  title: {
    default: '[SCHOOL_NAME]',
    template: '%s · [SCHOOL_NAME]',
  },
  description: '[SCHOOL_TAGLINE]',
  formatDetection: {
    // A phone number that is not a link is a friction point for the primary
    // persona, who is on a phone.
    telephone: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
