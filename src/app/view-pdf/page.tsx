'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ViewPDFContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawUrl = searchParams.get('url')

  if (!rawUrl) {
    return <div className="flex items-center justify-center h-screen bg-[#001f3f] text-white">No PDF URL provided</div>
  }

  // ၁။ URL ကို Decode နှစ်ခါလုပ်ပေးရပါမယ် (ဒါမှ %3A နဲ့ %2F တွေ အကုန်ပြေသွားမှာပါ)
  let finalPdfUrl = decodeURIComponent(decodeURIComponent(rawUrl));

  // ၂။ Hugging Face Logic (blob ကို resolve ပြောင်းတာအပြင် link ကို သန့်စင်ပေးပါမယ်)
  if (finalPdfUrl.includes('huggingface.co')) {
    if (finalPdfUrl.includes('/blob/')) {
      finalPdfUrl = finalPdfUrl.replace('/blob/', '/resolve/');
    }
  }

  // ၃။ Google Docs Viewer က Hugging Face PDF တွေကို အကောင်းဆုံး ဖတ်ပေးနိုင်ပါတယ်
  // encodeURIComponent ကို ဒီမှာပဲ သုံးရပါမယ်
  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(finalPdfUrl)}&embedded=true`;

  return (
    <div className="relative w-screen h-screen no-select bg-slate-900" onContextMenu={(e) => e.preventDefault()}>
      
      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-[#001f3f] flex items-center justify-between px-4 z-30 border-b border-white/10">
        <button
          onClick={() => router.back()}
          className="text-white flex items-center gap-2 font-medium bg-white/5 px-3 py-1.5 rounded-md hover:bg-white/10"
        >
          ‹ Back
        </button>       
      </div>

      {/* PDF Viewer Iframe */}
      <div className="w-full h-full pt-14">
        <iframe
          src={viewerUrl}
          className="w-full h-full border-none"
          title="Professional PDF Viewer"
          allow="fullscreen"
        />
      </div>

      {/* Anti-Screenshot Watermark */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
         <p className="text-white/[0.03] -rotate-45 text-8xl font-black uppercase select-none">
            Burmese Beacon
         </p>
      </div>
    </div>
  )
}

export default function ViewPDF() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen bg-[#001f3f] text-white">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold tracking-widest animate-pulse">LOADING SECURE READER...</p>
      </div>
    }>
      <ViewPDFContent />
    </Suspense>
  )
}