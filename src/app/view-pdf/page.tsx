'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useMemo, ReactElement } from 'react'
import dynamic from 'next/dynamic'
import { zoomPlugin } from '@react-pdf-viewer/zoom'

const Viewer = dynamic(() => import('@react-pdf-viewer/core').then((mod) => mod.Viewer), { ssr: false })
const Worker = dynamic(() => import('@react-pdf-viewer/core').then((mod) => mod.Worker), { ssr: false })

import { defaultLayoutPlugin, ToolbarProps, ToolbarSlot } from '@react-pdf-viewer/default-layout'
import { SpecialZoomLevel } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'

function ViewPDFContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawUrl = searchParams.get('url')
 

  // ၁။ Loading ပြနေချိန်မှာ စာသားထည့်ဖို့ function
  const renderLoader = () => (
    <div className="flex flex-col items-center justify-center w-full h-full text-[#FFD700] bg-[#001f3f]">
      <div className="relative flex items-center justify-center">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-[#60a5fa]/30"></div>
        <div className="absolute animate-spin rounded-full h-12 w-12 border-r-4 border-l-4 border-[#FFD700]"></div>
      </div>
      <div className="mt-6 text-center">
        <p className="text-xl md:text-2xl font-bold tracking-widest animate-pulse">
          ဖတ်ရှုနိုင်ရန် ပြင်ဆင်နေပါသည်။
        </p>
        <p className="text-sm md:text-base text-white mt-2 opacity-80">
          ခေတ္တစောင့်ဆိုင်းပေးပါ...
        </p>
      </div>
    </div>
  );
const zoomPluginInstance = zoomPlugin();
  const renderToolbar = (Toolbar: (props: ToolbarProps) => ReactElement) => (
    <Toolbar>
      {(slots: ToolbarSlot) => {
        const {
          ZoomOut,
          ZoomIn,
          CurrentPageInput,
          NumberOfPages,
          GoToNextPage,
          GoToPreviousPage,
        } = slots;
        
        return (
          /* z-50 နှင့် sticky ထည့်ထားခြင်းက Toolbar ကို ငြိမ်နေစေပါသည် */
          <div className="sticky top-0 z-50 flex items-center justify-between w-full px-4 h-14 bg-[#001f3f] border-b border-[#60a5fa]/30 shrink-0">
            {/* ဘယ်ဘက်: Back Button */}
            <div className="flex items-center">
              <button 
                onClick={() => router.back()} 
                className="text-[#FFD700] hover:bg-white/10 px-3 py-1.5 rounded-md border border-[#60a5fa]/40 transition-all flex items-center gap-1 font-medium"
              >
                <span className="text-xl">‹</span> Back
              </button>
            </div>

            {/* အလယ်: Page Navigation */}
            <div className="flex items-center gap-1">
              <div className="border border-[#60a5fa]/50 rounded bg-blue-900/20"><GoToPreviousPage /></div>
              <div className="flex items-center gap-2 px-3">
                <div className="w-12 text-center">
                   <CurrentPageInput />
                </div>
                <span className="text-[#FFD700] font-bold">/ <NumberOfPages/></span>
              </div>
              <div className="border border-[#60a5fa]/50 rounded bg-blue-900/20"><GoToNextPage /></div>
            </div>

            {/* ညာဘက်: Zoom Controls */}
            <div className="flex items-center gap-1 border border-[#60a5fa]/50 rounded bg-blue-900/20 px-1">
              <ZoomOut />
              <ZoomIn />
            </div>
          </div>
        );
      }}
    </Toolbar>
  );
  
   // defaultLayoutPlugin ထဲတွင် Sidebar ကို ဖျောက်ထားပါသည်
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar,
    sidebarTabs: () => [],    
  });

  const finalPdfUrl = useMemo(() => {
    if (!rawUrl) return null
    let decoded = decodeURIComponent(decodeURIComponent(rawUrl))
    return decoded.includes('huggingface.co') ? decoded.replace('/blob/', '/resolve/') : decoded
  }, [rawUrl])

  if (!finalPdfUrl) return <div className="text-white p-5 text-center">PDF URL မရှိပါ။</div>

  return (
    <div className="flex flex-col h-screen bg-[#001f3f] overflow-hidden">
      <div className="flex-1 overflow-hidden relative" data-rpv-theme="dark">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={finalPdfUrl}
            plugins={[defaultLayoutPluginInstance, zoomPluginInstance]}
            theme="dark"
            defaultScale={SpecialZoomLevel.PageWidth}
            renderLoader={renderLoader}
          />
        </Worker>
      </div>

      <style jsx global>{`
        /* ၁။ PDF စာမျက်နှာနောက်ခံကို နက်ပြာရောင်ထားခြင်း */
        .rpv-core__inner-pages {
          background-color: #001f3f !important;
          touch-action: none !important;
        }
        /* ၂။ Icon များအားလုံးကို ရွှေရောင်ပြောင်းခြင်း */
        .rpv-core__icon, .rpv-core__button {
          color: #FFD700 !important;
        }
        /* ၃။ Button Box များကို အပြာနုရောင် Border ထားခြင်း */
        .rpv-core__button {
          border-radius: 4px !important;
          transition: all 0.2s;
        }
        .rpv-core__button:hover {
          background-color: rgba(96, 165, 250, 0.2) !important;
        }
        /* ၄။ Page Number Input Box ကို အဖြူရောင်နောက်ခံ၊ အပြာနု Border ထားခြင်း */
        .rpv-core__textbox {
          background-color: #f0f4f8 !important;
          border: 2px solid #60a5fa !important;
          color: #001f3f !important;
          font-weight: bold !important;
          border-radius: 4px !important;
          text-align: center;
        }
        /* ၅။ အရေးကြီးဆုံး: လက်နဲ့ zoom ဆွဲရင် Toolbar ပါမလာအောင် လုပ်ခြင်း */
        .rpv-core__viewer {
          touch-action: none !important; 
          -ms-touch-action: none !important;
        }
        /* Toolbar ကို Fixed ဖြစ်နေစေရန် CSS မှ ထပ်မံ ထိန်းချုပ်ခြင်း */
        .rpv-default-layout__toolbar {
          position: sticky !important;
          top: 0 !important;
          z-index: 100 !important;
          background-color: #001f3f !important;
        }
      `}</style>
    </div>
  )
}

export default function ViewPDF() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#001f3f] text-[#FFD700] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD700] mb-4"></div>
        စာအုပ်ကို ပြင်ဆင်နေပါသည်...
      </div>}>
      <ViewPDFContent />
    </Suspense>
  )
}