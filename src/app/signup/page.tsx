'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Logo from '@/components/Logo'
import { useRouter } from 'next/navigation' // ၁။ Router ကို import လုပ်ပါ

export default function SignUp() {
  const router = useRouter() // ၂။ Router ကို အသုံးချဖို့ ကြေညာပါ
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      window.dispatchEvent(new CustomEvent('notify', { 
        detail: { message: 'Password များ တူညီမှု မရှိပါ။' } 
      }))
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        window.dispatchEvent(new CustomEvent('notify', { 
          detail: { message: 'အကောင့်ဖွင့်ရာတွင် အမှားအယွင်းရှိပါသည်။ ပြန်လည်ကြိုးစားကြည့်ပါ။' } 
        }))
      } else {
  window.dispatchEvent(new CustomEvent('notify', { 
    detail: { message: 'အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။ Email ကို စစ်ဆေးပေးပါ။' } 
  }))

  setTimeout(() => {
    // email နဲ့ password ကို check-email ဆီ ပို့လိုက်မယ်
    router.push(`/check-email?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`)
  }, 1500)
}
    } catch (error) {
      window.dispatchEvent(new CustomEvent('notify', { 
        detail: { message: 'တစ်ခုခု မှားယွင်းနေပါသည်။ ပြန်လည်ကြိုးစားပါ။' } 
      }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#001f3f] flex items-center justify-center p-4">
      <div className="w-full max-w-[90%] sm:max-w-md bg-blue-400/20 backdrop-blur-xl border border-blue-200/30 rounded-2xl overflow-hidden p-6 sm:p-10">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-white font-bold text-sm mb-2">
              Email
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
              Password
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

          <div>
            <label htmlFor="confirmPassword" className="block text-white font-bold text-sm mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-blue-200/20 rounded-lg bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:border-[#D4AF37] text-base"
                required
                readOnly={isLoading}
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#D4AF37] text-[#001f3f] py-3 px-4 rounded-lg font-bold hover:bg-[#B8962E] transition-all duration-300 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
               <div className="flex items-center justify-center gap-2">
                 <span className="animate-spin h-5 w-5 border-2 border-[#001f3f] border-t-transparent rounded-full"></span>
                 ခေတ္တစောင့်ပါ...
               </div>
            ) : 'အကောင့်သစ်ဖွင့်ရန်'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white text-sm">
            အကောင့်ရှိပြီးသားလား?{' '}
            <a
              href="/login"
              className="text-[#D4AF37] hover:text-[#D4AF37]/80 font-medium transition-colors"
            >
              ပြန်ဝင်ရန် (Login)
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}