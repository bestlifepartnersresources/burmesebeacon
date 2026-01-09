'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Music } from 'lucide-react'
import { SidebarContent } from '@/lib/types'

interface ContentPlayerProps {
  initialContent: SidebarContent
  category: string
  onClose?: () => void
}

  const ContentPlayer: React.FC<ContentPlayerProps> = ({ initialContent, category, onClose }) => {
  const [currentContent, setCurrentContent] = useState<SidebarContent>(initialContent)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    setCurrentContent(initialContent)
  }, [initialContent])

  useEffect(() => {
    // Auto-play when content changes
    if (currentContent) {
      const subCategory = currentContent.sub_category?.toLowerCase() || ''
      const isVideo = category === 'Videos' || subCategory === 'videos'
      const isMusic = category === 'Musics' || subCategory === 'musics'

      if (isVideo && videoRef.current) {
        videoRef.current.play().catch(() => {
          // If auto-play fails, try with muted
          if (videoRef.current) {
            videoRef.current.muted = true
            videoRef.current.play()
          }
        })
      } else if (isMusic && audioRef.current) {
        audioRef.current.play().catch(() => {
          // If auto-play fails, try with muted
          if (audioRef.current) {
            audioRef.current.muted = true
            audioRef.current.play()
          }
        })
      }
    }
  }, [currentContent, category])

  const renderMediaPlayer = () => {
    const url = currentContent.content_url
    const subCategory = currentContent.sub_category?.toLowerCase() || ''

    if (!url) {
      return <p className="text-center text-gray-400">Content not available</p>
    }

    const isVideo = category === 'Videos' || subCategory === 'videos'
    const isMusic = category === 'Musics' || subCategory === 'musics'

    if (isVideo) {
      return (
        <video
          ref={videoRef}
          controls
          autoPlay
          className="w-full h-full"
          preload="metadata"
        >
          <source src={url} />
          Your browser does not support the video tag.
        </video>
      )
    } else if (isMusic) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#001f3f] p-4">
          <Music className="w-16 h-16 text-green-400 mb-4" />
          <audio ref={audioRef} controls autoPlay className="w-full max-w-md">
            <source src={url} />
            Your browser does not support the audio element.
          </audio>
        </div>
      )
    } else {
      // Others (PDFs, documents)
      return (
        <iframe
          src={url}
          className="w-full h-full border-0 rounded"
          title={currentContent.title}
          allowFullScreen
        />
      )
    }
  }

  const subCategory = currentContent.sub_category?.toLowerCase() || ''
  const isVideo = category === 'Videos' || subCategory === 'videos'
  const isMusic = category === 'Musics' || subCategory === 'musics'

  return (
    <div className="w-full p-4 pt-0 relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm"
        >
          Close Player
        </button>
      )}
      <h2 className="text-2xl font-bold mb-2 text-[#ffd700] whitespace-nowrap overflow-hidden text-ellipsis text-left pr-24">{currentContent.title}</h2>
      <div className={`w-full ${isVideo ? 'max-h-[250px] md:max-h-[450px] aspect-video' : isMusic ? 'h-[120px]' : 'max-h-[250px] md:max-h-[450px] aspect-video'} bg-gray-800 rounded-lg`}>
        {renderMediaPlayer()}
      </div>
    </div>
  )
}

export default ContentPlayer
