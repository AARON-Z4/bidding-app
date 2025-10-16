from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_active_user, require_role
from app.models.user import User, UserRole
from app.models.product import Product, AuctionStatus
from app.models.bid import Bid
from app.models.transaction import Transaction
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductWithBids
from app.services.websocket_manager import manager

router = APIRouter()


@router.get("/", response_model=List[ProductResponse])
async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[AuctionStatus] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all products with optional filters"""
    query = db.query(Product)
    
    # Apply filters
    if status:
        query = query.filter(Product.status == status)
    else:
        # By default, show only active auctions
        query = query.filter(Product.status == AuctionStatus.ACTIVE)
    
    if category:
        query = query.filter(Product.category == category)
    
    if search:
        query = query.filter(
            or_(
                Product.title.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%")
            )
        )
    
    # Order by end_time (ending soon first)
    query = query.order_by(Product.end_time.asc())
    
    products = query.offset(skip).limit(limit).all()
    return products


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product by ID"""
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return product


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(require_role([UserRole.SELLER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Create a new product (Seller only)"""
    # Validate end_time is in the future
    if product_data.end_time <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be in the future"
        )
    
    # Create new product
    new_product = Product(
        seller_id=current_user.id,
        title=product_data.title,
        description=product_data.description,
        images=product_data.images or [],
        category=product_data.category,
        starting_bid=product_data.starting_bid,
        current_bid=product_data.starting_bid,
        bid_increment=product_data.bid_increment,
        end_time=product_data.end_time,
        status=AuctionStatus.ACTIVE
    )
    
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    
    return new_product


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a product (Owner or Admin only)"""
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check ownership or admin
    if product.seller_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this product"
        )
    
    # Update fields
    update_data = product_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a product (Owner or Admin only)"""
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check ownership or admin
    if product.seller_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this product"
        )
    
    # Check if there are bids
    bids_count = db.query(Bid).filter(Bid.product_id == product_id).count()
    if bids_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete product with existing bids"
        )
    
    db.delete(product)
    db.commit()
    
    return None


@router.get("/seller/my-products", response_model=List[ProductResponse])
async def get_my_products(
    current_user: User = Depends(require_role([UserRole.SELLER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Get all products created by current seller"""
    products = db.query(Product).filter(Product.seller_id == current_user.id).all()
    return products


@router.get("/categories/list", response_model=List[str])
async def get_categories(db: Session = Depends(get_db)):
    """Get all unique categories"""
    categories = db.query(Product.category).distinct().filter(Product.category.isnot(None)).all()
    return [cat[0] for cat in categories if cat[0]]


@router.post("/{product_id}/accept-bid/{bid_id}")
async def accept_bid_and_sell(
    product_id: int,
    bid_id: int,
    current_user: User = Depends(require_role([UserRole.SELLER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Seller accepts a bid and completes the sale"""
    # Get product
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check ownership
    if product.seller_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to sell this product"
        )
    
    # Check if product is still active
    if product.status != AuctionStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is not active"
        )
    
    # Get the bid
    bid = db.query(Bid).filter(Bid.id == bid_id, Bid.product_id == product_id).first()
    
    if not bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )
    
    # Get buyer
    buyer = db.query(User).filter(User.id == bid.buyer_id).first()
    
    if not buyer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Buyer not found"
        )
    
    # Update product status
    product.status = AuctionStatus.COMPLETED
    product.winner_id = bid.buyer_id
    
    # Create transaction
    transaction = Transaction(
        product_id=product.id,
        buyer_id=bid.buyer_id,
        seller_id=current_user.id,
        amount=bid.amount,
        status="completed"
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    
    # Send real-time notifications
    # Notify buyer
    await manager.notify_buyer(bid.buyer_id, {
        "message": f"Congratulations! Your bid of ₹{bid.amount} for {product.title} has been accepted!",
        "product_id": product.id,
        "product_title": product.title,
        "amount": bid.amount,
        "seller_name": current_user.name,
        "transaction_id": transaction.id
    })
    
    # Broadcast to all watchers
    await manager.broadcast_product_sold(product.id, {
        "product_id": product.id,
        "product_title": product.title,
        "final_amount": bid.amount,
        "winner_name": buyer.name,
        "seller_name": current_user.name
    })
    
    return {
        "message": "Product sold successfully",
        "transaction_id": transaction.id,
        "buyer_name": buyer.name,
        "amount": bid.amount
    }


@router.get("/seller/products-with-bids", response_model=List[dict])
async def get_seller_products_with_bids(
    current_user: User = Depends(require_role([UserRole.SELLER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Get all seller's products with their bids"""
    products = db.query(Product).filter(
        Product.seller_id == current_user.id,
        Product.status == AuctionStatus.ACTIVE
    ).all()
    
    result = []
    for product in products:
        # Get all bids for this product
        bids = db.query(Bid).filter(Bid.product_id == product.id).order_by(Bid.amount.desc()).all()
        
        # Get highest bid
        highest_bid = bids[0] if bids else None
        
        bid_list = []
        for bid in bids:
            buyer = db.query(User).filter(User.id == bid.buyer_id).first()
            bid_list.append({
                "bid_id": bid.id,
                "amount": bid.amount,
                "buyer_name": buyer.name if buyer else "Unknown",
                "buyer_email": buyer.email if buyer else "Unknown",
                "timestamp": bid.timestamp
            })
        
        result.append({
            "product_id": product.id,
            "title": product.title,
            "description": product.description,
            "images": product.images,
            "category": product.category,
            "starting_bid": product.starting_bid,
            "current_bid": product.current_bid,
            "end_time": product.end_time,
            "status": product.status,
            "bids_count": len(bids),
            "highest_bid": highest_bid.amount if highest_bid else None,
            "bids": bid_list
        })
    
    return result