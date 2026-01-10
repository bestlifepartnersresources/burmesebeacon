'use client'

import { useEffect, useState } from 'react'

interface NotificationProps {
  message: string
  type?: 'loading' | 'success' | 'error' | 'default' // type ထည့်လိုက်ပါတယ်
  onClose: () => void
}

export default function Notification({ message, type, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)

    // အကယ်၍ loading ဖြစ်နေရင် အလိုအလျောက် မပိတ်သေးပါဘူး
    // success ဒါမှမဟုတ် error ပြမှသာ ၃ စက္ကန့်နေရင် ပိတ်ပါမယ်
    if (type !== 'loading') {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300)
      }, 3000); // ၃ စက္ကန့်အကြာမှာ ပျောက်သွားမယ်
      return () => clearTimeout(timer)
    }
  }, [onClose, type])

  return (
    <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 z-[9999] transition-all duration-300 ${
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <div className="bg-[#001f3f] border-4 border-[#ffd700] rounded-lg p-4 shadow-lg flex items-center gap-3">
       
        {/* Loading Spinner - type က loading ဖြစ်နေရင် ပတ်ချာလည် icon လေး ပေါ်မယ် */}
        {type === 'loading' && (
          <div className="w-5 h-5 border-2 border-[#ffd700] border-t-transparent rounded-full animate-spin"></div>
        )}

        <p className="text-center text-white font-bold">{message}</p>
      </div>
    </div>
  )
}