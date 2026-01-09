import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // ပုံတွေ null ဖြစ်တဲ့ error ပျောက်အောင် အောက်က line လေး ထည့်လိုက်ပါ
    unoptimized: true,
  },
  // အကယ်၍ middleware/proxy warning ကို Turbopack မှာ မမြင်ချင်ရင် 
  // ဒါမှမဟုတ် အခြား experimental settings တွေရှိရင် ဒီအောက်မှာ ထည့်နိုင်ပါတယ်
};

export default nextConfig;