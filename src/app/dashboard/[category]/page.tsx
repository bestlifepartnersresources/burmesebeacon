'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ContentSection from '@/components/ContentSection'
import { SidebarContent } from '@/lib/types'

export default function CategoryPage() {
  const params = useParams()
  const category = params.category as string
  const searchParams = useSearchParams()
  const subCategory = searchParams.get('sub')
  const [content, setContent] = useState<SidebarContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContent = async () => {
      if (!category) return

      try {
        let query = supabase
          .from('sidebar_contents')
          .select('*')
          .ilike('category', category)

        if (subCategory) {
          query = query.eq('sub_category', subCategory)
        }

        const { data, error } = await query.order('created_at')

        if (error) {
          setError(error.message)
          setContent([])
        } else {
          setContent(data || [])
          setError(null)
        }
      } catch (err) {
        setError('Unexpected error occurred')
        setContent([])
      }
      setLoading(false)
    }

    fetchContent()
  }, [category, searchParams])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffd700]"></div>
          <div className="text-white text-lg">Loading content...</div>
        </div>
      </div>
    )
  }

  const title = subCategory
    ? decodeURIComponent(subCategory)
    : category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[#ffd700] mb-8">{title}</h1>

      {error && (
        <div className="text-red-500 mb-4 p-4 bg-red-100 rounded">
          Error fetching data: {error}
        </div>
      )}

      {content.length === 0 ? (
        <div className="text-white text-lg">No content available for this section yet.</div>
      ) : (
        <ContentSection contents={content} currentSection={subCategory ? `${category}-${subCategory}` : category} />
      )}
    </div>
  )
}
