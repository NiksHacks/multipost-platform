/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'scontent.cdninstagram.com', 'platform-lookaside.fbsbx.com'],
  },
  experimental: {
    optimizePackageImports: ['@headlessui/react', '@heroicons/react'],
    webpackBuildWorker: false,
  },
  typescript: {
    // Prevent Next.js from automatically modifying tsconfig.json
    tsconfigPath: './tsconfig.json',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    // Prevent webpack from processing .next directory
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/.next/**', '**/.git/**'],
    };
    return config;
  },
};

module.exports = nextConfig;