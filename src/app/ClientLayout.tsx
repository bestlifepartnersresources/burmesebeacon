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
  const [mounted, setMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string }>>([]);

  const addNotification = (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    setMounted(true);
    const handleNotify = (event: CustomEvent) => {
      addNotification(event.detail.message);
    };
    window.addEventListener('notify', handleNotify as EventListener);
    return () => window.removeEventListener('notify', handleNotify as EventListener);
  }, []);

  return (
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#001f3f] text-white min-h-screen`}>
      {mounted && showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <PWA />
      <PWAInstallPrompt />
      {children}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </body>
  );
}