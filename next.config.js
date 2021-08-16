/**
 * Next Config
 */
const withPlugins = require('next-compose-plugins');

module.exports = withPlugins([
  {
    // basePath: '/',
    // assetPrefix: '/',
    webpack5: true,
    distDir: 'build',
    reactStrictMode: false,
    devIndicators: {
      autoPrerender: false,
    },
    images: {
      disableStaticImages: true,
      domain: "https://nguyenlephong.github.io/",
      // path: `/_next/image`,
    },
    eslint: {
      dirs: [
        'components',
        'lib',
        'pages'
      ]
    },
    webpack: (config, { dev, isServer }) => {
      // Replace React with Preact only in client production build
      if (!dev && !isServer) {
        config.resolve.fallback = {
          "net": false,
          "fs": false,
          "tls": false,
          "path": false,
          "crypto": false,
          "http": false,
          "stream": false,
          "https": false,
          "zlib": false,
        }
      }
      return config
    }
  },
]);

