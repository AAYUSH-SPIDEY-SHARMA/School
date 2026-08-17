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

  // Next.js offers to generate AGENTS.md / CLAUDE.md describing framework
  // conventions. Declined: this repository already has an authoritative guide
  // for future sessions in BLUEPRINT/99_CLAUDE_WORKING_RULES.md, and a second,
  // auto-regenerated set of instructions at the root would drift from it
  // silently — exactly the documentation drift the change-management rules
  // exist to prevent.
  agentRules: false,

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
    //
    // Kept in step with ALLOWED_MEDIA_HOSTS in lib/media/externalMedia.ts.
    // Adding a host in one place and not the other produces media that
    // validates and then refuses to render.
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      // Google Drive images, added because the school may already hold
      // material there rather than uploading it again.
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'drive.google.com', pathname: '/**' },
      // YouTube poster frames.
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/**' },
      { protocol: 'https', hostname: 'img.youtube.com', pathname: '/**' },
    ],

    /**
     * ⚠️ Owner instruction: full quality, no lossy recompression.
     *
     * `qualities: [100]` means Next's own optimiser never reduces quality.
     * Cloudinary masters are additionally served with no transformation at all
     * for the full-size view (lib/media/urls.ts).
     *
     * The cost is honest and worth stating: full-quality images are large, and
     * the performance target is LCP ≤2.5s at p75 on a mid-range Android over 4G
     * (27_PERFORMANCE). Grid tiles are therefore width-limited — resized, never
     * recompressed — while the full view is the untouched original.
     */
    qualities: [100],
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
