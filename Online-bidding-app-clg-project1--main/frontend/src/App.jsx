import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Context Providers
import { AuthProvider } from './context/AuthContext'
import { WebSocketProvider } from './context/WebSocketContext'

// Components
import Navbar from './components/Navbar'
import Login from './components/Login'
import Footer from './components/Footer'
import ProtectedRoute from './components/common/ProtectedRoute'

// Pages
import AuctionsPage from './pages/AuctionPage'
import HeaderPage from './pages/HeaderPage'
import About from './pages/About'
import Features from './pages/Features'
import Contact from './pages/Contact'
import AuctionDetail from './pages/ActionDetail'
import Layout from './pages/Layout'
import AuthPage from './pages/auth/AuthPage'
import BuyerLogin from './pages/auth/BuyerLogin'
import SellerLogin from './pages/auth/SellerLogin'
import BuyerDashboard from './pages/dashboard/BuyerDashboard'
import SellerDashboard from './pages/dashboard/SellerDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'

// Constants
import { USER_ROLES } from './config/constants'


const App = () => {
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    document.body.style.overflow = showLogin ? 'hidden' : 'auto'
  }, [showLogin])

  return (
    <AuthProvider>
      <WebSocketProvider>
        <div className='bg-[url("src/assets/bg.svg")] bg-cover w-full min-h-screen'>
          <Navbar onLoginClick={() => setShowLogin(true)} />

          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <>
                    <section id="header"> <HeaderPage /> </section>
                    <section id="about"> <About /> </section>
                    <section id="features"> <Features /> </section>
                    <section id="contact"> <Contact /> </section>
                    <Footer />
                  </>
                }
              />
              <Route path="/auctions" element={<AuctionsPage />} />
              <Route path="/auction/:id" element={<AuctionDetail />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/buyer/login" element={<BuyerLogin />} />
              <Route path="/seller/login" element={<SellerLogin />} />

              {/* Protected Routes - Buyer */}
              <Route
                path="/buyer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.BUYER]}>
                    <BuyerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buyer/auctions"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.BUYER]}>
                    <AuctionsPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes - Seller */}
              <Route
                path="/seller/dashboard"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.SELLER]}>
                    <SellerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes - Admin */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>

          {showLogin && <Login onClose={() => setShowLogin(false)} />}
        </div>
      </WebSocketProvider>
    </AuthProvider>
  )
}

export default App
