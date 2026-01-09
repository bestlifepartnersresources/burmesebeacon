'use client'

import { useRouter, useSearchParams } from 'next/navigation' // Suspense ကို ဒီကနေ ဖြုတ်ပါ
import { Suspense } from 'react'

function ViewPDFContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const url = searchParams.get('url')

  if (!url) {
    return <div className="flex items-center justify-center h-screen">No PDF URL provided</div>
  }

  const pdfUrl = `${url}#toolbar=0&navpanes=0`

  return (
    <div className="relative w-screen h-screen no-select" onContextMenu={(e) => e.preventDefault()}>
      <iframe
        src={pdfUrl}
        className="w-full h-full"
        title="PDF Viewer"
      />
      <div className="absolute inset-0 pointer-events-none"></div>
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 bg-[#001f3f] text-white px-4 py-2 rounded hover:bg-[#002f5f] transition-colors z-10"
      >
        Back
      </button>
    </div>
  )
}

export default function ViewPDF() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading PDF...</div>}>
      <ViewPDFContent />
    </Suspense>
  )
}
