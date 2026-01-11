'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ViewPDFContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const url = searchParams.get('url')

  if (!url) {
    return <div className="flex items-center justify-center h-screen bg-[#001f3f] text-white">No PDF URL provided</div>
  }

  // ၁။ URL Logic ကို အချောသတ်မယ်
  let finalPdfUrl = url;

  // Hugging Face Link ဖြစ်နေရင် Viewer page (/blob/) အစား Direct file (/resolve/) သို့ ပြောင်းမယ်
  if (finalPdfUrl.includes('huggingface.co') && finalPdfUrl.includes('/blob/')) {
    finalPdfUrl = finalPdfUrl.replace('/blob/', '/resolve/');
  }

  // ၂။ Google Docs Viewer URL (ဖုန်းမှာ PDF ပေါ်စေဖို့ အသေချာဆုံးနည်းလမ်း)
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(finalPdfUrl)}&embedded=true`;

  return (
    <div className="relative w-screen h-screen no-select bg-slate-900" onContextMenu={(e) => e.preventDefault()}>
      {/* PDF Viewer Iframe */}
      <iframe
        src={googleViewerUrl}
        className="w-full h-full border-none"
        title="PDF Viewer"
      />

      {/* Control Buttons */}
      <div className="absolute top-4 left-4 flex gap-3 z-20">
        <button
          onClick={() => router.back()}
          className="bg-[#001f3f] text-white px-5 py-2 rounded-lg hover:bg-[#002f5f] transition-all shadow-xl font-medium border border-white/10"
        >
          ← Back
        </button>
        
        {/* Direct Link - Viewer အလုပ်မလုပ်ရင် နှိပ်ဖို့ (Supabase/HF နှစ်ခုလုံးအတွက်) */}
        <a 
          href={finalPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-yellow-500 text-black px-5 py-2 rounded-lg font-bold shadow-xl hover:bg-yellow-400 transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
          </svg>
          Direct View
        </a>
      </div>

      {/* Screen Protection Overlay */}
      <div className="absolute inset-0 pointer-events-none border-[10px] border-white/5"></div>
    </div>
  )
}

export default function ViewPDF() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen bg-[#001f3f] text-white gap-4">
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Opening PDF Document...</p>
      </div>
    }>
      <ViewPDFContent />
    </Suspense>
  )
}