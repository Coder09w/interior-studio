import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  output: "standalone",
  allowedDevOrigins: [
    "preview-chat-35deae8a-4b35-4721-b3e0-c275d64dc879.space-z.ai",
    ".space.chatglm.site",
  ],
  // Explicitly tell Next.js that 'three' should not be bundled on the server
  serverExternalPackages: ['three'],
  // Provide empty turbopack config to suppress warnings
  turbopack: {},
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
