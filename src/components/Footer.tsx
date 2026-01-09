'use client'

import { HiBookOpen, HiSparkles } from 'react-icons/hi'
import { 
  SiYoutube, 
  SiArchiveofourown, 
  SiGithub, 
  SiVercel, 
  SiNetlify, 
  SiSupabase 
} from 'react-icons/si'

export default function Footer() {
  return (
    <footer className="bg-[#00152b] border-t border-[#D4AF37]/30 py-10">
      <div className="container mx-auto px-4">
        
        {/* Main Tech Stack - NotebookLM & Gemini */}
        <div className="flex flex-wrap justify-center items-center gap-12 mb-10">
          <a 
            href="https://notebooklm.google.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group flex flex-col items-center gap-3 transition-all"
          >
            <div className="p-3 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/20 group-hover:border-[#D4AF37]/50 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all">
              <HiBookOpen size={35} className="text-[#D4AF37]" />
            </div>
            <span className="text-[#D4AF37] text-xs font-medium tracking-[0.2em] uppercase">NotebookLM</span>
          </a>

          <a 
            href="https://gemini.google.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group flex flex-col items-center gap-3 transition-all"
          >
            <div className="p-3 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/20 group-hover:border-[#D4AF37]/50 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all">
              <HiSparkles size={35} className="text-[#D4AF37]" />
            </div>
            <span className="text-[#D4AF37] text-xs font-medium tracking-[0.2em] uppercase">Gemini</span>
          </a>
        </div>

        {/* Other Platform Icons */}
        <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 hover:scale-110 transition-all">
            <SiYoutube size={24} color="#D4AF37" />
          </a>
          <a href="https://archive.org" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 hover:scale-110 transition-all">
            <SiArchiveofourown size={24} color="#D4AF37" />
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 hover:scale-110 transition-all">
            <SiGithub size={24} color="#D4AF37" />
          </a>
          <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 hover:scale-110 transition-all">
            <SiVercel size={24} color="#D4AF37" />
          </a>
          <a href="https://netlify.com" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 hover:scale-110 transition-all">
            <SiNetlify size={24} color="#D4AF37" />
          </a>
          <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 hover:scale-110 transition-all">
            <SiSupabase size={24} color="#D4AF37" />
          </a>
        </div>

        {/* Decorative Gold Divider with Glow */}
        <div className="relative w-full max-w-2xl mx-auto h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent mb-8">
          <div className="absolute inset-0 blur-sm bg-[#D4AF37]/20"></div>
        </div>

        {/* Copyright and Credits */}
        <div className="text-center space-y-3">
          <p className="text-[#D4AF37]/80 text-sm font-semibold tracking-wider">
            © 2025 BURMESE BEACON. ALL RIGHTS RESERVED.
          </p>
          <div className="flex flex-col gap-1">
            <p className="text-white/80 text-[10px] uppercase tracking-[0.15em]">
              Since December 1, 2025
            </p>
            <p className="text-white/60 text-[11px] font-medium italic">
              Created by Naing Moe Win
            </p>
          </div>
        </div>

      </div>
    </footer>
  )
}