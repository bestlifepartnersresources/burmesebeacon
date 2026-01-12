'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useMemo, ReactElement } from 'react'
import dynamic from 'next/dynamic'

// Viewer components များကို dynamic import လုပ်ပါ
const Viewer = dynamic(() => import('@react-pdf-viewer/core').then((mod) => mod.Viewer), { ssr: false })
const Worker = dynamic(() => import('@react-pdf-viewer/core').then((mod) => mod.Worker), { ssr: false })

import { defaultLayoutPlugin, ToolbarProps, ToolbarSlot } from '@react-pdf-viewer/default-layout'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'

function ViewPDFContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawUrl = searchParams.get('url')

  const renderToolbar = (Toolbar: (props: ToolbarProps) => ReactElement) => (
    <Toolbar>
      {(slots: ToolbarSlot) => {
        const {
          ShowSearchPopover,
          ZoomOut,
          ZoomIn,
          CurrentPageInput,
          NumberOfPages,
          GoToNextPage,
          GoToPreviousPage,
          EnterFullScreen,
          // SwitchTheme ကို ဖြုတ်လိုက်ပါပြီ (User ပြောင်းလို့မရအောင်)
        } = slots;
        
        return (
          <div className="flex items-center justify-between w-full px-2 text-white">
            <div className="flex items-center gap-1">
              <ShowSearchPopover />
            </div>
            <div className="flex items-center gap-2">
              <GoToPreviousPage />
              <div className="flex items-center gap-1">
                <CurrentPageInput /> / <NumberOfPages />
              </div>
              <GoToNextPage />
            </div>
            <div className="flex items-center gap-1">
              <ZoomOut />
              <ZoomIn />
              <EnterFullScreen />
            </div>
          </div>
        );
      }}
    </Toolbar>
  );

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar,
    sidebarTabs: (defaultTabs) => [defaultTabs[0]], 
  });

  const finalPdfUrl = useMemo(() => {
    if (!rawUrl) return null
    let decoded = decodeURIComponent(decodeURIComponent(rawUrl))
    return decoded.includes('huggingface.co') ? decoded.replace('/blob/', '/resolve/') : decoded
  }, [rawUrl])

  if (!finalPdfUrl) return <div className="text-white p-5">PDF URL မရှိပါ။</div>

  return (
    <div className="flex flex-col h-screen bg-[#001f3f]">
      <div className="h-14 bg-[#001f3f] flex items-center px-4 border-b border-white/10 shrink-0">
        <button onClick={() => router.back()} className="text-white bg-white/10 px-4 py-1.5 rounded-md hover:bg-white/20 transition-all">
          ‹ Back
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          {/* theme="dark" ထည့်လိုက်ပါပြီ */}
          <Viewer
            fileUrl={finalPdfUrl}
            plugins={[defaultLayoutPluginInstance]}
            theme="dark" 
          />
        </Worker>
      </div>
    </div>
  )
}

export default function ViewPDF() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#001f3f] text-white flex items-center justify-center">စာအုပ်ကို ပြင်ဆင်နေပါသည်...</div>}>
      <ViewPDFContent />
    </Suspense>
  )
}