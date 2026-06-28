import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Google Analytics 4 needs googletagmanager.com (script loader) +
      // google-analytics.com + analytics.google.com (event beacon).
      // 'unsafe-inline' required for the inline gtag init script in layout.tsx.
      // 'unsafe-eval' required for Next.js dev + some lib internals.
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: https://*.ufileos.com https://www.googletagmanager.com https://www.google-analytics.com",
      "connect-src 'self' https://*.vercel.app https://internal-api.z.ai https://us.i.posthog.com https://us-assets.i.posthog.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
      "frame-ancestors 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  output: "standalone",
  allowedDevOrigins: [
    "preview-chat-35deae8a-4b35-4721-b3e0-c275d64dc879.space-z.ai",
    ".space.chatglm.site",
  ],
  // Explicitly tell Next.js that 'three' should not be bundled on the server
  serverExternalPackages: ['three'],
  // Provide empty turbopack config to suppress warnings
  turbopack: {},
  // ── Phase 1.2: Tree-shake barrel exports ──
  // optimizePackageImports tells Next.js's bundler to treat barrel-export
  // packages as tree-shakeable. 'three' CANNOT be listed here because it
  // conflicts with serverExternalPackages in Turbopack — but the webpack
  // externals config below already handles server-side tree shaking.
  // lucide-react is the main win here: 1000+ icons, only ~20 used.
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // ── Phase 1.3: AVIF/WebP image optimization pipeline ──
  // next/image will automatically serve AVIF (best compression) to browsers
  // that support it, falling back to WebP, then to the original format.
  // Vercel's image optimization CDN handles the conversion on-the-fly.
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // ── Headers ──
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // ── Phase 1.5: Immutable cache for static 3D model assets ──
      // GLB/KTX2/thumbnail files use content-hash filenames — they will NEVER
      // change at the same URL. This tells browsers and CDNs to cache them
      // for a full year without revalidation, eliminating repeat downloads.
      {
        source: "/models/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/thumbnails/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Next.js static assets already have immutable hashes in filenames
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
  // Webpack-specific config to exclude Three.js from server bundle
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark three as external on the server so it's not bundled/evaluated
      config.externals = [...(Array.isArray(config.externals) ? config.externals : []), 'three'];
    }
    return config;
  },
};

export default nextConfig;
