'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface SavedButtonProps {
  contentId: string
  mediaType: 'video' | 'music' | 'pdf'
  className?: string
  onStatusChange?: (isSaved: boolean) => void
}

export default function SavedButton({ 
  contentId, 
  mediaType, 
  className = '',
  onStatusChange
}: SavedButtonProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkIfSaved()
  }, [contentId])

  const checkIfSaved = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('saved_content')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_id', contentId)
        .single()

      if (data && !error) {
        setIsSaved(true)
      }
    } catch (error) {
      console.error('Error checking saved status:', error)
    }
  }

  const toggleSaved = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.dispatchEvent(new CustomEvent('notify', { 
          detail: { message: 'ကျေးဇူးပြု၍ အရင် Login ဝင်ပေးပါ' } 
        }));
        return;
      }

      if (isSaved) {
        const { error } = await supabase
          .from('saved_content')
          .delete()
          .match({ user_id: user.id, content_id: contentId });

        if (!error) {
          setIsSaved(false);
          // --- Global Notification စနစ်သို့ ပြောင်းလဲခြင်း ---
          window.dispatchEvent(new CustomEvent('notify', { 
            detail: { message: 'သိမ်းဆည်းထားသည်မှ ဖယ်ရှားလိုက်ပါပြီ' } 
          }));
          onStatusChange?.(false);
        }
      } else {
        const { error } = await supabase
          .from('saved_content')
          .upsert({ user_id: user.id, content_id: contentId }, { onConflict: 'user_id,content_id' });

        if (!error) {
           setIsSaved(true);
           // --- Global Notification စနစ်သို့ ပြောင်းလဲခြင်း ---
           window.dispatchEvent(new CustomEvent('notify', { 
             detail: { message: 'သိမ်းဆည်းပြီးပါပြီ' } 
           }));
           onStatusChange?.(true);
        } 
        else {
          window.dispatchEvent(new CustomEvent('notify', { 
            detail: { message: 'သိမ်းဆည်း၍မရပါ၊ တစ်ခုခုမှားယွင်းနေသည်' } 
          }));
        }
      }
    } catch (err) { 
      console.error('System Error:', err); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <button
      onClick={toggleSaved}
      disabled={loading}
      className={`p-2 rounded-full transition-colors ${className} ${
        isSaved
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-400 hover:text-red-500'
      }`}
      title={isSaved ? 'Remove from saved' : 'Add to saved'}
    >
      {loading ? (
        <span className="animate-spin inline-block w-5 h-5 border-2 border-t-transparent border-red-500 rounded-full"></span>
      ) : (
        <span className="text-xl">{isSaved ? '❤️' : '🤍'}</span>
      )}
    </button>
  )
}