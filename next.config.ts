import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Increase limit for file uploads
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "enypxizrldolzhaomnpf.supabase.co", 
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;