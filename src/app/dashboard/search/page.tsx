'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ContentSection from '@/components/ContentSection'

function SearchContent() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  
 const query = searchParams.get('q') || ''
const sectionFromURL = searchParams.get('section') || 'home' // URL က section ကို အရင်ဦးစားပေးဖတ်မယ်

  // မြန်မာစာ စာသားထဲက ရှာတဲ့စာလုံးကို အရောင်ပြောင်းပေးမယ့် function
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? 
          <span key={i} className="text-[#ffd700] font-bold underline">{part}</span> : part
        )}
      </span>
    );
  };

  useEffect(() => {
  if (query) {
    fetchSearchResults()
  }
}, [query, sectionFromURL]) // sectionFromURL ပြောင်းတိုင်း ရှာဖွေမှုအသစ်လုပ်မယ်

const fetchSearchResults = async () => {
  setLoading(true)
  try {
    let supabaseQuery = supabase.from('sidebar_contents').select('*');
    supabaseQuery = supabaseQuery.ilike('title', `%${query}%`);

    // sectionFromURL ကို သုံးပြီး Filter လုပ်ခြင်း
    if (sectionFromURL !== 'home') {
      
      // ၂။ အကယ်၍ Home က မဟုတ်ဘဲ Submenu တစ်ခုခုထဲက ရှာတာဆိုရင် Filter ထပ်လုပ်မယ်
      
        let category = '';
        let subCategory = '';

        // Map section to exact database values
        const categoryMap: { [key: string]: string } = {
          'videos': 'Videos',
          'musics': 'Musics',
          'others': 'Others'
        };

        const subCategoryMap: { [key: string]: string } = {
          'penal': 'Penal Code',
          'criminal': 'Criminal Procedure Code',
          'evidence': 'Evidence Act',
          'police-ethics': 'Police Ethics',
          'police-discipline': 'Police Discipline Act',
          'videos': 'Videos',
          'musics': 'Musics',
          'other-pdf': 'PDFs'
        };

        const parts = sectionFromURL.split('-');
        category = categoryMap[parts[0]] || categoryMap[parts[0].toLowerCase()] || parts[0];
        subCategory = subCategoryMap[parts.slice(1).join('-')] || parts.slice(1).join(' ');

        supabaseQuery = supabaseQuery.eq('category', category).eq('sub_category', subCategory);
      }

      const { data, error } = await supabaseQuery;
      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-24 p-6 min-h-screen bg-[#001f3f]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-4">
          <span className="text-[#ffd700]">"{query}"</span> ရှာဖွေမှုရလဒ် 
          <span className="text-sm font-normal text-gray-400 ml-2">
            ({sectionFromURL === 'home' ? 'အားလုံးတွင် ရှာဖွေထားသည်' : `${sectionFromURL} အတွင်း၌သာ ရှာဖွေထားသည်`})
          </span>
        </h2>

        {loading ? (
          <p className="text-white animate-pulse text-center py-10">ရှာဖွေနေပါသည်...</p>
        ) : results.length > 0 ? (
          <Suspense fallback={<div className="text-white animate-pulse text-center py-10">ရှာဖွေနေပါသည်...</div>}>
           <ContentSection contents={results} currentSection={sectionFromURL} searchQuery={query} />
          </Suspense>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-2xl">
             <p className="text-gray-400">ရှာဖွေမှုရလဒ် မရှိပါ။</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="pt-24 p-6 text-white text-center">Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}