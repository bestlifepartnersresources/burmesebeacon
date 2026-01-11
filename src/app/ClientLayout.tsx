'use client'
import { Geist, Geist_Mono } from "next/font/google";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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
  const [showSplash, setShowSplash] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string }>>([]);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);

    // Overview Page (/) ဖြစ်မှ Splash ပြဖို့ စစ်မယ်
    if (pathname === '/') {
      const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
      if (!hasSeenSplash) {
        setShowSplash(true);
      }
    } else {
      setShowSplash(false);
    }

    // Notification Logic
    const handleNotify = (event: any) => {
      const id = Math.random().toString(36).substring(2, 9);
      const message = event.detail?.message || "Success!";
      setNotifications((prev) => [...prev, { id, message }]);
    };

    window.addEventListener('notify', handleNotify as EventListener);
    return () => window.removeEventListener('notify', handleNotify as EventListener);
  }, [pathname]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('hasSeenSplash', 'true');
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (!mounted) return null;

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#001f3f] text-white min-h-screen relative`}>
      {/* Overview Page ဖြစ်မှ Splash ပြမယ် */}
      {pathname === '/' && showSplash ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <>
          <PWA />
          <PWAInstallPrompt />
          <main>{children}</main>
          
          {/* Notifications UI */}
          <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {notifications.map((n) => (
              <div key={n.id} className="pointer-events-auto">
                <Notification
                  message={n.message}
                  onClose={() => removeNotification(n.id)}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}