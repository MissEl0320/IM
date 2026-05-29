import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*', // Forwards frontend fetch requests straight to port 5000
      },
    ];
  },
};

export default nextConfig;