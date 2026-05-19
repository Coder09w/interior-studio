import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-35deae8a-4b35-4721-b3e0-c275d64dc879.space-z.ai",
    ".space.chatglm.site",
  ],
};

export default nextConfig;
