'use client'

import { useState, useEffect, Suspense } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'
import { usePWA } from '@/lib/usePWA'
import Dashboard from './Dashboard'


function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentSection, setCurrentSection] = useState('home')
  const { isInstallable, isStandalone, installApp, isInstalling } = usePWA()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Sync currentSection with URL pathname and searchParams
    if (pathname.startsWith('/dashboard/')) {
      const pathParts = pathname.split('/').filter(Boolean)
      if (pathParts.length >= 2) {
        const category = pathParts[1]
        const sub = searchParams.get('sub')
        if (sub) {
          setCurrentSection(`${category}-${sub}`)
        } else if (category === 'saved') {
          setCurrentSection('saved')
        } else {
          setCurrentSection('home')
        }
      }
    }
  }, [pathname, searchParams])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="min-h-screen bg-[#001f3f] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#001f3f] border-b border-[#ffd700] p-4 z-40">
        <div className="max-w-full w-full px-6 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="mr-4 p-2 bg-[#ffd700] text-[#001f3f] rounded hover:bg-[#e6c200] transition-colors"
            >
              ☰
            </button>
            <Logo />
          </div>

          {/* Search Bar and Install App */}
          <div className="flex items-center gap-3">
  {searchOpen ? (
    /* Search Bar ဖွင့်ထားချိန် - Header တစ်ခုလုံးကို အပေါ်က ဖုံးအုပ်မည့် Full-Width Search */
    <div className="fixed inset-0 bg-[#001f3f] z-50 flex items-center px-4 md:px-10 h-[73px] border-b border-[#ffd700] animate-in slide-in-from-top duration-300">
      <div className="flex items-center w-full max-w-7xl mx-auto gap-4">
        
        {/* ပိတ်သည့်ခလုတ် (X) ကို ဘယ်ဘက်အစွန်းတွင် ထားခြင်း */}
        <button
          onClick={() => {
            setSearchOpen(false);
            setSearchQuery('');
          }}
          className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <span className="text-2xl">✕</span>
        </button>

        <div className="flex-1 flex items-center relative">
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                // URL ကနေ လက်ရှိ section ကို ယူပြီး ပို့ပေးမယ် (ဒါမှ ဒုတိယအကြိမ်မှာ မပျောက်မှာ)
                const params = new URLSearchParams(window.location.search);
                const activeSection = params.get('section') || currentSection;
                router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}&section=${activeSection}`);
              }
            }}
            placeholder={currentSection === 'home' ? "အားလုံးထဲမှာ ရှာမယ်..." : `${currentSection} အတွင်း ထပ်မံရှာဖွေမယ်...`}
            className="w-full bg-blue-900/40 text-white border-b-2 border-[#ffd700] px-4 py-2 text-lg focus:outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Search စာသားဖြင့် Button ကို ညာဘက်တွင် ထားခြင်း */}
        <button
          onClick={() => {
            const params = new URLSearchParams(window.location.search);
            const activeSection = params.get('section') || currentSection;
            router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}&section=${activeSection}`);
          }}
          className="bg-[#ffd700] text-[#001f3f] px-6 py-2 rounded font-bold hover:bg-[#e6c200] transition-transform active:scale-95"
        >
          SEARCH
        </button>
      </div>
    </div>
  ) : (
    /* ပိတ်ထားချိန်တွင် ပုံမှန် မှန်ဘီလူးပုံစံ */
    <button
      onClick={() => setSearchOpen(true)}
      className="p-2 bg-[#ffd700] text-[#001f3f] rounded hover:bg-[#e6c200] transition-colors"
    >
      🔍
    </button>
  )}

           
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onSectionChange={setCurrentSection} />

      {/* Main Content */}
      <main className="pt-24">
        {pathname === '/dashboard' || pathname === '/dashboard/search' || pathname === '/dashboard/saved' ? children : <Dashboard currentSection={currentSection} />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#001f3f] text-white flex items-center justify-center"><p className="text-white">ခေတ္တစောင့်ဆိုင်းပေးပါ...</p></div>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  )
}

