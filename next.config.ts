import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'http://localhost:3001/:path*',
      },
    ];
  },
  
  // CRITICAL: Disable caching to prevent old tokens/data from persisting
  experimental: {
    // Disable router cache to prevent stale data
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
  
  // Disable static page caching
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 0,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 0,
  },
};

export default nextConfig;
