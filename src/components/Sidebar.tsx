'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onSectionChange: (section: string) => void
}

export default function Sidebar({ isOpen, onClose, onSectionChange }: SidebarProps) {
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('user@example.com')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
    }
    getUser()
  }, [])





  const toggleDropdown = (menu: string) => {
    setDropdownOpen(dropdownOpen === menu ? null : menu)
  }

  const handleLogout = async () => {
    try {
      // ၁။ Supabase ကနေ တကယ် Logout ထွက်မယ်
      await supabase.auth.signOut()

      // ၂။ Global Notification Alarm လှမ်းပြမယ်
      window.dispatchEvent(new CustomEvent('notify', { 
        detail: { message: 'အကောင့်ထဲမှ အောင်မြင်စွာ ထွက်ပြီးပါပြီ' } 
      }))

      // ၃။ Sidebar ကို ပိတ်မယ်
      onClose()

      // ၄။ Login page ကို ချက်ချင်း မောင်းထုတ်မယ်
      // router.push ထက် window.location က session တွေကို သန့်စင်ဖို့ ပိုစိတ်ချရပါတယ်
      window.location.href = '/login'
      
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[55]"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 h-full bg-[#001f3f] border-r border-[#ffd700] transition-transform duration-300 w-64 z-[100] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-[#ffd700] text-[#001f3f] rounded hover:bg-[#e6c200] transition-colors"
          >
            ✕
          </button>

          <div className="mb-8 pt-8">
            <p className="text-[#ffd700] font-semibold">{userEmail}</p>
          </div>

          <nav className="space-y-4">
            <Link href="/dashboard">
              <button
                onClick={() => { onSectionChange('home'); onClose(); setDropdownOpen(null); }}
                className="w-full text-left text-[#ffd700] hover:bg-[#ffd700] hover:text-[#001f3f] py-2 px-4 rounded transition-colors"
              >
                Home
              </button>
            </Link>

            {/* Videos Dropdown */}
            <div>
              <button
                onClick={() => toggleDropdown('videos')}
                className="w-full text-left text-[#ffd700] hover:bg-[#ffd700] hover:text-[#001f3f] py-2 px-4 rounded transition-colors flex justify-between items-center"
              >
                Videos
                <span className={`transform transition-transform ${dropdownOpen === 'videos' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {dropdownOpen === 'videos' && (
                <div className="ml-4 mt-2 space-y-2">
                  <Link href={`/dashboard/videos?sub=penal`}>
                    <button
                      onClick={() => { onSectionChange('videos-penal'); onClose(); setDropdownOpen(null); }}
                      className="w-full text-left text-white hover:bg-[#ffd700] hover:text-[#001f3f] py-1 px-3 rounded transition-colors text-sm"
                    >
                      Penal Code
                    </button>
                  </Link>
                  <Link href={`/dashboard/videos?sub=criminal`}>
                    <button
                      onClick={() => { onSectionChange('videos-criminal'); onClose(); setDropdownOpen(null); }}
                      className="w-full text-left text-white hover:bg-[#ffd700] hover:text-[#001f3f] py-1 px-3 rounded transition-colors text-sm"
                    >
                      Criminal Procedure Code
                    </button>
                  </Link>
                  <Link href={`/dashboard/videos?sub=evidence`}>
                    <button
                      onClick={() => { onSectionChange('videos-evidence'); onClose(); setDropdownOpen(null); }}
                      className="w-full text-left text-white hover:bg-[#ffd700] hover:text-[#001f3f] py-1 px-3 rounded transition-colors text-sm"
                    >
                      Evidence Act
                    </button>
                  </Link>
                  <Link href={`/dashboard/videos?sub=police-ethics`}>
                    <button
                      onClick={() => { onSectionChange('videos-police-ethics'); onClose(); setDropdownOpen(null); }}
                      className="w-full text-left text-white hover:bg-[#ffd700] hover:text-[#001f3f] py-1 px-3 rounded transition-colors text-sm"
                    >
                      Police Ethics
                    </button>
                  </Link>
                  <Link href={`/dashboard/videos?sub=police-discipline`}>
                    <button
                      onClick={() => { onSectionChange('videos-police-discipline'); onClose(); setDropdownOpen(null); }}
                      className="w-full text-left text-white hover:bg-[#ffd700] hover:text-[#001f3f] py-1 px-3 rounded transition-colors text-sm"
                    >
                      Police Discipline Act
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Musics Dropdown */}
            <div>
              <button
                onClick={() => toggleDropdown('musics')}
                className="w-full text-left text-[#ffd700] hover:bg-[#ffd700] hover:text-[#001f3f] py-2 px-4 rounded transition-colors flex justify-between items-center"
              >
                Musics
                <span className={`transform transition-transform ${dropdownOpen === 'musics' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {dropdownOpen === 'musics' && (
                <div className="ml-4 mt-2 space-y-2">
                  <Link href={`/dashboard/musics?sub=penal`}>
                    <button
                      onClick={() => { onSectionChange('musics-penal'); onClose(); setDropdownOpen(null); }}
                      className="w-full text-left text-white hover:bg-[#ffd700] hover:text-[#001f3f] py-1 px-3 rounded transition-colors text-sm"
                    >
                      Penal Code
                    </button>
                  </Link>
                  <Link href={`/dashboard/musics?sub=criminal`}>
                    <button
                      onClick={() => { onSectionChange('musics-criminal'); onClose(); setDropdownOpen(null); }}
                      className="w-full text-left text-white hover:bg-[#ffd700] hover:text-[#001f3f] py-1 px-3 rounded transition-colors text-sm"
                    >
                      Criminal Procedure Code
                    </button>
                  </Link>
                  <Link href={`/dashboard/musics?sub=evidence`}>
                    <button
                      onClick={() => { onSectionChange('musics-evidence'); onClose(); setDropdownOpen(null); }}
                      className="w-full text-left text-white hover:bg-[#ffd700] hover:text-[#001f3f] py-1 px-3 rounded transition-colors text-sm"
                    >
                      Evidence Act
                    </button>
                  </Link>
                  <Link href={`/dashboard/musics?sub=police-ethics`}>
                    <button
                      onClick={() => { onSectionChange('musics-police-ethics'); onClose(); setDropdownOpen(null); }}
                      className="w-full text-left text-white hover:bg-[#ffd700] hover:text-[#001f3f] py-1 px-3 rounded transition-colors text-sm"
                    >
                      Police Ethics
                    </button>
                  </Link>
                  <Link href={`/dashboard/musics?sub=police-discipline`}>
                    <button
                      onClick={() => { onSectionChange('musics-police-discipline'); onClose(); setDropdownOpen(null); }}
                      className="w-full text-left text-white hover:bg-[#ffd700] hover:text-[#001f3f] py-1 px-3 rounded transition-colors text-sm"
                    >
                      Police Discipline Act
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Others Dropdown */}
            <div>
              <button
                onClick={() => toggleDropdown('others')}
                className="w-full text-left text-[#ffd700] hover:bg-[#ffd700] hover:text-[#001f3f] py-2 px-4 rounded transition-colors flex justify-between items-center"
              >
                Others
                <span className={`transform transition-transform ${dropdownOpen === 'others' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {dropdownOpen === 'others' && (
                <div className="ml-4 mt-2 space-y-2">
                  <Link href={`/dashboard/others?sub=videos`}>
                    <button
                      onClick={() => { onSectionChange('others-videos'); onClose(); setDropdownOpen(null); }}
                      className="w-full text-left text-white hover:bg-[#ffd700] hover:text-[#001f3f] py-1 px-3 rounded transition-colors text-sm"
                    >
                      Videos
                    </button>
                  </Link>
                  <Link href={`/dashboard/others?sub=musics`}>
                    <button
                      onClick={() => { onSectionChange('others-musics'); onClose(); setDropdownOpen(null); }}
                      className="w-full text-left text-white hover:bg-[#ffd700] hover:text-[#001f3f] py-1 px-3 rounded transition-colors text-sm"
                    >
                      Musics
                    </button>
                  </Link>
                  <Link href={`/dashboard/others?sub=pdf`}>
                    <button
                      onClick={() => { onSectionChange('others-other-pdf'); onClose(); setDropdownOpen(null); }}
                      className="w-full text-left text-white hover:bg-[#ffd700] hover:text-[#001f3f] py-1 px-3 rounded transition-colors text-sm"
                    >
                      PDFs
                    </button>
                  </Link>
                </div>
              )}
            </div>

            <Link href="/dashboard/saved">
              <button
                onClick={() => { onSectionChange('saved'); onClose(); setDropdownOpen(null); }}
                className="w-full text-left text-[#ffd700] hover:bg-[#ffd700] hover:text-[#001f3f] py-2 px-4 rounded transition-colors"
              >
                Saved
              </button>
            </Link>
          </nav>

          <div className="mt-8 pt-8 border-t border-[#ffd700]">
            <button onClick={handleLogout} className="w-full text-left text-[#ffd700] hover:bg-[#ffd700] hover:text-[#001f3f] py-2 px-4 rounded transition-colors">
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
