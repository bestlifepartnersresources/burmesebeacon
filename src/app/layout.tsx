import { metadata } from "./metadata"; // metadata.ts ကနေ ခေါ်မယ်
import ClientLayout from "./ClientLayout"; // အောက်မှာ အသစ်ဆောက်မယ့် Component

export { metadata }; // ဒါမှ Browser က PWA မှန်း သိမှာပါ

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <ClientLayout>{children}</ClientLayout>
    </html>
  );
}