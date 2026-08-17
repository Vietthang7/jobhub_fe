/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendOrigin = process.env.BACKEND_ORIGIN || 'http://localhost:9527/jobhub/api/v1';
    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/:path*`,
      },
    ];
  },
  env: {
    API_BASE: '/api',
  },
};

module.exports = nextConfig;
