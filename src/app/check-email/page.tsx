'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'


export default function CheckEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const password = searchParams.get('password') || ''
  const loginUrl = `/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
  return (
    <div className="min-h-screen bg-[#001f3f] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-blue-400/20 backdrop-blur-xl border border-blue-200/30 rounded-2xl p-8 text-center shadow-2xl">
        
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        {/* Email Icon */}
        <div className="mb-6 flex justify-center text-[#D4AF37]">
          <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Check Your Email
        </h1>

        <p className="text-blue-100 mb-8 leading-relaxed">
          အကောင့်ကို အတည်ပြုရန်အတွက် သင်၏ Email ထံသို့ Link တစ်ခု ပို့ပေးလိုက်ပါပြီ။ 
          Email ထဲရှိ Link ကို နှိပ်ပြီးမှသာ အကောင့်ဝင်၍ ရပါမည်။
        </p>

        <Link 
          href={loginUrl}
          className="inline-block w-full bg-[#D4AF37] text-[#001f3f] py-3 px-6 rounded-lg font-bold hover:bg-[#B8962E] transition-all duration-300"
        >
          Go to Login (အကောင့်ဝင်ရန်)
        </Link>

        <p className="mt-6 text-xs text-white/50">
          Email မတွေ့ပါက Spam/Junk folder ကို စစ်ဆေးပေးပါ။
        </p>
      </div>
    </div>
  )
}