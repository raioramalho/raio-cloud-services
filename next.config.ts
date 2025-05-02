import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  allowedDevOrigins: ["http://localhost:3000", "http://192.168.1.2:3000", "192.168.1.2", "cloud.local", "cloud"],
};

export default nextConfig;
