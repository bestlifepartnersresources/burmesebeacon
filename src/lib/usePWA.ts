import { useState, useEffect } from 'react'

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

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
      setIsInstalling(false) // သွင်းပြီးရင် Loading ပိတ်မယ်
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
     if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)

  const mediaQuery = window.matchMedia('(display-mode: standalone)')
  mediaQuery.addEventListener('change', handleDisplayModeChange)
}
        
   }
  }, [])
const installApp = async () => {
    // ၁။ Install လုပ်လို့ရမရ အရင်စစ်မယ်
    if (!deferredPrompt) {
        window.dispatchEvent(new CustomEvent('notify', { 
            detail: { message: 'Install လုပ်ရန် အဆင်သင့်မဖြစ်သေးပါ။ Browser ကို စစ်ဆေးပေးပါ။', type: 'error' } 
        }));
        return;
    }
    setIsInstalling(true); // Installing... စာသားပြဖို့ true ပေးမယ်

    // ၂။ Loading Notification လွှတ်မယ်
    window.dispatchEvent(new CustomEvent('notify', { 
      detail: { message: 'App ထည့်သွင်းရန် လုပ်ဆောင်နေပါသည်...', type: 'loading' } 
    }));

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      window.dispatchEvent(new CustomEvent('notify', { 
        detail: { message: 'App ကို အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ။ ✅', type: 'success' } 
      }));
    } else {
      window.dispatchEvent(new CustomEvent('notify', { 
        detail: { message: 'App ထည့်သွင်းမှုကို ပယ်ဖျက်လိုက်ပါသည်။', type: 'info' } 
      }));
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  }
  
        
  return {
    isInstallable,
    isStandalone,
    installApp,
    isInstalling // ၎င်းကိုပါ export ထုတ်ပေးရပါမယ်
  }
}
