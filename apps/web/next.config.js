/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Triangle deployment
  output: 'export',
  distDir: 'dist',
  trailingSlash: true,

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  transpilePackages: ['@cocuyo/ui', '@cocuyo/types'],

  // Webpack config
  webpack: (config) => {
    // Ignore pino-pretty (optional peer dep of pino)
    config.externals.push('pino-pretty');
    return config;
  },

  // Note: headers() removed - X-Frame-Options: DENY conflicts with iframe hosting in Triangle
  // Security headers should be configured at the hosting layer
};

module.exports = nextConfig;
