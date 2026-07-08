import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // static export -> ./out, no server, no API routes
  images: { unoptimized: true }, // required: no image optimization server under static export
  reactStrictMode: true,
};

export default nextConfig;
