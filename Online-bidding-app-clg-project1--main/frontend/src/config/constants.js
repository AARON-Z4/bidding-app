// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws';

// User Roles
export const USER_ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin',
};

// Auction Status
export const AUCTION_STATUS = {
  ACTIVE: 'active',
  ENDED: 'ended',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'nextgen_token',
  USER: 'nextgen_user',
  THEME: 'nextgen_theme',
};

// Razorpay Configuration
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

// Pagination
export const ITEMS_PER_PAGE = 12;

// Bid Increment Rules
export const BID_INCREMENT = {
  MIN: 1,
  PERCENTAGE: 5, // 5% minimum increment
};

// Time Formats
export const DATE_FORMAT = 'MMM DD, YYYY';
export const TIME_FORMAT = 'hh:mm A';
export const DATETIME_FORMAT = 'MMM DD, YYYY hh:mm A';