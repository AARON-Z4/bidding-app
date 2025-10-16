import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useWebSocket } from '../../context/WebSocketContext'
import { productsAPI } from '../../services/api'
import { formatCurrency, formatDateTime, getTimeRemaining } from '../../utils/helpers'
import { AUCTION_STATUS } from '../../config/constants'

const SellerDashboard = () => {
  const { user } = useAuth()
  const { socket, isConnected } = useWebSocket()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('active-listings')
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [productsWithBids, setProductsWithBids] = useState([])
  const [soldItems, setSoldItems] = useState([])
  const [notifications, setNotifications] = useState([])
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    soldItems: 0,
    totalRevenue: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // WebSocket real-time notifications
  useEffect(() => {
    if (!socket || !isConnected) return

    const handleNewBid = (data) => {
      console.log('New bid received:', data)
      
      // Add notification
      const notification = {
        id: Date.now(),
        message: `New bid of ₹${data.amount} on ${data.product_title} by ${data.buyer_name}`,
        timestamp: new Date(),
        type: 'bid'
      }
      setNotifications(prev => [notification, ...prev].slice(0, 10))

      // Update products with bids
      fetchDashboardData()

      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification('New Bid Received!', {
          body: notification.message,
          icon: '/favicon.ico'
        })
      }
    }

    const handleProductSold = (data) => {
      console.log('Product sold:', data)
      
      const notification = {
        id: Date.now(),
        message: `Product ${data.product_title} sold for ₹${data.final_amount}!`,
        timestamp: new Date(),
        type: 'sale'
      }
      setNotifications(prev => [notification, ...prev].slice(0, 10))

      // Refresh dashboard
      fetchDashboardData()
    }

    socket.on('new_bid', handleNewBid)
    socket.on('product_sold', handleProductSold)

    return () => {
      socket.off('new_bid', handleNewBid)
      socket.off('product_sold', handleProductSold)
    }
  }, [socket, isConnected])

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch products with bids
      const response = await productsAPI.getSellerProductsWithBids()
      setProductsWithBids(response.data || [])
      
      // Calculate stats
      const activeCount = response.data?.length || 0
      const totalBids = response.data?.reduce((sum, p) => sum + p.bids_count, 0) || 0
      
      setStats({
        totalListings: activeCount,
        activeListings: activeCount,
        soldItems: 0, // TODO: Fetch from sold items endpoint
        totalRevenue: 0 // TODO: Calculate from transactions
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptBid = async (productId, bidId, amount, buyerName) => {
    if (!confirm(`Accept bid of ₹${amount} from ${buyerName}?`)) {
      return
    }

    try {
      await productsAPI.acceptBid(productId, bidId)
      
      // Show success notification
      alert(`Successfully sold! Transaction completed with ${buyerName}`)
      
      // Refresh dashboard
      fetchDashboardData()
    } catch (error) {
      console.error('Error accepting bid:', error)
      alert('Failed to accept bid. Please try again.')
    }
  }

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Listings</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalListings}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <i className="ri-store-line text-blue-600 text-xl"></i>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Active Listings</p>
            <p className="text-2xl font-bold text-gray-800">{stats.activeListings}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <i className="ri-time-line text-green-600 text-xl"></i>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Sold Items</p>
            <p className="text-2xl font-bold text-gray-800">{stats.soldItems}</p>
          </div>
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <i className="ri-shopping-bag-line text-yellow-600 text-xl"></i>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalRevenue)}</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <i className="ri-money-rupee-circle-line text-purple-600 text-xl"></i>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotifications = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <i className="ri-notification-line mr-2 text-[#24CFA6]"></i>
        Recent Notifications
        {isConnected && (
          <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            Live
          </span>
        )}
      </h3>
      {notifications.length === 0 ? (
        <p className="text-gray-500 text-sm">No new notifications</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 rounded-lg ${
                notif.type === 'bid' ? 'bg-blue-50' : 'bg-green-50'
              }`}
            >
              <p className="text-sm text-gray-800">{notif.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDateTime(notif.timestamp)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderActiveListings = () => (
    <div className="space-y-6">
      {productsWithBids.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="ri-store-line text-gray-300 text-6xl mb-4"></i>
          <p className="text-gray-500 text-lg mb-4">No active listings yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#24CFA6] text-white px-6 py-2 rounded-lg hover:bg-[#24cfa7c9] transition-all"
          >
            Create Your First Listing
          </button>
        </div>
      ) : (
        productsWithBids.map((product) => (
          <div key={product.product_id} className="bg-white rounded-lg shadow-md p-6">
            {/* Product Header */}
            <div className="flex items-center gap-6 mb-4 pb-4 border-b">
              <img
                src={product.images?.[0] || 'https://via.placeholder.com/150'}
                alt={product.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Starting: <strong>{formatCurrency(product.starting_bid)}</strong></span>
                  <span>Current: <strong className="text-[#24CFA6]">{formatCurrency(product.current_bid)}</strong></span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {product.bids_count} Bids
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Ends in: <strong>{getTimeRemaining(product.end_time)}</strong>
                </p>
              </div>
              <button
                onClick={() => navigate(`/auction/${product.product_id}`)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all"
              >
                <i className="ri-eye-line mr-2"></i>
                View
              </button>
            </div>

            {/* Bids List */}
            {product.bids && product.bids.length > 0 ? (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  All Bids ({product.bids.length})
                </h4>
                <div className="space-y-2">
                  {product.bids.map((bid, index) => (
                    <div
                      key={bid.bid_id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {index === 0 && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                            Highest
                          </span>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">{bid.buyer_name}</p>
                          <p className="text-xs text-gray-500">{bid.buyer_email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-800">
                            {formatCurrency(bid.amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDateTime(bid.timestamp)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAcceptBid(
                            product.product_id,
                            bid.bid_id,
                            bid.amount,
                            bid.buyer_name
                          )}
                          className="bg-[#24CFA6] text-white px-4 py-2 rounded-lg hover:bg-[#24cfa7c9] transition-all flex items-center gap-2"
                        >
                          <i className="ri-check-line"></i>
                          Accept & Sell
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                No bids yet. Waiting for buyers...
              </p>
            )}
          </div>
        ))
      )}
    </div>
  )

  const renderSoldItems = () => (
    <div className="space-y-4">
      {soldItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="ri-shopping-bag-line text-gray-300 text-6xl mb-4"></i>
          <p className="text-gray-500 text-lg">No sold items yet</p>
        </div>
      ) : (
        soldItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
            {/* Sold item content */}
          </div>
        ))
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#24CFA6]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Seller Dashboard 🏪
            </h1>
            <p className="text-gray-600">Manage your listings and track your sales in real-time</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#24CFA6] text-white px-6 py-3 rounded-lg hover:bg-[#24cfa7c9] transition-all flex items-center gap-2"
          >
            <i className="ri-add-line text-xl"></i>
            Create New Listing
          </button>
        </div>

        {/* Stats */}
        {renderStats()}

        {/* Notifications */}
        {renderNotifications()}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('active-listings')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeTab === 'active-listings'
                  ? 'text-[#24CFA6] border-b-2 border-[#24CFA6]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="ri-store-line mr-2"></i>
              Active Listings & Bids
            </button>
            <button
              onClick={() => setActiveTab('sold-items')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeTab === 'sold-items'
                  ? 'text-[#24CFA6] border-b-2 border-[#24CFA6]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="ri-shopping-bag-line mr-2"></i>
              Sold Items
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'active-listings' && renderActiveListings()}
          {activeTab === 'sold-items' && renderSoldItems()}
        </div>
      </div>

      {/* Create Listing Modal - Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Listing</h2>
            <p className="text-gray-600 mb-6">This feature will be implemented soon!</p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="bg-[#24CFA6] text-white px-6 py-2 rounded-lg hover:bg-[#24cfa7c9] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerDashboard