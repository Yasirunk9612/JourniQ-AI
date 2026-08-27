import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5008",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5008",
      },
    ],
  },
};

export default nextConfig;
