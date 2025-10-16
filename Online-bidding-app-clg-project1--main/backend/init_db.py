"""
Database initialization script
Creates tables and adds initial admin user
"""
import sys
from pathlib import Path

# Add the backend directory to the path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.core.database import engine, SessionLocal, Base
from app.models import User, Product, Bid, Transaction
from app.core.security import get_password_hash
from app.models.user import UserRole

def init_database():
    """Initialize database and create tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully!")

def create_admin_user():
    """Create initial admin user"""
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == "admin@nextgen.com").first()
        if existing_admin:
            print("✓ Admin user already exists")
            return
        
        # Create admin user
        admin_user = User(
            email="admin@nextgen.com",
            name="System Administrator",
            password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        print("✓ Admin user created successfully!")
        print("  Email: admin@nextgen.com")
        print("  Password: admin123")
        
    except Exception as e:
        print(f"✗ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

def create_test_users():
    """Create test buyer and seller users"""
    db = SessionLocal()
    try:
        # Create test buyer
        existing_buyer = db.query(User).filter(User.email == "buyer@test.com").first()
        if not existing_buyer:
            buyer = User(
                email="buyer@test.com",
                name="Test Buyer",
                password=get_password_hash("buyer123"),
                role=UserRole.BUYER,
                is_active=True
            )
            db.add(buyer)
            print("✓ Test buyer created (buyer@test.com / buyer123)")
        
        # Create test seller
        existing_seller = db.query(User).filter(User.email == "seller@test.com").first()
        if not existing_seller:
            seller = User(
                email="seller@test.com",
                name="Test Seller",
                password=get_password_hash("seller123"),
                role=UserRole.SELLER,
                is_active=True
            )
            db.add(seller)
            print("✓ Test seller created (seller@test.com / seller123)")
        
        db.commit()
        
    except Exception as e:
        print(f"✗ Error creating test users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 50)
    print("NextGen Marketplace - Database Initialization")
    print("=" * 50)
    
    try:
        init_database()
        create_admin_user()
        create_test_users()
        
        print("\n" + "=" * 50)
        print("Database initialization completed successfully!")
        print("=" * 50)
        print("\nTest Accounts:")
        print("  Admin:  admin@nextgen.com / admin123")
        print("  Buyer:  buyer@test.com / buyer123")
        print("  Seller: seller@test.com / seller123")
        print("\nYou can now start the backend server with:")
        print("  uvicorn app.main:app --reload")
        
    except Exception as e:
        print(f"\n✗ Database initialization failed: {e}")
        sys.exit(1)