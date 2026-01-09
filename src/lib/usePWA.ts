import { useState, useEffect } from 'react'

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if app is already running as PWA
    const checkStandalone = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true ||
                          document.referrer.includes('android-app://')
      setIsStandalone(isStandalone)
    }

    checkStandalone()

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstallable(false)
      setDeferredPrompt(null)
      setIsStandalone(true)
    }

    // Listen for display mode changes
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches)
    }

    if ('serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.addEventListener('appinstalled', handleAppInstalled)

      const mediaQuery = window.matchMedia('(display-mode: standalone)')
      mediaQuery.addEventListener('change', handleDisplayModeChange)
    }

    return () => {
      if ('serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.removeEventListener('appinstalled', handleAppInstalled)

        const mediaQuery = window.matchMedia('(display-mode: standalone)')
        mediaQuery.removeEventListener('change', handleDisplayModeChange)
      }
    }
  }, [])

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstallable(false)
        setIsStandalone(true)
      }
      setDeferredPrompt(null)
    }
  }

  return {
    isInstallable,
    isStandalone,
    installApp
  }
}
