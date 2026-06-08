/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  // The container build runs in a clean environment; keep it resilient.
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "@xyflow/react"],
    // Don't bundle the native module — keep it external at runtime (Next 14).
    serverComponentsExternalPackages: ["better-sqlite3"],
    // Ensure the native better-sqlite3 binary is bundled into standalone output.
    outputFileTracingIncludes: {
      "/api/maps/**": ["./node_modules/better-sqlite3/build/Release/*.node"],
    },
  },
};

export default nextConfig;
