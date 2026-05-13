import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  outputFileTracingIncludes: {
    "/api/**/*": ["./src/generated/prisma/**/*"],
  },
  images: {
    // Cache optimised images for a week — the default is 60 s which means
    // Next.js re-runs the optimiser on every fresh request after a minute
    minimumCacheTTL: 604800,
    // AVIF is ~40% smaller than WebP; WebP is the fallback for older browsers
    formats: ["image/avif", "image/webp"],
    // Allow Google and GitHub OAuth avatar URLs to be optimised by Next.js
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
