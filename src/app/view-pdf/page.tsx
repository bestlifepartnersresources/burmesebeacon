'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'

function ViewPDFContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const url = searchParams.get('url')
  const [useGoogleViewer, setUseGoogleViewer] = useState(true)

  if (!url) {
    return <div className="flex items-center justify-center h-screen bg-[#001f3f] text-white">No PDF URL provided</div>
  }

  let finalPdfUrl = url;

  // Hugging Face Link Logic
  if (finalPdfUrl.includes('huggingface.co') && finalPdfUrl.includes('/blob/')) {
    finalPdfUrl = finalPdfUrl.replace('/blob/', '/resolve/');
  }

  // Google Viewer URL
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(finalPdfUrl)}&embedded=true`;

  return (
    <div className="relative w-screen h-screen no-select bg-slate-900" onContextMenu={(e) => e.preventDefault()}>
      
      {/* PDF Viewer Logic */}
      {useGoogleViewer ? (
        <iframe
          src={googleViewerUrl}
          className="w-full h-full border-none"
          title="Google PDF Viewer"
        />
      ) : (
        /* Google Viewer အဆင်မပြေရင် Browser ရဲ့ Native Viewer ကို သုံးမယ် (ဖိုင်ဆိုဒ်ကြီးများအတွက် ပိုမြန်သည်) */
        <object
          data={finalPdfUrl}
          type="application/pdf"
          className="w-full h-full"
        >
          <iframe src={finalPdfUrl} className="w-full h-full border-none" />
        </object>
      )}

      {/* Floating Control Buttons */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="bg-[#001f3f]/90 backdrop-blur text-white px-4 py-2 rounded-lg hover:bg-[#002f5f] transition-all shadow-xl text-sm border border-white/10"
          >
            ← Back
          </button>
          
          <button
            onClick={() => setUseGoogleViewer(!useGoogleViewer)}
            className="bg-white/10 backdrop-blur text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all shadow-xl text-sm border border-white/20"
          >
            {useGoogleViewer ? "Switch to Native" : "Switch to Google Viewer"}
          </button>
        </div>

        <a 
          href={finalPdfUrl}
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold shadow-xl hover:bg-yellow-400 transition-all flex items-center gap-2 text-sm"
        >
          Direct View
        </a>
      </div>

      {/* Watermark Overlay (Optionally protects from easy screenshots) */}
      <div className="absolute inset-0 pointer-events-none border-[15px] border-white/5 flex items-center justify-center">
         <p className="text-white/5 -rotate-45 text-6xl font-bold uppercase tracking-widest">Burmese Beacon</p>
      </div>
    </div>
  )
}

export default function ViewPDF() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen bg-[#001f3f] text-white gap-4">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="text-lg font-bold">Document Loading...</p>
          <p className="text-xs text-white/50">Large files may take a moment</p>
        </div>
      </div>
    }>
      <ViewPDFContent />
    </Suspense>
  )
}