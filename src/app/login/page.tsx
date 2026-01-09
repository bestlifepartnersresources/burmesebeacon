'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Logo from '@/components/Logo'

// ၁။ LoginForm Component: URL က data ဖတ်တာနဲ့ Form Logic တွေ ဒီထဲမှာ ထားတယ်
function LoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // URL ကနေ email နဲ့ password ပါလာရင် အလိုအလျောက် ဖြည့်ပေးမယ်
  useEffect(() => {
    const emailParam = searchParams.get('email')
    const passwordParam = searchParams.get('password')

    if (emailParam) setEmail(emailParam)
    if (passwordParam) setPassword(passwordParam)
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single()

          if (!profile) {
            window.dispatchEvent(new CustomEvent('notify', { 
              detail: { message: 'အကောင့်မရှိသေးပါ၊ ကျေးဇူးပြု၍ အရင်စာရင်းသွင်းပါ။' } 
            }))
          } else {
            window.dispatchEvent(new CustomEvent('notify', { 
              detail: { message: 'Password မှားယွင်းနေပါသည်။' } 
            }))
          }
        } else {
          window.dispatchEvent(new CustomEvent('notify', { 
            detail: { message: 'အမှားအယွင်းတစ်ခု ရှိနေပါသည်။ နောက်မှ ပြန်ကြိုးစားပါ။' } 
          }))
        }
      } else {
        window.location.href = '/dashboard'
      }
    } catch (error) {
      window.dispatchEvent(new CustomEvent('notify', { 
        detail: { message: 'စနစ်အတွင်း အမှားအယွင်း ဖြစ်ပေါ်ခဲ့ပါသည်။' } 
      }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-white font-bold text-sm mb-2">
          Email လိပ်စာ
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-blue-200/20 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:border-[#D4AF37] text-base"
          required
          readOnly={isLoading}
          placeholder="example@gmail.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-white font-bold text-sm mb-2">
          Password (လျှို့ဝှက်နံပါတ်)
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 pr-12 border border-blue-200/20 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:border-[#D4AF37] text-base"
            required
            readOnly={isLoading}
            placeholder="********"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#D4AF37] text-[#001f3f] py-3 px-4 rounded-lg font-bold hover:bg-[#B8962E] transition-all duration-300 active:scale-95 hover:shadow-lg disabled:opacity-50"
      >
        {isLoading ? (
           <div className="flex items-center justify-center gap-2">
             <span className="animate-spin h-5 w-5 border-2 border-[#001f3f] border-t-transparent rounded-full"></span>
             ခေတ္တစောင့်ပါ...
           </div>
        ) : 'အကောင့်ဝင်ရန်'}
      </button>
    </form>
  )
}

// ၂။ Main Export: LoginForm ကို Suspense နဲ့ ပတ်ပေးထားတယ် (Build error မတက်အောင်)
export default function Login() {
  return (
    <div className="min-h-screen bg-[#001f3f] flex items-center justify-center p-4">
      <div className="w-full max-w-[90%] sm:max-w-md bg-blue-400/20 backdrop-blur-xl border border-blue-200/30 rounded-2xl overflow-hidden p-6 sm:p-10">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <Suspense fallback={<div className="text-white text-center">ခေတ္တစောင့်ပါ...</div>}>
          <LoginForm />
        </Suspense>

        <div className="mt-6 text-center">
          <p className="text-white text-sm">
            အကောင့်မရှိသေးဘူးလား?{' '}
            <a
              href="/signup"
              className="text-[#D4AF37] hover:text-[#D4AF37]/80 font-medium transition-colors"
            >
              အကောင့်သစ်ဖွင့်ရန်
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}