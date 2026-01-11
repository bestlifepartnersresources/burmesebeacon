// src/app/metadata.ts
import type { Metadata, Viewport } from "next";
export const viewport: Viewport = {
  themeColor: "#001f3f",
  width: "device-width",
  initialScale: 1,
};
export const metadata: Metadata = {
  manifest: "/manifest.json", // ဒါကို ထည့်ပေးမှ Browser က PWA မှန်း သိမှာပါ
  title: "Burmese Beacon",
  description: "ပြည်ထောင်စုသမ္မတမြန်မာနိုင်ငံတော်၏ ဥပဒေအဖြာဖြာကို အလွယ်တကူ လေ့လာသင်ယူနိုင်သော အက်ပ်လ်",
  
  icons: {
    icon: "/favicon.ico",
    apple: [
      { url: "/icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
       { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
};