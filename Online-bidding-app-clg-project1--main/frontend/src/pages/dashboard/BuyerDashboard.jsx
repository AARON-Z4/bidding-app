import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { productsAPI, bidsAPI } from '../../services/api'
import { formatCurrency, formatDateTime, getTimeRemaining } from '../../utils/helpers'
import { AUCTION_STATUS } from '../../config/constants'
import { wsManager } from '../../services/websocket'

const BuyerDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('active-bids')
  const [loading, setLoading] = useState(true)
  const [activeBids, setActiveBids] = useState([])
  const [wonAuctions, setWonAuctions] = useState([])
  const [watchlist, setWatchlist] = useState([])
  const [notifications, setNotifications] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [stats, setStats] = useState({
    totalBids: 0,
    activeBids: 0,
    wonAuctions: 0,
    totalSpent: 0
  })

  useEffect(() => {
    fetchDashboardData()
    setupWebSocket()
    requestNotificationPermission()

    return () => {
      // Cleanup WebSocket listeners
      wsManager.off('bid_accepted')
      wsManager.off('product_sold')
      wsManager.off('outbid')
    }
  }, [])

  const setupWebSocket = () => {
    // Connect WebSocket
    wsManager.connect()
    
    setIsConnected(wsManager.isConnected())

    // Listen for bid acceptance notifications
    wsManager.on('bid_accepted', (data) => {
      console.log('Bid accepted:', data)
      
      const notification = {
        id: Date.now(),
        type: 'success',
        message: `🎉 Congratulations! Your bid of ${formatCurrency(data.amount)} for "${data.product_title}" has been accepted!`,
        timestamp: new Date().toISOString()
      }
      
      setNotifications(prev => [notification, ...prev.slice(0, 9)])
      
      // Show browser notification
      showBrowserNotification(
        'Bid Accepted! 🎉',
        `Your bid of ${formatCurrency(data.amount)} for "${data.product_title}" has been accepted!`
      )
      
      // Refresh dashboard data
      fetchDashboardData()
    })

    // Listen for product sold notifications
    wsManager.on('product_sold', (data) => {
      console.log('Product sold:', data)
      
      // Refresh dashboard to update product status
      fetchDashboardData()
    })

    // Listen for outbid notifications
    wsManager.on('outbid', (data) => {
      console.log('Outbid:', data)
      
      const notification = {
        id: Date.now(),
        type: 'warning',
        message: `⚠️ You've been outbid on "${data.product_title}". New bid: ${formatCurrency(data.new_bid)}`,
        timestamp: new Date().toISOString()
      }
      
      setNotifications(prev => [notification, ...prev.slice(0, 9)])
      
      // Show browser notification
      showBrowserNotification(
        'Outbid! ⚠️',
        `You've been outbid on "${data.product_title}". New bid: ${formatCurrency(data.new_bid)}`
      )
      
      // Refresh dashboard data
      fetchDashboardData()
    })
  }

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const showBrowserNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/logo.png',
        badge: '/logo.png'
      })
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch buyer's bids
      const bidsResponse = await bidsAPI.getMyBids()
      console.log('My bids:', bidsResponse.data)
      
      // Process active bids
      const active = bidsResponse.data
        .filter(bid => bid.product.status === 'ACTIVE')
        .map(bid => ({
          id: bid.id,
          product: {
            id: bid.product.id,
            title: bid.product.title,
            image: bid.product.images?.[0] || 'https://via.placeholder.com/150',
            currentBid: bid.product.current_bid,
            endTime: bid.product.end_time,
            status: bid.product.status
          },
          myBid: bid.amount,
          isLeading: bid.amount >= bid.product.current_bid,
          timestamp: bid.timestamp
        }))
      
      setActiveBids(active)

      // Process won auctions (products where buyer won)
      const won = bidsResponse.data
        .filter(bid => bid.product.status === 'SOLD' && bid.product.winner_id === user.id)
        .map(bid => ({
          id: bid.product.id,
          title: bid.product.title,
          image: bid.product.images?.[0] || 'https://via.placeholder.com/150',
          finalBid: bid.amount,
          soldAt: bid.product.updated_at
        }))
      
      setWonAuctions(won)
      
      // Calculate stats
      const totalBidsCount = bidsResponse.data.length
      const activeBidsCount = active.length
      const wonAuctionsCount = won.length
      const totalSpentAmount = won.reduce((sum, auction) => sum + auction.finalBid, 0)
      
      setStats({
        totalBids: totalBidsCount,
        activeBids: activeBidsCount,
        wonAuctions: wonAuctionsCount,
        totalSpent: totalSpentAmount
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const renderNotifications = () => {
    if (notifications.length === 0) return null

    return (
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <i className="ri-notification-3-line text-blue-600"></i>
            Recent Notifications
            {isConnected && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live
              </span>
            )}
          </h3>
          <button
            onClick={clearNotifications}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear All
          </button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 rounded-lg border-l-4 ${
                notif.type === 'success'
                  ? 'bg-green-50 border-green-500'
                  : 'bg-yellow-50 border-yellow-500'
              }`}
            >
              <p className="text-sm text-gray-800">{notif.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDateTime(notif.timestamp)}
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Bids</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalBids}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <i className="ri-auction-line text-blue-600 text-xl"></i>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Active Bids</p>
            <p className="text-2xl font-bold text-gray-800">{stats.activeBids}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <i className="ri-time-line text-green-600 text-xl"></i>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Won Auctions</p>
            <p className="text-2xl font-bold text-gray-800">{stats.wonAuctions}</p>
          </div>
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <i className="ri-trophy-line text-yellow-600 text-xl"></i>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Spent</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalSpent)}</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <i className="ri-money-rupee-circle-line text-purple-600 text-xl"></i>
          </div>
        </div>
      </div>
    </div>
  )

  const renderActiveBids = () => (
    <div className="space-y-4">
      {activeBids.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="ri-auction-line text-gray-300 text-6xl mb-4"></i>
          <p className="text-gray-500 text-lg">No active bids yet</p>
          <button
            onClick={() => navigate('/buyer/auctions')}
            className="mt-4 bg-[#24CFA6] text-white px-6 py-2 rounded-lg hover:bg-[#24cfa7c9] transition-all"
          >
            Browse Auctions
          </button>
        </div>
      ) : (
        activeBids.map((bid) => (
          <div key={bid.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-6">
              <img
                src={bid.product.image}
                alt={bid.product.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{bid.product.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Your Bid: <strong className="text-[#24CFA6]">{formatCurrency(bid.myBid)}</strong></span>
                  <span>Current Bid: <strong>{formatCurrency(bid.product.currentBid)}</strong></span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    bid.isLeading ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {bid.isLeading ? '🏆 Leading' : 'Outbid'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Ends in: <strong>{getTimeRemaining(bid.product.endTime)}</strong>
                </p>
              </div>
              <button
                onClick={() => navigate(`/auction/${bid.product.id}`)}
                className="bg-[#24CFA6] text-white px-6 py-2 rounded-lg hover:bg-[#24cfa7c9] transition-all"
              >
                View Auction
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )

  const renderWonAuctions = () => (
    <div className="space-y-4">
      {wonAuctions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="ri-trophy-line text-gray-300 text-6xl mb-4"></i>
          <p className="text-gray-500 text-lg">No won auctions yet</p>
          <p className="text-gray-400 text-sm mt-2">Keep bidding to win amazing items!</p>
        </div>
      ) : (
        wonAuctions.map((auction) => (
          <div key={auction.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-6">
              <img
                src={auction.image}
                alt={auction.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">{auction.title}</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    🏆 Won
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Final Bid: <strong className="text-green-600">{formatCurrency(auction.finalBid)}</strong></span>
                  <span>Won on: <strong>{formatDateTime(auction.soldAt)}</strong></span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/auction/${auction.id}`)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all"
              >
                View Details
              </button>
            </div>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">Manage your bids and track your auctions</p>
        </div>

        {/* Real-time Notifications */}
        {renderNotifications()}

        {/* Stats */}
        {renderStats()}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('active-bids')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeTab === 'active-bids'
                  ? 'text-[#24CFA6] border-b-2 border-[#24CFA6]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="ri-auction-line mr-2"></i>
              Active Bids ({stats.activeBids})
            </button>
            <button
              onClick={() => setActiveTab('won-auctions')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeTab === 'won-auctions'
                  ? 'text-[#24CFA6] border-b-2 border-[#24CFA6]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="ri-trophy-line mr-2"></i>
              Won Auctions ({stats.wonAuctions})
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeTab === 'watchlist'
                  ? 'text-[#24CFA6] border-b-2 border-[#24CFA6]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="ri-heart-line mr-2"></i>
              Watchlist
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'active-bids' && renderActiveBids()}
          {activeTab === 'won-auctions' && renderWonAuctions()}
          {activeTab === 'watchlist' && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <i className="ri-heart-line text-gray-300 text-6xl mb-4"></i>
              <p className="text-gray-500 text-lg">Your watchlist is empty</p>
              <p className="text-gray-400 text-sm mt-2">Add items to your watchlist to track them easily</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BuyerDashboard