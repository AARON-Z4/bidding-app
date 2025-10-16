import React, { useEffect, useState } from 'react'

const Login = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true)

  // Disable scroll when modal is shown
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative diagonal-border backdrop-blur-2xl bg-white/40 text-white w-[25rem] p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-white text-lg hover:text-red-400"
          aria-label="Close modal"
        >
          <i className="ri-close-line"></i>
        </button>

        {/* Heading */}
        <h2 className="text-2xl font-semibold mb-4 text-center">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>

        {/* Email Input */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 rounded-lg bg-white/10 border border-white/30 text-white placeholder:text-white/70"
        />

        {/* Password Input */}
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 rounded-lg bg-white/10 border border-white/30 text-white placeholder:text-white/70"
        />

        {/* Extra confirm password for Sign Up */}
        {!isLogin && (
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-2 mb-4 rounded-lg bg-white/10 border border-white/30 text-white placeholder:text-white/70"
          />
        )}

        {/* Forgot Password link only on login */}

        {/* Sign In / Sign Up Button */}
        <button className="w-full bg-[#24CFA6] hover:bg-[#24cfa7c9] transition-all rounded-full py-2 font-medium mb-4">
          {isLogin ? 'Sign In' : 'Create Account'}
        </button>

        {/* Toggle Links */}
        <div className="text-center text-sm text-white/80">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setIsLogin(false)}
                className=" text-[#24CFA6] font-semibold hover:underline hover:text-white transition"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setIsLogin(true)}
                className="text-[#24CFA6] font-semibold hover:underline hover:text-white transition"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
