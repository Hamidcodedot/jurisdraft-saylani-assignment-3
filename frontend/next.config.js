/** @type {import('next').NextConfig} */
const isExport = process.env.NEXT_OUTPUT_EXPORT === 'true';

const nextConfig = {
  reactStrictMode: true,
  ...(isExport ? {
    output: 'export',
    images: { unoptimized: true },
  } : {
    async rewrites() {
      if (process.env.BACKEND_API_URL) {
        return [
          {
            source: '/api/:path*',
            destination: `${process.env.BACKEND_API_URL}/api/:path*`,
          },
        ];
      }
      if (process.env.NODE_ENV === 'development') {
        return [
          {
            source: '/api/:path*',
            destination: 'http://127.0.0.1:8000/api/:path*',
          },
        ];
      }
      return [];
    },
  }),
};

module.exports = nextConfig;
