'use client'

import { useEffect, useState } from 'react'
import Logo from './Logo'

interface SplashScreenProps {
  onComplete?: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete?.()
    }, 2000)
    return () => clearTimeout(timer)
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-[#00008B] flex items-center justify-center z-50">
      <div className="text-center scale-150">
        <Logo />
      </div>
    </div>
  )
}
