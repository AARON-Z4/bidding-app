# 🚀 NextGen Marketplace - Full-Stack Auction Platform

A modern, full-stack eBay-style auction marketplace with real-time bidding, role-based authentication, and integrated payment processing.

![NextGen Marketplace](https://img.shields.io/badge/Status-In%20Development-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Buyer, Seller, Admin)
- Secure password hashing with bcrypt
- Protected routes and API endpoints

### 🏪 Auction Management
- Create and manage auction listings (Sellers)
- Browse active auctions with filters
- Real-time auction countdown
- Category-based organization
- Image upload support

### 💰 Real-Time Bidding
- WebSocket-powered live bidding
- Instant bid updates across all clients
- Automatic bid validation
- Bid history tracking
- Leading bid indicators

### 💳 Payment Integration
- Razorpay payment gateway integration
- Secure payment processing
- Transaction history
- Platform fee calculation (5%)
- Payment verification

### 📊 Dashboards
- **Buyer Dashboard**: Active bids, won auctions, watchlist
- **Seller Dashboard**: Listings management, sales analytics
- **Admin Dashboard**: User management, platform statistics, product moderation

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Smooth animations and transitions
- Intuitive navigation
- Real-time notifications

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Context API
- **HTTP Client**: Axios
- **WebSocket**: Native WebSocket API
- **Icons**: Remix Icons

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt
- **Payment**: Razorpay
- **WebSocket**: FastAPI WebSocket

### DevOps
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 15

## 📁 Project Structure

```
nextgen-marketplace/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── common/      # Common components (ProtectedRoute, etc.)
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── BidPopup.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── auth/        # Authentication pages
│   │   │   ├── dashboard/   # Dashboard pages (Buyer, Seller, Admin)
│   │   │   ├── AuctionPage.jsx
│   │   │   └── ActionDetail.jsx
│   │   ├── context/         # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── WebSocketContext.jsx
│   │   ├── services/        # API services
│   │   │   └── api.js
│   │   ├── utils/           # Utility functions
│   │   │   └── helpers.js
│   │   ├── config/          # Configuration
│   │   │   └── constants.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── package.json
│
├── backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/      # API route handlers
│   │   │       ├── auth.py
│   │   │       ├── products.py
│   │   │       ├── bids.py
│   │   │       ├── payments.py
│   │   │       └── admin.py
│   │   ├── core/            # Core functionality
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models/          # Database models
│   │   │   ├── user.py
│   │   │   ├── product.py
│   │   │   ├── bid.py
│   │   │   └── transaction.py
│   │   ├── schemas/         # Pydantic schemas
│   │   │   ├── user.py
│   │   │   ├── product.py
│   │   │   ├── bid.py
│   │   │   └── transaction.py
│   │   ├── services/        # Business logic
│   │   │   └── websocket_manager.py
│   │   └── main.py          # Application entry point
│   ├── .env
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml       # Docker orchestration
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd nextgen-marketplace
```

2. **Configure environment variables**
```bash
# Create .env file in root directory
echo "RAZORPAY_KEY_ID=your_key_id" > .env
echo "RAZORPAY_KEY_SECRET=your_key_secret" >> .env
```

3. **Start all services**
```bash
docker-compose up -d
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your database credentials and API keys
```

5. **Create database**
```bash
psql -U postgres
CREATE DATABASE nextgen_marketplace;
\q
```

6. **Run the backend**
```bash
python -m app.main
```

Backend will be available at http://localhost:8000

#### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env if needed (default values should work)
```

4. **Run the frontend**
```bash
npm run dev
```

Frontend will be available at http://localhost:5173

## 📖 Usage Guide

### For Buyers
1. Register as a Buyer
2. Browse active auctions
3. Place bids on items
4. Track your active bids in the dashboard
5. Complete payment for won auctions

### For Sellers
1. Register as a Seller
2. Create auction listings
3. Set starting bid and auction duration
4. Monitor bids in real-time
5. Manage your listings

### For Admins
1. Access admin dashboard
2. View platform statistics
3. Manage users (activate/deactivate)
4. Moderate product listings
5. View all transactions

## 🔑 API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- CORS protection
- SQL injection prevention (SQLAlchemy ORM)
- XSS protection
- Secure payment processing

## 🌟 Future Enhancements

- [ ] Email notifications
- [ ] SMS alerts for outbid notifications
- [ ] Advanced search and filters
- [ ] Product ratings and reviews
- [ ] Seller verification system
- [ ] Auction scheduling
- [ ] Bulk product upload
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- FastAPI for the amazing Python framework
- React team for the frontend library
- Tailwind CSS for the utility-first CSS framework
- Razorpay for payment integration

## 📧 Contact

For questions or support, please contact: your-email@example.com

---

**Made with ❤️ by NextGen Team**