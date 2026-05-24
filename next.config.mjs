/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  turbopack: {},
  // Tree-shake icon + animation libraries with deep barrel exports so we
  // only ship the few we actually use. Saves tens of KB and reduces TBT.
  experimental: {
    optimizePackageImports: [
      "react-icons",
      "react-icons/lu",
      "react-icons/fa",
      "react-icons/fa6",
      "react-icons/si",
      "react-icons/go",
      "react-icons/ci",
      "react-icons/md",
      "react-icons/io",
      "react-icons/vsc",
      "framer-motion",
    ],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {unoptimized: true}
};

export default nextConfig;
