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
  }
};

module.exports = nextConfig;
