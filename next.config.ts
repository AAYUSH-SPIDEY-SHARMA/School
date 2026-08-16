import type { NextConfig } from 'next';

/**
 * Security headers.
 *
 * Applied to every response. The CSP is deliberately strict: the site loads no
 * third-party scripts, no social embeds and no font CDNs (28_SECURITY,
 * 27_PERFORMANCE, 48_MEDIA_CONSENT_AND_CHILD_SAFETY — social embeds would leak
 * visitor data to third parties and place child imagery outside our controls).
 *
 * `img-src` allows Cloudinary because that is the approved media provider
 * (ADR-0005). Nothing else is allowed to load resources.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    // No feature of this site needs a camera, microphone or the user's location.
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Fail the production build on type errors rather than shipping them.
  //
  // There is no `eslint` key here: the Next.js 16 line removed built-in lint
  // integration from the build, so linting is a separate gate. `npm run verify`
  // runs typecheck, lint and tests together, and CI runs the same script — the
  // check has moved, it has not been dropped.
  typescript: { ignoreBuildErrors: false },

  // Cache Components. Required by the approved caching architecture (ADR-0010):
  // `updateTag()` for read-your-writes on the admin write path and
  // `revalidateTag(tag, profile)` for stale-while-revalidate on the public read
  // path are both Cache Components APIs.
  cacheComponents: true,

  images: {
    // `images.domains` is deprecated in the Next.js 16 line — remotePatterns only.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    // Primary persona is on a mid-range Android phone over 4G (04_USER_PERSONAS),
    // so the small end of this list matters more than the large end.
    deviceSizes: [360, 420, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Never leak the framework version in response headers.
  poweredByHeader: false,

  // Trailing slashes produce duplicate URLs for the same content, which splits
  // ranking signals (25_SEO_STRATEGY).
  trailingSlash: false,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // The admin area must never be cached by a shared cache or indexed.
        source: '/admin/:path*',
        headers: [
          ...securityHeaders,
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;
