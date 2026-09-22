/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // File uploads go through a Route Handler using the Web File API,
  // so the body size limit is raised for the API route segment only
  // (see FR-11: evidence file constraints — enforced again inside the handler).
  experimental: {
    serverActions: {
      bodySizeLimit: '12mb',
    },
  },
};

module.exports = nextConfig;
