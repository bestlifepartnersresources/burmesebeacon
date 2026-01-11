import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#001f3f",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  manifest: "/manifest.json", 
  title: {
    default: "Burmese Beacon - Digital Law Library", // အမည်အပြည့်အစုံ
    template: "%s | Burmese Beacon" // တခြား Page တွေမှာ ဥပမာ - Login | Burmese Beacon လို့ ပေါ်ဖို့
  },
  description: "ပြည်ထောင်စုသမ္မတမြန်မာနိုင်ငံတော်၏ ဥပဒေအဖြာဖြာကို အလွယ်တကူ လေ့လာသင်ယူနိုင်သော Digital Law Library",
  
  // Google မှာ ရှာရင် ပေါ်မယ့် URL အမှန် (Canonical URL)
  alternates: {
    canonical: "https://burmesebeacon.com",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: [
      { url: "/icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },

  // Social Media မှာ Share ရင် ပေါ်မယ့် ပုံစံ (OpenGraph)
  openGraph: {
    title: "Burmese Beacon",
    description: "မြန်မာဥပဒေများကို တစ်နေရာတည်းတွင် လေ့လာပါ။",
    url: "https://burmesebeacon.com",
    siteName: "Burmese Beacon",
    images: [
      {
        url: "/icon-512.png", // Share ရင် ပေါ်စေချင်တဲ့ ပုံ
        width: 512,
        height: 512,
      },
    ],
    locale: "my-MM",
    type: "website",
  },
};