import { readFileSync } from 'node:fs'
import { URL } from 'node:url'
import createNextIntlPlugin from 'next-intl/plugin'

const { version: appVersion } = JSON.parse(
  readFileSync(new URL('./app-version.json', import.meta.url), 'utf-8'),
)

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')
const isDevelopment = process.env.NODE_ENV === 'development'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The production build remains a pure static export. Keeping export mode on
  // during `next dev` makes concurrent first-route compilation race while
  // updating prerender-manifest.json in Next 16.
  output: isDevelopment ? undefined : "export",
  turbopack: {},
  // Tree-shake icon + animation libraries with deep barrel exports so we
  // only ship the few we actually use. Saves tens of KB and reduces TBT.
  experimental: {
    // The custom document is required by the exported production artifact.
    // Development uses Next's built-in 404 so a concurrent missing-route
    // compile cannot contend with valid first-route compilation.
    globalNotFound: !isDevelopment,
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
  images: {unoptimized: true},
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
  },
};

export default withNextIntl(nextConfig);
