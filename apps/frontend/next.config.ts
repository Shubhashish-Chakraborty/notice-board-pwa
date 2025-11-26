import type { NextConfig } from "next";
import withPWA from "next-pwa";

const withPWAModule = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: false,
  scope: "/",
});

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
};

export default withPWAModule(nextConfig);
