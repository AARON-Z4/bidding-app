import React from 'react'
import { Facebook, Instagram, Twitter } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-white/5 backdrop-blur-md border-t border-white/10 text-white py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Left */}
        <div className="text-center md:text-left">
          <h4 className="text-xl font-bold">Vibe<span className="text-[#24CFA6] font-bold">Bid</span></h4>
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} VibeBid. All rights reserved.</p>
        </div>

        {/* Center - Quick Links */}
        <div className="flex gap-6 text-gray-300 text-sm">
          <a href="/" className="hover:text-white">Home</a>
          <a href="/features" className="hover:text-white">Features</a>
          <a href="/contact" className="hover:text-white">Contact</a>
          <a href="/auctions" className="hover:text-white">Auctions</a>
        </div>

        {/* Right - Socials */}
        <div className="flex gap-4 text-[#24CFA6]">
          <a href="#"><Facebook className="w-5 h-5 hover:scale-110 transition" /></a>
          <a href="#"><Instagram className="w-5 h-5 hover:scale-110 transition" /></a>
          <a href="#"><Twitter className="w-5 h-5 hover:scale-110 transition" /></a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
