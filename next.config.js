/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static generation for dynamic routes
  experimental: {
    workerThreads: false,
    cpus: 1
  },
  
  // Force dynamic rendering for protected routes
  async generateStaticParams() {
    return [];
  },

  // Add security headers for OAuth
  async headers() {
    return [
      {
        source: '/api/auth/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
