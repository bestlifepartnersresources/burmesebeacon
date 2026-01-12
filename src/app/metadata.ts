import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#001f3f",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  // အခု Warning ပြနေတဲ့ metadataBase ကို ဒီမှာ ထည့်လိုက်ပါ
  metadataBase: new URL("https://burmesebeacon.com"), 

  manifest: "/manifest.json", 
  title: {
    default: "Burmese Beacon - Digital Law Library",
    template: "%s | Burmese Beacon"
  },
  description: "ပြည်ထောင်စုသမ္မတမြန်မာနိုင်ငံတော်၏ ဥပဒေအဖြာဖြာကို အလွယ်တကူ လေ့လာသင်ယူနိုင်သော Digital Law Library",
  
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