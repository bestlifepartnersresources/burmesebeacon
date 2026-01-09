'use client'

import { Suspense, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SidebarContent } from '@/lib/types'
import ContentSection from '@/components/ContentSection'

function SavedPageContent() {
  const [savedContents, setSavedContents] = useState<SidebarContent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSavedContents()
  }, [])

  const fetchSavedContents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Inside fetchSavedContents function
      const { data: savedData } = await supabase
        .from('saved_content')
        .select('content_id')
        .eq('user_id', user.id);
      if (savedData && savedData.length > 0) { const contentIds = savedData.map(item => item.content_id); const { data: finalData, error } = await supabase .from('sidebar_contents') .select('*') .in('id', contentIds);

      if (!error) setSavedContents(finalData); } else { setSavedContents([]); }
    } catch (error) {
      console.error('Error fetching saved contents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnsave = async (contentId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Remove from database
      await supabase
        .from('saved_content')
        .delete()
        .eq('user_id', user.id)
        .eq('content_id', contentId)

      // Immediately update UI by removing from state
      setSavedContents(prev => prev.filter(item => item.id !== contentId))
    } catch (error) {
      console.error('Error unsaving content:', error)
    }
  }

  return (
    <div className="pt-24 p-6">
      <h2 className="text-2xl font-bold mb-4 text-white">Saved</h2>
      {loading ? (
        <p className="text-white">Loading your saved content...</p>
      ) : savedContents.length > 0 ? (
        <ContentSection 
  contents={savedContents} 
  currentSection="Saved" 
  onUnsave={handleUnsave} // <--- ဒါလေး ထည့်လိုက်တာနဲ့ ချက်ချင်းပျောက်မှာပါ
/>
      ) : (
        <p className="text-white">No saved content yet. Start saving your favorite videos and music!</p>
      )}
    </div>
  )
}

export default function SavedPage() {
  return (
    <Suspense fallback={<div className="pt-24 p-6"><p className="text-white">ခေတ္တစောင့်ဆိုင်းပေးပါ...</p></div>}>
      <SavedPageContent />
    </Suspense>
  )
}
