'use client'

import { useState, useEffect } from 'react'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    }

    const handleAppInstalled = () => {
      setShowInstallButton(false)
      setDeferredPrompt(null)
    }

    const handleTriggerInstall = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt()
        deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt')
          } else {
            console.log('User dismissed the install prompt')
          }
          setDeferredPrompt(null)
          setShowInstallButton(false)
        })
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('triggerPWAInstall', handleTriggerInstall)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('triggerPWAInstall', handleTriggerInstall)
    }
  }, [deferredPrompt])

  if (!showInstallButton) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-[#001f3f] border border-[#ffd700] rounded-lg p-4 shadow-lg z-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-[#ffd700] font-bold text-lg mb-2">Install Burmese Beacon</h3>
          <p className="text-white text-sm">Install our app for a better experience with offline access and more features.</p>
        </div>
        <button
          onClick={() => {
            if (deferredPrompt) {
              deferredPrompt.prompt()
              deferredPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                  console.log('User accepted the install prompt')
                } else {
                  console.log('User dismissed the install prompt')
                }
                setDeferredPrompt(null)
                setShowInstallButton(false)
              })
            }
          }}
          className="ml-4 bg-[#ffd700] text-[#001f3f] px-4 py-2 rounded hover:bg-[#e6c200] transition-colors font-semibold"
        >
          Install
        </button>
      </div>
      <button
        onClick={() => setShowInstallButton(false)}
        className="absolute top-2 right-2 text-white hover:text-[#ffd700] text-xl"
      >
        ×
      </button>
    </div>
  )
}
