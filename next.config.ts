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
    value: "DENY",
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
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: https://*.ufileos.com",
      "connect-src 'self' https://*.vercel.app https://internal-api.z.ai",
      "frame-ancestors 'none'",
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
  // Security headers applied to all responses
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
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
