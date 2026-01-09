'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugPage() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const testQueries = async () => {
      try {
        console.log('Testing Supabase connection...')

        // Test 1: Get all sidebar_contents
        const { data: allData, error: allError } = await supabase
          .from('sidebar_contents')
          .select('*')

        console.log('All sidebar_contents:', allData)
        console.log('All error:', allError)

        // Test 2: Get categories
        const { data: categories, error: catError } = await supabase
          .from('sidebar_contents')
          .select('category')

        console.log('Categories:', categories)
        console.log('Categories error:', catError)

        // Test 3: Get sub_categories
        const { data: subCats, error: subError } = await supabase
          .from('sidebar_contents')
          .select('sub_category')

        console.log('Sub-categories:', subCats)
        console.log('Sub-categories error:', subError)

        // Test 4: Filter by category = 'Videos'
        const { data: videosData, error: videosError } = await supabase
          .from('sidebar_contents')
          .select('*')
          .eq('category', 'Videos')

        console.log('Videos data:', videosData)
        console.log('Videos error:', videosError)

        // Test 5: Filter by sub_category = 'Penal Code'
        const { data: penalData, error: penalError } = await supabase
          .from('sidebar_contents')
          .select('*')
          .eq('sub_category', 'Penal Code')

        console.log('Penal Code data:', penalData)
        console.log('Penal Code error:', penalError)

        // Test 6: Combined filter
        const { data: combinedData, error: combinedError } = await supabase
          .from('sidebar_contents')
          .select('*')
          .eq('category', 'Videos')
          .eq('sub_category', 'Penal Code')

        console.log('Combined filter data:', combinedData)
        console.log('Combined filter error:', combinedError)

        setData({
          all: allData,
          categories,
          subCats,
          videos: videosData,
          penal: penalData,
          combined: combinedData
        })

        if (allError || catError || subError || videosError || penalError || combinedError) {
          setError('Some queries failed - check console')
        }

      } catch (err) {
        console.error('Unexpected error:', err)
        setError('Unexpected error occurred')
      }
      setLoading(false)
    }

    testQueries()
  }, [])

  if (loading) {
    return <div className="p-8">Loading debug data...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Debug Page</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">All sidebar_contents:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
            {JSON.stringify(data?.all, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Categories:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
            {JSON.stringify(data?.categories, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Sub-categories:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
            {JSON.stringify(data?.subCats, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Videos (category = 'Videos'):</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
            {JSON.stringify(data?.videos, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Penal Code (sub_category = 'Penal Code'):</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
            {JSON.stringify(data?.penal, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Combined Filter (Videos + Penal Code):</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
            {JSON.stringify(data?.combined, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
