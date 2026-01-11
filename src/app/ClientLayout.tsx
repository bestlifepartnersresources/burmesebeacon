'use client'
import { Geist, Geist_Mono } from "next/font/google";
import { useState, useEffect } from "react";
import "./globals.css";
import SplashScreen from "@/components/SplashScreen";
import PWA from "@/components/PWA";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import Notification from "@/components/Notification";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: false,
});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false); // အစမှာ false ထားပါ
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string }>>([]);

  useEffect(() => {
    setMounted(true);

    // ၁။ Session မှာ ကြည့်ဖူးလား စစ်မယ်
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    
    // ၂။ မကြည့်ရသေးရင် Splash ကို ဖွင့်မယ်
    if (!hasSeenSplash) {
      setShowSplash(true);
    }

    const handleNotify = (event: any) => {
      const id = Math.random().toString(36).substring(2, 9);
      const message = event.detail?.message || "Success!";
      setNotifications((prev) => [...prev, { id, message }]);
    };

    window.addEventListener('notify', handleNotify as EventListener);
    return () => window.removeEventListener('notify', handleNotify as EventListener);
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('hasSeenSplash', 'true');
  };

  // ၃။ Hydration error မဖြစ်အောင် Mounted မဖြစ်ခင် ဘာမှမပြသေးဘူး
  if (!mounted) return null;

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#001f3f] text-white min-h-screen relative`}>
      
      {/* ၄။ Splash Screen ကို နေရာလွတ်မထားဘဲ အပေါ်ဆုံးက ထပ်ပြမယ် */}
      {showSplash ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <>
          <PWA />
          <PWAInstallPrompt />
          <main>{children}</main>
          
          {/* Notifications */}
          <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {notifications.map((n) => (
              <div key={n.id} className="pointer-events-auto">
                <Notification
                  message={n.message}
                  onClose={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
