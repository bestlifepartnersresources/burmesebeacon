'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { usePWA } from '@/lib/usePWA'

function DashboardPageContent() {
  const [ads, setAds] = useState<any[]>([])
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [content, setContent] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)
  const [hideInstallBar, setHideInstallBar] = useState(false)
  const { isInstallable, isStandalone, installApp, isInstalling } = usePWA()
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)

    if (typeof window !== 'undefined') {
      // ဒီနေရာက setIsStandalone ကို ဖျက်လိုက်ပါ (hook က အလိုအလျောက် လုပ်ပေးလို့ပါ)
      const hideForever = localStorage.getItem('hideBannerForever')
      if (hideForever === 'true') {
        setHideInstallBar(true)
      }
    }
       // Fetch ads from home_ads table
    const fetchAds = async () => {
      const { data, error } = await supabase
        .from('home_ads')
        .select('*')
        .order('created_at')

      if (error) {
        console.error('Error fetching ads:', error)
      } else {
        setAds(data || [])
      }
    }

    // Fetch content from home_card table
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from('home_card')
        .select('title, description, pdf_url')
        .order('created_at')

      if (error) {
        console.error('Error fetching content:', error)
        setContent([])
      } else {
        setContent(data || [])
      }
    }

    fetchAds()
    fetchContent()
  }, [])
  // ၃။ App သွင်းပြီးတာနဲ့ ချက်ချင်း ဖျောက်ဖို့ useEffect အသစ်တစ်ခု ထည့်ပါ
useEffect(() => {
  if (isStandalone) {
    setHideInstallBar(true);
    localStorage.setItem('hideBannerForever', 'true');
  }
}, [isStandalone]);

  useEffect(() => {
    if (ads.length > 0) {
      const adInterval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length)
      }, 3000)

      return () => clearInterval(adInterval)
    }
  }, [ads.length])

  return (
    <div className="flex flex-col min-h-screen">
      {/* First: Install App Bar */}
      {!hideInstallBar && !isStandalone && (
        <div className="bg-blue-400/20 backdrop-blur-md border-b border-blue-200/30 py-3 px-6 w-full flex flex-row items-center justify-between transition-opacity duration-300">
          <h3 className="text-white text-sm md:text-base font-bold">
            Install for quick and easy learning
          </h3>
          <div className="flex items-center gap-3">
<button
   onClick={installApp}
  disabled={isInstalling} // Loading ဖြစ်နေရင် နှိပ်လို့မရအောင် ပိတ်ထားမယ်
  className="bg-[#D4AF37] text-[#001f3f] px-3 py-2 rounded-lg font-bold hover:bg-[#B8962E] transition-colors text-sm whitespace-nowrap"
>
  {isInstalling ? "Installing..." : "Install App"}
</button>
            <button
              onClick={() => {
                setHideInstallBar(true)
                localStorage.setItem('hideBannerForever', 'true')
              }}
              className="text-white hover:text-gray-300 text-xl font-bold"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Second: Hero Section */}
      <section className="mrelative w-full overflow-hidden">
        <div className="relative w-full aspect-[16/9] md: aspect-[3/2] overflow-hidden">
          <Image
            src="/myanmarflag.png"
            fill
            className="object-cover"
            alt="Myanmar Flag"
            priority
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 text-center p-6">
            <h2 className="text-white text-2xl md:text-4xl font-bold drop-shadow-lg" suppressHydrationWarning>
              {isClient ? (ads.length > 0 ? ads[currentAdIndex]?.ad_text : 'Dashboard Content') : 'Loading...'}
            </h2>
          </div>
        </div>
      </section>

      {/* Third: Content Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {content.length > 0 ? content.map((item, index) => (
          <div key={item.id || index} className="relative bg-[#001f3f]/80 backdrop-blur-sm border-4 border-[#D4AF37] rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 min-h-[300px]">
            <div className="absolute inset-0">
              <Image
                src="/logo.png"
                fill
                className="object-cover opacity-20"
                alt="Logo Background"
              />
              <div className="absolute inset-0 bg-black/50"></div>
            </div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="bg-[#001f3f] p-4">
                <h4 className="text-[#D4AF37] text-lg font-bold text-center">{item.title}</h4>
              </div>
              <div className="p-4 flex-1 flex items-center justify-center">
                <p className="text-white text-sm text-center line-clamp-3">
                  {item.description?.length > 100 ? `${item.description.substring(0, 100)}...` : item.description}
                </p>
              </div>
              <div className="p-4">
                <button
                  onClick={() => router.push(`/view-pdf?url=${encodeURIComponent(item.pdf_url)}`)}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full bg-[#87CEEB] text-[#001f3f] py-2 px-4 rounded hover:bg-[#001f3f] hover:text-white transition-colors font-bold"
                  style={{ userSelect: 'none', pointerEvents: 'auto' }}
                >
                  ဖတ်ရှုရန်
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center text-white">
            <p>No content yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex flex-col pt-24"><div className="text-center text-white p-6">Loading Dashboard...</div></div>}>
      <DashboardPageContent />
    </Suspense>
  )
}
