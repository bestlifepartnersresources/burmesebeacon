'use client'

import { useState, useEffect } from 'react'
import Image from "next/image";
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import Footer from '@/components/Footer'
import { usePWA } from '@/lib/usePWA'
import { getDirectVideoLink } from '@/lib/helpers'

export default function Home() {
  const [ads, setAds] = useState<any[]>([])
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [content, setContent] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)
  const { isInstallable, isStandalone, installApp } = usePWA()
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
    fetchAds()
    fetchContent()
    router.refresh() // Force fresh data fetching
  }, [])

  useEffect(() => {
    if (ads.length > 0) {
      const adInterval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length)
      }, 3000)

      return () => clearInterval(adInterval)
    }
  }, [ads.length])

  const fetchAds = async () => {
    const { data, error } = await supabase
      .from('overview_ads')
      .select('*')
      .eq('is_displaying', true)
      .order('created_at')

    if (error) {
      console.error('Error fetching ads:', error)
    } else {
      setAds(data || [])
    }
  }

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from('overview_content')
      .select('title, description, video_url')
      .order('created_at')

    if (error) {
      console.error('Error fetching content:', error)
    } else {
      setContent(data || [])
    }
  }

  const handleGetStart = () => {
    router.push('/login')
  }

  const handleContentClick = (item: any) => {
    if (item.video_url) {
      router.push('/videos')
    } else {
      router.push('/pdfs')
    }
  }

  if (!isClient) {
    return <div className="min-h-screen bg-[#001f3f]" />;
  }

  return (
    <div className="min-h-screen bg-[#001f3f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#001f3f] border-b border-[#D4AF37] p-4">
        <div className="max-w-full w-full px-6 flex justify-between items-center">
          <Logo />
          {/* Install App Button - Always visible */}
          <div className="flex items-center gap-3">
            <span className="text-white text-sm hidden sm:inline">Install for quick learning</span>
            <button
              onClick={installApp}
              className="bg-[#D4AF37] text-[#001f3f] px-3 py-2 rounded-lg font-bold hover:bg-[#B8962E] transition-colors text-sm whitespace-nowrap"
            >
              Install App
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full aspect-[3/2] overflow-hidden">
        <Image
          src="/myanmarflag.png"
          fill
          className="object-cover"
          alt="Myanmar Flag"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-6">
          <h1 className="text-white text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Learn Myanmar Laws Easily
          </h1>
          <p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl">
            Master legal topics through engaging videos and audio content. Start your learning journey today.
          </p>
          <button
            onClick={handleGetStart}
            className="bg-[#D4AF37] text-[#001f3f] px-8 py-4 rounded-lg text-xl font-semibold hover:bg-[#B8962E] transition-colors duration-300 shadow-lg"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Ads Section */}
      <section className="bg-blue-400/20 py-16 backdrop-blur-md border-y border-blue-200/30 shadow-lg">
        <div className="container mx-auto text-center">
          <h2 className="text-white text-3xl md:text-4xl font-bold mb-8 drop-shadow-lg">
            {ads.length > 0 ? ads[currentAdIndex]?.ad_text : 'Loading...'}
          </h2>
        </div>
      </section>

      {/* Content Sections */}
      {content.map((item, index) => (
        <section key={item.id || index} className="w-full py-8">
          <div className="bg-[#001f3f]/80 backdrop-blur-sm border border-[#D4AF37]/30 rounded-lg overflow-hidden mx-4">
            <h3 className="text-[#D4AF37] text-2xl font-bold text-center py-4">
              {item.title}
            </h3>
            {item.video_url && (
              <video
                src={getDirectVideoLink(item.video_url)}
                autoPlay
                muted
                loop
                playsInline
                className="w-full object-cover pointer-events-none"
                style={{ pointerEvents: 'none' }}
              />
            )}
            <p className="text-white text-lg leading-relaxed text-justify py-4 px-4">
              {item.description}
            </p>
          </div>
        </section>
      ))}

      {/* Footer */}
      <Footer />
    </div>
  );
}
