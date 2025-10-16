"""
Seed inventory data with clothes, watches, and shoes
"""
import sys
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.product import Product, AuctionStatus
from app.core.security import get_password_hash

def reset_database():
    """Drop all tables and recreate them"""
    print("🗑️  Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("✅ Tables dropped")
    
    print("📦 Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created")


def create_users(db: Session):
    """Create sample buyers and sellers"""
    print("\n👥 Creating users...")
    
    users = [
        # Buyers
        User(
            email="buyer1@example.com",
            password=get_password_hash("password123"),
            name="John Buyer",
            phone="1234567890",
            role=UserRole.BUYER,
            is_active=True
        ),
        User(
            email="buyer2@example.com",
            password=get_password_hash("password123"),
            name="Sarah Buyer",
            phone="1234567891",
            role=UserRole.BUYER,
            is_active=True
        ),
        User(
            email="buyer3@example.com",
            password=get_password_hash("password123"),
            name="Mike Buyer",
            phone="1234567892",
            role=UserRole.BUYER,
            is_active=True
        ),
        # Sellers
        User(
            email="seller1@example.com",
            password=get_password_hash("password123"),
            name="Fashion Store",
            phone="9876543210",
            role=UserRole.SELLER,
            is_active=True
        ),
        User(
            email="seller2@example.com",
            password=get_password_hash("password123"),
            name="Luxury Watches",
            phone="9876543211",
            role=UserRole.SELLER,
            is_active=True
        ),
        User(
            email="seller3@example.com",
            password=get_password_hash("password123"),
            name="Shoe Paradise",
            phone="9876543212",
            role=UserRole.SELLER,
            is_active=True
        ),
    ]
    
    for user in users:
        db.add(user)
    
    db.commit()
    print(f"✅ Created {len(users)} users (3 buyers, 3 sellers)")
    return users


def create_inventory(db: Session, sellers):
    """Create inventory items: clothes, watches, and shoes"""
    print("\n📦 Creating inventory...")
    
    # Get sellers
    fashion_seller = sellers[3]  # Fashion Store
    watch_seller = sellers[4]    # Luxury Watches
    shoe_seller = sellers[5]      # Shoe Paradise
    
    now = datetime.utcnow()
    
    products = [
        # CLOTHES
        Product(
            seller_id=fashion_seller.id,
            title="Designer Leather Jacket",
            description="Premium quality genuine leather jacket. Perfect for winter. Size: L. Brand new with tags.",
            images=["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500"],
            category="Clothes",
            starting_bid=5000.0,
            current_bid=5000.0,
            bid_increment=500.0,
            start_time=now,
            end_time=now + timedelta(days=3),
            status=AuctionStatus.ACTIVE
        ),
        Product(
            seller_id=fashion_seller.id,
            title="Vintage Denim Jeans",
            description="Classic blue denim jeans. Levi's 501. Size: 32. Excellent condition.",
            images=["https://images.unsplash.com/photo-1542272604-787c3835535d?w=500"],
            category="Clothes",
            starting_bid=2000.0,
            current_bid=2000.0,
            bid_increment=200.0,
            start_time=now,
            end_time=now + timedelta(days=2),
            status=AuctionStatus.ACTIVE
        ),
        Product(
            seller_id=fashion_seller.id,
            title="Silk Evening Dress",
            description="Elegant silk evening dress. Perfect for parties. Size: M. Red color.",
            images=["https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500"],
            category="Clothes",
            starting_bid=8000.0,
            current_bid=8000.0,
            bid_increment=1000.0,
            start_time=now,
            end_time=now + timedelta(days=5),
            status=AuctionStatus.ACTIVE
        ),
        Product(
            seller_id=fashion_seller.id,
            title="Casual Cotton T-Shirt Pack",
            description="Pack of 3 premium cotton t-shirts. Sizes: M, L, XL. Multiple colors.",
            images=["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"],
            category="Clothes",
            starting_bid=1500.0,
            current_bid=1500.0,
            bid_increment=100.0,
            start_time=now,
            end_time=now + timedelta(days=1),
            status=AuctionStatus.ACTIVE
        ),
        Product(
            seller_id=fashion_seller.id,
            title="Winter Wool Coat",
            description="Warm wool coat for winter. Size: L. Gray color. Brand: Zara.",
            images=["https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500"],
            category="Clothes",
            starting_bid=6000.0,
            current_bid=6000.0,
            bid_increment=500.0,
            start_time=now,
            end_time=now + timedelta(days=4),
            status=AuctionStatus.ACTIVE
        ),
        
        # WATCHES
        Product(
            seller_id=watch_seller.id,
            title="Rolex Submariner",
            description="Authentic Rolex Submariner. Stainless steel. Automatic movement. With box and papers.",
            images=["https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500"],
            category="Watches",
            starting_bid=500000.0,
            current_bid=500000.0,
            bid_increment=50000.0,
            start_time=now,
            end_time=now + timedelta(days=7),
            status=AuctionStatus.ACTIVE
        ),
        Product(
            seller_id=watch_seller.id,
            title="Omega Speedmaster",
            description="Omega Speedmaster Professional. Moonwatch. Manual wind. Excellent condition.",
            images=["https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=500"],
            category="Watches",
            starting_bid=300000.0,
            current_bid=300000.0,
            bid_increment=25000.0,
            start_time=now,
            end_time=now + timedelta(days=6),
            status=AuctionStatus.ACTIVE
        ),
        Product(
            seller_id=watch_seller.id,
            title="Tag Heuer Carrera",
            description="Tag Heuer Carrera Chronograph. Automatic. Black dial. Leather strap.",
            images=["https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500"],
            category="Watches",
            starting_bid=150000.0,
            current_bid=150000.0,
            bid_increment=10000.0,
            start_time=now,
            end_time=now + timedelta(days=5),
            status=AuctionStatus.ACTIVE
        ),
        Product(
            seller_id=watch_seller.id,
            title="Seiko Presage",
            description="Seiko Presage Cocktail Time. Automatic. Blue dial. Stunning design.",
            images=["https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=500"],
            category="Watches",
            starting_bid=25000.0,
            current_bid=25000.0,
            bid_increment=2000.0,
            start_time=now,
            end_time=now + timedelta(days=3),
            status=AuctionStatus.ACTIVE
        ),
        Product(
            seller_id=watch_seller.id,
            title="Casio G-Shock Limited Edition",
            description="Casio G-Shock limited edition. Digital. Shock resistant. Perfect for sports.",
            images=["https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=500"],
            category="Watches",
            starting_bid=8000.0,
            current_bid=8000.0,
            bid_increment=500.0,
            start_time=now,
            end_time=now + timedelta(days=2),
            status=AuctionStatus.ACTIVE
        ),
        
        # SHOES
        Product(
            seller_id=shoe_seller.id,
            title="Nike Air Jordan 1 Retro",
            description="Nike Air Jordan 1 Retro High. Size: 10 US. Chicago colorway. Brand new.",
            images=["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"],
            category="Shoes",
            starting_bid=15000.0,
            current_bid=15000.0,
            bid_increment=1000.0,
            start_time=now,
            end_time=now + timedelta(days=4),
            status=AuctionStatus.ACTIVE
        ),
        Product(
            seller_id=shoe_seller.id,
            title="Adidas Yeezy Boost 350",
            description="Adidas Yeezy Boost 350 V2. Size: 9 US. Zebra colorway. Authentic.",
            images=["https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500"],
            category="Shoes",
            starting_bid=20000.0,
            current_bid=20000.0,
            bid_increment=2000.0,
            start_time=now,
            end_time=now + timedelta(days=5),
            status=AuctionStatus.ACTIVE
        ),
        Product(
            seller_id=shoe_seller.id,
            title="Puma Suede Classic",
            description="Puma Suede Classic. Size: 9.5 US. Black color. Vintage style.",
            images=["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500"],
            category="Shoes",
            starting_bid=4000.0,
            current_bid=4000.0,
            bid_increment=300.0,
            start_time=now,
            end_time=now + timedelta(days=2),
            status=AuctionStatus.ACTIVE
        ),
        Product(
            seller_id=shoe_seller.id,
            title="Converse Chuck Taylor All Star",
            description="Converse Chuck Taylor All Star High Top. Size: 10 US. White color. Classic.",
            images=["https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=500"],
            category="Shoes",
            starting_bid=3000.0,
            current_bid=3000.0,
            bid_increment=200.0,
            start_time=now,
            end_time=now + timedelta(days=1),
            status=AuctionStatus.ACTIVE
        ),
        Product(
            seller_id=shoe_seller.id,
            title="New Balance 574 Sneakers",
            description="New Balance 574. Size: 9 US. Gray/Navy. Comfortable running shoes.",
            images=["https://images.unsplash.com/photo-1539185441755-769473a23570?w=500"],
            category="Shoes",
            starting_bid=5000.0,
            current_bid=5000.0,
            bid_increment=400.0,
            start_time=now,
            end_time=now + timedelta(days=3),
            status=AuctionStatus.ACTIVE
        ),
    ]
    
    for product in products:
        db.add(product)
    
    db.commit()
    print(f"✅ Created {len(products)} products")
    print(f"   - 5 Clothes items")
    print(f"   - 5 Watches")
    print(f"   - 5 Shoes")


def main():
    """Main seeding function"""
    print("🌱 Starting database seeding...")
    print("=" * 50)
    
    # Reset database
    reset_database()
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Create users
        users = create_users(db)
        
        # Create inventory
        create_inventory(db, users)
        
        print("\n" + "=" * 50)
        print("✅ Database seeding completed successfully!")
        print("\n📝 Login Credentials:")
        print("\n🛒 BUYERS:")
        print("   Email: buyer1@example.com | Password: password123")
        print("   Email: buyer2@example.com | Password: password123")
        print("   Email: buyer3@example.com | Password: password123")
        print("\n🏪 SELLERS:")
        print("   Email: seller1@example.com | Password: password123")
        print("   Email: seller2@example.com | Password: password123")
        print("   Email: seller3@example.com | Password: password123")
        print("\n" + "=" * 50)
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()