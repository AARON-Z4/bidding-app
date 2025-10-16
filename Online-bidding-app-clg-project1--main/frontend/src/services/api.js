import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../config/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH APIs ====================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ==================== PRODUCTS APIs ====================
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getByCategory: (category) => api.get(`/products/category/${category}`),
  search: (query) => api.get(`/products/search?q=${query}`),
  getSellerProductsWithBids: () => api.get('/products/seller/products-with-bids'),
  acceptBid: (productId, bidId) => api.post(`/products/${productId}/accept-bid/${bidId}`),
};

// ==================== BIDS APIs ====================
export const bidsAPI = {
  getByProduct: (productId) => api.get(`/bids/${productId}`),
  placeBid: (data) => api.post('/bids', data),
  getMyBids: () => api.get('/bids/my-bids'),
  getBidHistory: (productId) => api.get(`/bids/${productId}/history`),
};

// ==================== PAYMENTS APIs ====================
export const paymentsAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
  getTransactions: () => api.get('/payments/transactions'),
  getTransactionById: (id) => api.get(`/payments/transactions/${id}`),
};

// ==================== ADMIN APIs ====================
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getProducts: (params) => api.get('/admin/products', { params }),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  getTransactions: (params) => api.get('/admin/transactions', { params }),
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
};

// ==================== UPLOAD APIs ====================
export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadMultiple: (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;