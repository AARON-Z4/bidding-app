import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { adminAPI } from '../../services/api'
import { formatCurrency, formatDateTime } from '../../utils/helpers'
import { USER_ROLES, AUCTION_STATUS } from '../../config/constants'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBuyers: 0,
    totalSellers: 0,
    totalProducts: 0,
    activeAuctions: 0,
    completedAuctions: 0,
    totalRevenue: 0,
    platformFees: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API calls when backend is ready
      // const [statsRes, usersRes, productsRes] = await Promise.all([
      //   adminAPI.getStats(),
      //   adminAPI.getAllUsers(),
      //   adminAPI.getAllProducts()
      // ])
      
      // Mock data for now
      setStats({
        totalUsers: 150,
        totalBuyers: 100,
        totalSellers: 45,
        totalProducts: 85,
        activeAuctions: 32,
        completedAuctions: 53,
        totalRevenue: 2500000,
        platformFees: 125000
      })

      setUsers([
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: USER_ROLES.BUYER,
          createdAt: new Date().toISOString(),
          isActive: true
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: USER_ROLES.SELLER,
          createdAt: new Date().toISOString(),
          isActive: true
        }
      ])

      setProducts([
        {
          id: 1,
          title: 'Vintage Camera',
          seller: 'Jane Smith',
          currentBid: 15000,
          status: AUCTION_STATUS.ACTIVE,
          createdAt: new Date().toISOString()
        }
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId, action) => {
    try {
      // TODO: Implement user actions (ban, activate, delete)
      console.log(`${action} user ${userId}`)
    } catch (error) {
      console.error('Error performing user action:', error)
    }
  }

  const handleProductAction = async (productId, action) => {
    try {
      // TODO: Implement product actions (approve, reject, delete)
      console.log(`${action} product ${productId}`)
    } catch (error) {
      console.error('Error performing product action:', error)
    }
  }

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
            <p className="text-xs text-gray-400 mt-1">
              {stats.totalBuyers} Buyers • {stats.totalSellers} Sellers
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <i className="ri-user-line text-blue-600 text-xl"></i>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Products</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
            <p className="text-xs text-gray-400 mt-1">
              {stats.activeAuctions} Active • {stats.completedAuctions} Completed
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <i className="ri-store-line text-green-600 text-xl"></i>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-xs text-gray-400 mt-1">All transactions</p>
          </div>
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <i className="ri-money-rupee-circle-line text-yellow-600 text-xl"></i>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Platform Fees</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.platformFees)}</p>
            <p className="text-xs text-gray-400 mt-1">5% commission</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <i className="ri-wallet-line text-purple-600 text-xl"></i>
          </div>
        </div>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#24CFA6] flex items-center justify-center font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === USER_ROLES.SELLER
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(user.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleUserAction(user.id, 'ban')}
                    className="text-red-600 hover:text-red-900 mr-3"
                  >
                    Ban
                  </button>
                  <button
                    onClick={() => handleUserAction(user.id, 'delete')}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderProducts = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Bid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{product.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.seller}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  {formatCurrency(product.currentBid)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.status === AUCTION_STATUS.ACTIVE
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(product.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleProductAction(product.id, 'view')}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleProductAction(product.id, 'delete')}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
            Admin Dashboard 👑
          </h1>
          <p className="text-gray-600">Manage users, products, and monitor platform activity</p>
        </div>

        {/* Stats */}
        {renderStats()}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeTab === 'overview'
                  ? 'text-[#24CFA6] border-b-2 border-[#24CFA6]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="ri-dashboard-line mr-2"></i>
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeTab === 'users'
                  ? 'text-[#24CFA6] border-b-2 border-[#24CFA6]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="ri-user-line mr-2"></i>
              Users
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeTab === 'products'
                  ? 'text-[#24CFA6] border-b-2 border-[#24CFA6]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="ri-store-line mr-2"></i>
              Products
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                activeTab === 'reports'
                  ? 'text-[#24CFA6] border-b-2 border-[#24CFA6]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="ri-file-chart-line mr-2"></i>
              Reports
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <i className="ri-dashboard-line text-gray-300 text-6xl mb-4"></i>
              <p className="text-gray-500 text-lg">Overview charts and analytics coming soon</p>
            </div>
          )}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <i className="ri-file-chart-line text-gray-300 text-6xl mb-4"></i>
              <p className="text-gray-500 text-lg">Reports coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard