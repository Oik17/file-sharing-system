import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['your-s3-bucket-name.s3.amazonaws.com'],
  },
};

export default nextConfig;
