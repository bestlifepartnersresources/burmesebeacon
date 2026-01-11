import { useState, useEffect } from 'react'

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
  const checkStandalone = () => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true;
    setIsStandalone(isStandalone);
  };

  checkStandalone();

  const handleBeforeInstallPrompt = (e: any) => {
    e.preventDefault();
    setDeferredPrompt(e);
    setIsInstallable(true);
    console.log("Install prompt is ready"); // စစ်ဆေးရန်
  };

  const handleAppInstalled = () => {
    setIsInstallable(false);
    setDeferredPrompt(null);
    setIsStandalone(true);
    setIsInstalling(false);
  };

  // 'BeforeInstallPromptEvent' in window ဆိုတဲ့ check ကို ဖြုတ်လိုက်ပါ
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);

  return () => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.removeEventListener('appinstalled', handleAppInstalled);
  };
}, []);
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
