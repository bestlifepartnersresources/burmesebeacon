'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useMemo } from 'react'
import { Worker, Viewer } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'

// လိုအပ်တဲ့ CSS Styles တွေကို Import လုပ်ပါ
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'

function ViewPDFContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawUrl = searchParams.get('url')
  
  // PDF Viewer ရဲ့ Toolbar တွေ (Sidebar, Zoom, Print) ပါတဲ့ Plugin ကို ခေါ်ယူခြင်း
  const defaultLayoutPluginInstance = defaultLayoutPlugin()

  // URL ထဲက %2F တွေကို Decode လုပ်ပြီး Hugging Face လင့်ခ်ကို ပြင်ဆင်ခြင်း
  const finalPdfUrl = useMemo(() => {
    if (!rawUrl) return null
    let decoded = decodeURIComponent(decodeURIComponent(rawUrl))
    if (decoded.includes('huggingface.co')) {
      return decoded.replace('/blob/', '/resolve/')
    }
    return decoded
  }, [rawUrl])

  if (!finalPdfUrl) {
    return <div className="flex items-center justify-center h-screen bg-[#001f3f] text-white">PDF လင့်ခ် ရှာမတွေ့ပါ</div>
  }

  return (
    <div className="flex flex-col h-screen bg-[#001f3f]">
      {/* Header Bar */}
      <div className="h-14 bg-[#001f3f] flex items-center justify-between px-4 z-30 border-b border-white/10">
        <button
          onClick={() => router.back()}
          className="text-white flex items-center gap-2 font-medium bg-white/5 px-3 py-1.5 rounded-md hover:bg-white/10"
        >
          ‹ Back
        </button>
        <span className="text-white/70 text-sm truncate max-w-[200px]">Secure Reader</span>
      </div>

      {/* PDF Viewer - ဖိုင်အကြီးကြီးတွေကို မြန်မြန်ဖွင့်ပေးမယ့်အပိုင်း */}
      <div className="flex-1 overflow-hidden relative bg-white">
       <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
  <Viewer fileUrl={finalPdfUrl} plugins={[defaultLayoutPluginInstance]} />
</Worker>

        {/* Anti-Screenshot Watermark */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-10">
          <p className="text-[#000]/[0.03] -rotate-45 text-8xl font-black uppercase select-none">
            Burmese Beacon
          </p>
        </div>
      </div>
    </div>
  )
}

// Main Export Component
export default function ViewPDF() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-[#001f3f] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="animate-pulse">စာအုပ်ကို အဆင်သင့်ဖြစ်အောင် ပြင်ဆင်နေပါသည်...</p>
      </div>
    }>
      <ViewPDFContent />
    </Suspense>
  )
}