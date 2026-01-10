'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import SavedButton from '@/components/SavedButton'
import { usePWA } from '@/lib/usePWA'
import ContentSection from '@/components/ContentSection'

interface SubmenuDashboardProps {
  currentSection: string
}

export default function SubmenuDashboard({ currentSection }: SubmenuDashboardProps) {
  const [ads, setAds] = useState<any[]>([])
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [content, setContent] = useState<any[]>([])
  const [sidebarContents, setSidebarContents] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)
  const [hideInstallBar, setHideInstallBar] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set())
  const {installApp,isInstalling } = usePWA()
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)

    // Check if app is in standalone mode and localStorage for banner
    if (typeof window !== 'undefined') {
      setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
      const hideForever = localStorage.getItem('hideBannerForever')
      if (hideForever === 'true') {
        setHideInstallBar(true)
      }
    }

    // Fetch ads from home_ads table
    const fetchAds = async () => {
      const { data, error } = await supabase
        .from('home_ads')
        .select('*')
        .order('created_at')

      if (error) {
        console.error('Error fetching ads:', error)
      } else {
        setAds(data || [])
      }
    }

    // Fetch content from home_card table
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from('home_card')
        .select('title, description, pdf_url')
        .order('created_at')

      if (error) {
        console.error('Error fetching content:', error)
        setContent([])
      } else {
        setContent(data || [])
      }
    }

    fetchAds()
    fetchContent()

    // Fetch sidebar contents from sidebar_contents table
    const fetchSidebarContents = async () => {
      const { data, error } = await supabase
        .from('sidebar_contents')
        .select('*')
        .order('created_at')

      if (error) {
        console.error('Error fetching sidebar contents:', error)
        setSidebarContents([])
      } else {
        setSidebarContents(data || [])
      }
    }

    fetchSidebarContents()
  }, [])

  useEffect(() => {
    if (ads.length > 0) {
      const adInterval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length)
      }, 3000)

      return () => clearInterval(adInterval)
    }
  }, [ads.length])



  // Function to render sidebar content based on category and sub_category
  const renderSidebarContent = (category: string, subCategory: string) => {
    // Map category names to proper format
    const categoryMap: { [key: string]: string } = {
      'videos': 'Videos',
      'musics': 'Musics',
      'others': 'Others'
    }

    // Map subCategory to full names
    const subCategoryMap: { [key: string]: string } = {
      'penal': 'Penal Code',
      'criminal': 'Criminal Procedure Code',
      'evidence': 'Evidence Act',
      'police-ethics': 'Police Ethics',
      'police-discipline': 'Police Discipline Act',
      'videos': 'Videos',
      'musics': 'Musics',
      'pdf': 'PDFs'
    }

    const mappedCategory = categoryMap[category] || category
    const mappedSubCategory = subCategoryMap[subCategory] || subCategory

    const filteredContents = sidebarContents.filter(
      item => item.category === mappedCategory && item.sub_category === mappedSubCategory
    )

    return (
      <div className="flex flex-col min-h-screen">
        <h1 className="text-lg md:text-2xl font-bold mb-4 text-[#ffd700] leading-snug">{mappedCategory} - {mappedSubCategory} Content</h1>
        {filteredContents.length === 0 ? (
          <p>No content available for this section yet.</p>
        ) : (
          <Suspense fallback={<div className="text-white">Loading content...</div>}>
            <ContentSection contents={filteredContents} currentSection={currentSection} />
          </Suspense>
        )}
      </div>
    )
  }

  const renderContent = () => {
    switch (currentSection) {
      // Videos submenus
      case 'videos-penal':
        return renderSidebarContent('videos', 'penal')
      case 'videos-criminal':
        return renderSidebarContent('videos', 'criminal')
      case 'videos-evidence':
        return renderSidebarContent('videos', 'evidence')
      case 'videos-police-ethics':
        return renderSidebarContent('videos', 'police-ethics')
      case 'videos-police-discipline':
        return renderSidebarContent('videos', 'police-discipline')

      // Musics submenus
      case 'musics-penal':
        return renderSidebarContent('musics', 'penal')
      case 'musics-criminal':
        return renderSidebarContent('musics', 'criminal')
      case 'musics-evidence':
        return renderSidebarContent('musics', 'evidence')
      case 'musics-police-ethics':
        return renderSidebarContent('musics', 'police-ethics')
      case 'musics-police-discipline':
        return renderSidebarContent('musics', 'police-discipline')
      case 'musics-civil':
        return renderSidebarContent('musics', 'civil')
      case 'musics-constitutional':
        return renderSidebarContent('musics', 'constitutional')

      // Others submenus
      case 'others-videos':
        return renderSidebarContent('Others', 'Videos')
      case 'others-musics':
        return renderSidebarContent('Others', 'Musics')
      case 'others-other-pdf':
        return renderSidebarContent('Others', 'PDFs')

      // Main sections (fallback)
      case 'videos':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Videos</h2><p>Select a category from the sidebar.</p></div>
      case 'musics':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Musics</h2><p>Select a category from the sidebar.</p></div>
      case 'others':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Others</h2><p>Select a category from the sidebar.</p></div>
      case 'saved':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Saved</h2><p>Your saved content will be displayed here.</p></div>
      default:
        // Handle unknown sections by parsing currentSection
        const parts = currentSection.split('-')
        if (parts.length >= 2) {
          const category = parts[0]
          const subCategory = parts.slice(1).join('-')
          return renderSidebarContent(category, subCategory)
        }
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Unknown Section</h2><p>This section is not recognized.</p></div>
    }
  }

  return renderContent()
}
