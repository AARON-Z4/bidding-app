# NextGen Marketplace - Backend API

FastAPI backend for the NextGen Marketplace auction platform.

## Features

- 🔐 JWT Authentication with role-based access control
- 👥 User management (Buyer, Seller, Admin roles)
- 🏪 Product/Auction management
- 💰 Real-time bidding with WebSocket support
- 💳 Razorpay payment integration
- 📊 Admin dashboard with statistics
- 🗄️ PostgreSQL database with SQLAlchemy ORM

## Tech Stack

- **Framework**: FastAPI 0.104.1
- **Database**: PostgreSQL with SQLAlchemy
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt
- **Payment**: Razorpay
- **WebSocket**: Native FastAPI WebSocket support

## Setup Instructions

### 1. Install PostgreSQL

Make sure PostgreSQL is installed and running on your system.

### 2. Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE nextgen_marketplace;

# Exit
\q
```

### 3. Install Python Dependencies

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update the following in `.env`:
- `DATABASE_URL`: Your PostgreSQL connection string
- `SECRET_KEY`: Generate a secure secret key
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`: Your Razorpay credentials

### 5. Run the Application

```bash
# From backend directory
python -m app.main

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products/` - Get all products (with filters)
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products/` - Create product (Seller only)
- `PUT /api/products/{id}` - Update product (Owner/Admin)
- `DELETE /api/products/{id}` - Delete product (Owner/Admin)
- `GET /api/products/seller/my-products` - Get seller's products
- `GET /api/products/categories/list` - Get all categories

### Bids
- `POST /api/bids/` - Place a bid (Buyer only)
- `GET /api/bids/product/{id}` - Get all bids for a product
- `GET /api/bids/my-bids` - Get user's bids
- `GET /api/bids/my-active-bids` - Get user's active bids

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify-payment` - Verify payment
- `GET /api/payments/my-transactions` - Get user's transactions
- `GET /api/payments/{id}` - Get transaction by ID

### Admin
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/{id}/toggle-active` - Toggle user status
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/products` - Get all products
- `DELETE /api/admin/products/{id}` - Delete product

### WebSocket
- `WS /ws/auction/{product_id}` - Real-time auction updates

## Database Models

### User
- id, email, password, name, phone, role, is_active, created_at, updated_at

### Product
- id, seller_id, title, description, images, category, starting_bid, current_bid, bid_increment, start_time, end_time, status, winner_id, created_at, updated_at

### Bid
- id, product_id, buyer_id, amount, timestamp

### Transaction
- id, product_id, buyer_id, seller_id, amount, platform_fee, razorpay_order_id, razorpay_payment_id, razorpay_signature, status, created_at, updated_at

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── products.py
│   │   │   ├── bids.py
│   │   │   ├── payments.py
│   │   │   └── admin.py
│   │   └── __init__.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── models/
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── bid.py
│   │   └── transaction.py
│   ├── schemas/
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── bid.py
│   │   ├── transaction.py
│   │   └── token.py
│   ├── services/
│   │   └── websocket_manager.py
│   ├── utils/
│   └── main.py
├── .env
├── .env.example
├── requirements.txt
└── README.md
```

## Development

### Generate Secret Key

```python
import secrets
print(secrets.token_hex(32))
```

### Database Migrations (Optional - using Alembic)

```bash
# Initialize Alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial migration"

# Apply migration
alembic upgrade head
```

## Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

## Deployment

See the main project README for Docker deployment instructions.

## License

MIT License