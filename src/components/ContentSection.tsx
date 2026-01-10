'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { Download, Play, Music, FileText, Activity } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { SidebarContent } from '@/lib/types'
import ContentPlayer from './ContentPlayer'
import SavedButton from './SavedButton'


interface ContentSectionProps {
  contents: SidebarContent[]
  currentSection: string
  onUnsave?: (contentId: string) => void
  searchQuery?: string
}
const highlightText = (text: string, query: string) => {
  if (!query || !query.trim()) return text;
  
  // မြန်မာစာအတွက် ပိုစိတ်ချရတဲ့ RegExp logic
  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const safeQuery = escapeRegExp(query);
  const parts = text.split(new RegExp(`(${safeQuery})`, 'gi'));
  
  return (
    <span className="text-white"> {/* ကျန်စာသားအားလုံးကို အဖြူရောင်ပြောင်းလိုက်ခြင်း */}
            {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <span key={i} className="text-[#ffd700] font-extrabold bg-yellow-500/20 px-1 rounded">{part}</span> 
          : part
      )}
    </span>
  );
};
// Marquee Component: ResizeObserver + Dynamic Style ဖြင့် အလိုအလျောက် ရပ်/နှိုး လုပ်ဆောင်မည်
 const ScrollingText = ({ text, className, searchQuery }: { text: string; className: string; searchQuery?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [scrollDistance, setScrollDistance] = useState(0);

  const GAP = 100; // စာသားနှစ်ခုကြား အကွာအဝေးကို ၁၀၀px ထားမယ်

  useEffect(() => {
    const checkOverflow = () => {
      if (!containerRef.current || !textRef.current) return;
      
      const containerW = containerRef.current.offsetWidth;
      const textW = textRef.current.scrollWidth;

      if (textW > containerW) {
        setShouldScroll(true);
        // တိကျတဲ့ ရွေ့ရမယ့် အကွာအဝေး = စာသားအရှည် + ကြားအကွာအဝေး
        setScrollDistance(textW + GAP);
      } else {
        setShouldScroll(false);
      }
    };

    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(containerRef.current!);
    checkOverflow();

    return () => resizeObserver.disconnect();
  }, [text]);

  return (
    <div ref={containerRef} className="overflow-hidden w-full h-6 relative">
      <div
        className="inline-flex items-center whitespace-nowrap"
        style={{
          display: 'inline-flex',
          gap: `${GAP}px`, // စာသားနှစ်ခုကြား နေရာလွတ်
          animation: shouldScroll ? `marquee-logic-flow 12s linear infinite` : 'none',
          // CSS Variable သုံးပြီး အကွာအဝေး ပို့ပေးမယ်
          '--dist': `${scrollDistance}px`
        } as React.CSSProperties}
      >
        <div ref={textRef} className={className}>
          {highlightText(text, searchQuery || '')}
        </div>
        
        {/* စာသားမဆန့်မှသာ ဒုတိယစာသားကို ပြမယ် */}
        {shouldScroll && (
          <div className={className}>
            {highlightText(text, searchQuery || '')}
          </div>
        )}
      </div>
    </div>
  );
};
  const ContentSectionInner: React.FC<ContentSectionProps> = ({ contents, currentSection, onUnsave, searchQuery }) => {
  const [selectedContent, setSelectedContent] = useState<SidebarContent | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const forceDownload = async (url: string, filename: string, contentId: string) => {
  try {
    setDownloadingId(contentId); // နှိပ်လိုက်တဲ့ ID ကို loading ပြမယ်

    window.dispatchEvent(new CustomEvent('notify', { 
      detail: { message: 'ဖိုင်ကို ဒေါင်းလုပ်ဆွဲနေသည်...', type: 'loading' } 
    }));

    const res = await fetch(url);
    if (!res.ok) throw new Error('Download failed');
    
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);

    window.dispatchEvent(new CustomEvent('notify', { 
      detail: { message: 'ဒေါင်းလုပ်ဆွဲပြီးပါပြီ။', type: 'success' } 
    }));

  } catch (error) {
    window.dispatchEvent(new CustomEvent('notify', { 
      detail: { message: 'ဒေါင်းလုပ်ဆွဲရာတွင် အမှားအယွင်းရှိပါသည်။', type: 'error' } 
    }));
  } finally {
    setDownloadingId(null); // အလုပ်ပြီးရင် ပြန်ပိတ်မယ်
  }
};
  // Smart Player Persistence: Only close player when category or subCategory actually changes
  const searchParams = useSearchParams()
  const prevSectionRef = useRef(currentSection)
  useEffect(() => {
    // Only close player if the section actually changes to a different value
    // Keep player open when staying within the same section
    if (prevSectionRef.current !== currentSection && prevSectionRef.current !== '') {
      setSelectedContent(null)
    }
    prevSectionRef.current = currentSection
  }, [currentSection, pathname, contents, searchParams])

  const getContentType = (category: string, subCategory?: string): 'video' | 'music' | 'pdf' | 'other' => {
    const cat = category?.toLowerCase() || ''
    const sub = subCategory?.toLowerCase() || ''
    if (cat === 'videos' || sub === 'videos') return 'video'
    if (cat === 'musics' || sub === 'musics') return 'music'
    if (sub === 'pdf' || sub === 'pdfs') return 'pdf'
    return 'other'
  }

  const getCategoryIcon = (category: string, subCategory?: string, contentId?: string) => {
    const isPlaying = selectedContent?.id === contentId
    const contentType = getContentType(category, subCategory)

    // Show animated sound wave icon for currently playing content (video/music)
    if (isPlaying && (contentType === 'video' || contentType === 'music')) {
      return <Activity className="w-6 h-6 text-green-400 animate-pulse" />
    }

    if (contentType === 'video') return <Play className="w-6 h-6 text-blue-400" />
    if (contentType === 'music') return <Music className="w-6 h-6 text-green-400" />
    return <FileText className="w-6 h-6 text-red-400" />
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6 px-4 pt-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 border-l-4 border-[#ffd700] pl-3">
          {(!currentSection || currentSection === 'home' || currentSection === '') 
            ? "မူလစာမျက်နှာ" 
            : currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
        </h2>
        <span className="text-blue-400 text-xs bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          {contents.length} Items
        </span>
      </div>
      {/* List Area */}
      <div className="flex flex-col gap-3 px-2 pb-20">
        {/* Player at the top of the list */}
        {selectedContent && (
          <div className="w-full bg-[#001f3f] shadow-2xl border border-blue-500/30 mb-4 pb-4">
            <ContentPlayer
              key={selectedContent.id}
              initialContent={selectedContent}
              category={selectedContent.category}
              onClose={() => setSelectedContent(null)}
            />
          </div>
        )}

        {contents.map((content) => (
          <div
            key={content.id}
            className="w-full bg-blue-900/40 p-4 rounded-lg flex items-center justify-between border border-blue-500/20 cursor-pointer hover:bg-blue-800/50 transition-all"
            onClick={() => {
              const contentType = getContentType(content.category, content.sub_category)
              if (contentType === 'pdf') {
                router.push(`/view-pdf?url=${encodeURIComponent(content.content_url)}`)
              } else {
                setSelectedContent(content)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
          >
            <div className="flex-shrink-0 w-10">
              {getCategoryIcon(content.category, content.sub_category, content.id)}
            </div>

            <div className="flex-1 min-w-0 px-2 overflow-hidden">
              <ScrollingText text={content.title} className="text-yellow-500 font-bold text-base" searchQuery={searchQuery} />
              {content.description && (
              <ScrollingText text={content.description} className="text-gray-300 text-xs" />
              )}
            </div>

            <div className="border-l border-white/30 h-8 mx-2"></div>

            <div className="flex-shrink-0 flex items-center gap-2">
              <div onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} className="relative z-10">
                <SavedButton 
  contentId={String(content.id)} 
  mediaType={getContentType(content.category, content.sub_category) as any} 
  onStatusChange={(isSaved) => {
    if (!isSaved && onUnsave) {
      onUnsave(String(content.id));
    }
  }}
/>
              </div>
              <button
  onClick={(e) => { 
    e.stopPropagation(); 
    if (!downloadingId) forceDownload(content.content_url, content.title, String(content.id)); 
  }}
  className="p-2 hover:scale-110 flex items-center justify-center min-w-[40px]"
  disabled={downloadingId === String(content.id)}
>
  {downloadingId === String(content.id) ? (
    // Loading ဖြစ်နေရင် အဝိုင်းလည်မယ်
    <span className="animate-spin inline-block w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"></span>
  ) : (
    // ပုံမှန်ဆိုရင် မူလ Download Icon ပဲ ပြမယ်
    <Download className="w-5 h-5 text-blue-400" />
  )}
</button>
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
      @keyframes marquee-logic-flow {
    /* အစမှာ ၂ စက္ကန့် ငြိမ်နေမယ် */
    0%, 15% { transform: translateX(0); }
    
    /* ဒုတိယစာသားရဲ့ ထိပ်ဆုံးက ပထမစာသားရဲ့ ထိပ်ဆုံးနေရာကို ရောက်တဲ့အထိပဲ ရွေ့မယ် */
    85%, 100% { transform: translateX(calc(-1 * var(--dist))); }
  }
      `}</style>
    </div>
  )
}

const ContentSection: React.FC<ContentSectionProps> = ({ contents, currentSection, onUnsave, searchQuery }) => {
  return (
    <Suspense fallback={<div className="w-full px-2 pb-20"><p className="text-white">Loading content...</p></div>}>
      <ContentSectionInner 
        contents={contents} 
        currentSection={currentSection} 
        onUnsave={onUnsave} 
        searchQuery={searchQuery} // <--- ဒီစာကြောင်း သေချာပေါက် ပါရပါမယ်
      />
    </Suspense>
  )
}

export default ContentSection
