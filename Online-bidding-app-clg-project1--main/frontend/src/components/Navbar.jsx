import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { USER_ROLES } from '../config/constants'
import 'remixicon/fonts/remixicon.css'

const Navbar = ({ onLoginClick }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
    navigate('/')
  }

  const getDashboardRoute = () => {
    if (!user) return '/'
    switch (user.role) {
      case USER_ROLES.BUYER:
        return '/buyer/dashboard'
      case USER_ROLES.SELLER:
        return '/seller/dashboard'
      case USER_ROLES.ADMIN:
        return '/admin/dashboard'
      default:
        return '/'
    }
  }

  return (
    <div
      className={`h-20 flex items-center justify-between px-10 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-sm border-b-2 border-white/30' : 'backdrop-blur-sm'
      }`}
    >
      {/* Logo */}
      <h1
        onClick={() => navigate('/')}
        className="text-white font-semibold text-2xl cursor-pointer"
      >
        NextGen<span className="text-[#24CFA6] font-bold">Marketplace</span>
      </h1>

      {/* Navigation Links */}
      <div className="flex gap-6 text-gray-300 text-sm font-medium">
        <a href="/#home" className="hover:text-white hover:underline decoration-[#24CFA6] underline-offset-4 transition">Home</a>
        <a href="/#about" className="hover:text-white hover:underline decoration-[#24CFA6] underline-offset-4 transition">About</a>
        <a href="/#features" className="hover:text-white hover:underline decoration-[#24CFA6] underline-offset-4 transition">Features</a>
        <a href="/#contact" className="hover:text-white hover:underline decoration-[#24CFA6] underline-offset-4 transition">Contact</a>
        <button 
          onClick={() => navigate('/auctions')}
          className="hover:text-white hover:underline decoration-[#24CFA6] underline-offset-4 transition"
        >
          Auctions
        </button>
      </div>

      {/* Auth Section */}
      <div className="flex gap-4 items-center relative">
        {isAuthenticated && user ? (
          <>
            <button
              onClick={() => navigate(getDashboardRoute())}
              className="bg-[#24CFA6] rounded-full px-4 h-10 font-medium hover:bg-[#24cfa7c9] transition-all"
            >
              Dashboard
            </button>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 text-white hover:text-[#24CFA6] transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-[#24CFA6] flex items-center justify-center font-bold">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <i className={`ri-arrow-${showDropdown ? 'up' : 'down'}-s-line`}></i>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-[#24CFA6] font-medium mt-1">{user.role}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigate(getDashboardRoute())
                      setShowDropdown(false)
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                  >
                    <i className="ri-dashboard-line"></i>
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 flex items-center gap-2"
                  >
                    <i className="ri-logout-box-line"></i>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={() => navigate('/auth')}
            className="bg-[#24CFA6] rounded-full w-28 h-10 font-medium hover:bg-[#24cfa7c9] transition-all"
          >
            Login
          </button>
        )}
      </div>
    </div>
  )
}

export default Navbar
