import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
    WEBSOCKET_URL: process.env.WEBSOCKET_URL,
  },
};

export default nextConfig;
