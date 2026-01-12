import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  
  // PDF.js ရဲ့ Canvas Error အတွက်
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },

  // ဒီအပိုင်းလေး ထည့်လိုက်ပါ (Turbopack Error ကို ကျော်ဖို့)
  experimental: {
    webpackBuildWorker: true,
  }
};

export default nextConfig;