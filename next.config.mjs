import { readFileSync } from 'node:fs'
import { URL } from 'node:url'
import createNextIntlPlugin from 'next-intl/plugin'

const { version: appVersion } = JSON.parse(
  readFileSync(new URL('./app-version.json', import.meta.url), 'utf-8'),
)

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  turbopack: {},
  // Tree-shake icon + animation libraries with deep barrel exports so we
  // only ship the few we actually use. Saves tens of KB and reduces TBT.
  experimental: {
    globalNotFound: true,
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
