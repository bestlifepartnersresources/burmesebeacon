import { Geist, Geist_Mono } from "next/font/google";
import { metadata, viewport } from "./metadata"; // metadata.ts ကနေ ခေါ်မယ်
import ClientLayout from "./ClientLayout"; // အောက်မှာ အသစ်ဆောက်မယ့် Component

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
export { metadata, viewport }; // ဒါမှ Browser က PWA မှန်း သိမှာပါ

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* <body> ကို ဒီမှာပဲ ထားရပါမယ် */}
      <body className={`${geistSans.variable} antialiased`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}