import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '4.5mb',
    },
  },
  images: {
    loader: 'custom',
    loaderFile: './imagekit-loader.ts',
  },
};

export default nextConfig;