/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add security headers for OAuth (only the essential ones)
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
  },
  // Increase body size limit for file uploads (default is ~4.5MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb'
    }
  }
};

export default nextConfig;
