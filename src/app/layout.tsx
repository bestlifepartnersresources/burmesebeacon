import { Geist } from "next/font/google";
import { metadata, viewport } from "./metadata"; 
import ClientLayout from "./ClientLayout"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export { metadata, viewport }; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // --- Google Search Sitelinks အတွက် JSON-LD Schema ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Burmese Beacon",
    "alternateName": ["BurmeseBeacon", "BB Law Library"],
    "url": "https://burmesebeacon.com",
    "description": "မြန်မာဥပဒေစာအုပ်များကို တစ်နေရာတည်းတွင် အလွယ်တကူ ရှာဖွေဖတ်ရှုနိုင်သော Digital Library",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://burmesebeacon.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        {/* Google Bot တွေအတွက် Website Structure ကို ဒီမှာ ထည့်ပေးထားပါတယ် */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}