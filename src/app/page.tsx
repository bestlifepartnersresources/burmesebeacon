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
  const { isInstallable, isStandalone, installApp, isInstalling } = usePWA()
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
    <div className="min-h-screen bg-[#001f3f] text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#001f3f] border-b border-[#D4AF37] p-3 md:p-4">
  <div className="max-w-full w-full px-2 md:px-6 flex justify-between items-center">
    {/* Logo - ဘယ်ဘက်မှာ အမြဲရှိနေမယ် */}
    <Logo />
    
    {/* ညာဘက်ခြမ်း: စာသားနဲ့ ခလုတ်ကို အပေါ်အောက် ထပ်မယ် */}
    <div className="flex flex-col md:flex-row items-center md:items-center gap-1 md:gap-4"> 
      <span className="text-white text-[10px] md:text-sm opacity-80 leading-tight whitespace-nowrap">
        Install for quick learning
      </span>
      <button
        onClick={installApp}
        disabled={isInstalling}
        className="bg-[#D4AF37] text-[#001f3f] px-3 py-1.5 md:px-5 md:py-2 rounded-lg font-bold hover:bg-[#B8962E] transition-colors text-[10px] md:text-sm whitespace-nowrap shadow-md"
      >
        {isInstalling ? "Installing..." : "Install App"}
      </button>
    </div>
  </div>
</header>

      {/* Hero Section - Height ကို auto ပြောင်းလိုက်ပါ */}
      <section className="relative w-full h-auto">
        <div className="relative w-full aspect-[4/3] md:aspect-[21/9] overflow-hidden"> 
          <Image
            src="/myanmarflag.png"
            fill
            className="object-cover"
            alt="Myanmar Flag"
            priority
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-white text-xl md:text-5xl font-bold mb-2 md:mb-4 leading-tight">
              Learn Myanmar Laws Easily
            </h1>
            <p className="text-white/90 text-[10px] md:text-lg mb-4 md:mb-8 max-w-2xl">
              Master legal topics through engaging videos and audio content.
            </p>
            <button
              onClick={handleGetStart}
              className="px-6 py-2 md:px-10 md:py-4 text-xs md:text-xl font-bold text-[#001f3f] rounded-lg bg-[#D4AF37] hover:bg-[#B8962E] transition-all shadow-lg active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Ads Section - ရောင်စုံလိုင်းပြေး Animation */}
      <section className="relative overflow-hidden py-10 md:py-16 bg-blue-900/10 border-y border-white/10">
  {/* CSS Animation Logic */}
  <style jsx>{`
    @keyframes rainbow-move {
      0% { transform: translateX(-50%); }
      100% { transform: translateX(50%); }
    }
    .rainbow-line {
      width: 200%;
      height: 3px;
      background: linear-gradient(to right, transparent, white, red, yellow, green, transparent);
      animation: rainbow-move 3s linear infinite;
    }
  `}</style>

  {/* အပေါ်လိုင်း */}
  <div className="absolute top-0 left-0 w-full overflow-hidden">
    <div className="rainbow-line"></div>
  </div>

  {/* အောက်လိုင်း */}
  <div className="absolute bottom-0 left-0 w-full overflow-hidden">
    <div className="rainbow-line" style={{ animationDirection: 'reverse' }}></div>
  </div>

  <div className="container mx-auto px-4 text-center">
    <h2 className="text-[#D4AF37] text-lg md:text-4xl font-bold tracking-wide">
      {ads.length > 0 ? ads[currentAdIndex]?.ad_text : 'Loading...'}
    </h2>
  </div>
</section>

      {/* Content Sections - ကပ်လျက်ဖြစ်အောင် gap သတ်မှတ်မယ် */}
      <main className="flex flex-col">
        {content.map((item, index) => (
          <section key={index} className="w-full py-4 md:py-8 border-b border-[#D4AF37]/10 last:border-0">
            <div className="bg-[#001f3f]/40 backdrop-blur-sm border border-[#D4AF37]/20 rounded-xl overflow-hidden mx-4 md:mx-10 shadow-xl">
              <h3 className="text-[#D4AF37] text-lg md:text-3xl font-bold text-center py-4 bg-black/20">
                {item.title}
              </h3>
              
              {item.video_url && (
                <div className="aspect-video w-full">
                  <video
                    src={getDirectVideoLink(item.video_url)}
                    autoPlay muted loop playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-4 md:p-8">
                <p className="text-gray-200 text-sm md:text-2xl leading-relaxed text-justify md:text-justify"style={{ textIndent: '2rem'}}>
                  {item.description}
                </p>
              </div>
            </div>
          </section>
        ))}
      </main>

      <Footer />
    </div>
  );
}