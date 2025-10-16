from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_active_user, require_role
from app.models.user import User, UserRole
from app.models.product import Product, AuctionStatus
from app.models.bid import Bid
from app.schemas.bid import BidCreate, BidResponse
from app.services.websocket_manager import manager

router = APIRouter()


@router.post("/", response_model=BidResponse, status_code=status.HTTP_201_CREATED)
async def place_bid(
    bid_data: BidCreate,
    current_user: User = Depends(require_role([UserRole.BUYER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Place a bid on a product"""
    # Get product
    product = db.query(Product).filter(Product.id == bid_data.product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if auction is active
    if product.status != AuctionStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Auction is not active"
        )
    
    # Check if auction has ended
    if product.end_time <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Auction has ended"
        )
    
    # Check if user is the seller
    if product.seller_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sellers cannot bid on their own products"
        )
    
    # Validate bid amount
    minimum_bid = product.current_bid + product.bid_increment
    if bid_data.amount < minimum_bid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bid must be at least ₹{minimum_bid}"
        )
    
    # Create new bid
    new_bid = Bid(
        product_id=bid_data.product_id,
        buyer_id=current_user.id,
        amount=bid_data.amount
    )
    
    # Update product current bid
    product.current_bid = bid_data.amount
    
    db.add(new_bid)
    db.commit()
    db.refresh(new_bid)
    
    # Send real-time notifications
    # Notify seller about new bid
    await manager.notify_seller(product.seller_id, {
        "message": f"New bid of ₹{bid_data.amount} on {product.title}",
        "product_id": product.id,
        "product_title": product.title,
        "bid_amount": bid_data.amount,
        "buyer_name": current_user.name,
        "buyer_id": current_user.id
    })
    
    # Broadcast to all watchers
    await manager.broadcast_new_bid(product.id, {
        "amount": bid_data.amount,
        "buyer_name": current_user.name,
        "product_id": product.id,
        "bid_id": new_bid.id
    })
    
    return new_bid


@router.get("/product/{product_id}", response_model=List[BidResponse])
async def get_product_bids(
    product_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all bids for a specific product"""
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Get bids ordered by timestamp (newest first)
    bids = (
        db.query(Bid)
        .filter(Bid.product_id == product_id)
        .order_by(Bid.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    # Add buyer name to each bid
    for bid in bids:
        buyer = db.query(User).filter(User.id == bid.buyer_id).first()
        bid.buyer_name = buyer.name if buyer else "Unknown"
    
    return bids


@router.get("/my-bids", response_model=List[BidResponse])
async def get_my_bids(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all bids placed by current user"""
    bids = (
        db.query(Bid)
        .filter(Bid.buyer_id == current_user.id)
        .order_by(Bid.timestamp.desc())
        .all()
    )
    
    return bids


@router.get("/my-active-bids", response_model=List[dict])
async def get_my_active_bids(
    current_user: User = Depends(require_role([UserRole.BUYER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Get all active bids by current user with product details"""
    # Get all bids by user on active products
    bids = (
        db.query(Bid)
        .join(Product)
        .filter(
            Bid.buyer_id == current_user.id,
            Product.status == AuctionStatus.ACTIVE,
            Product.end_time > datetime.utcnow()
        )
        .order_by(Bid.timestamp.desc())
        .all()
    )
    
    result = []
    for bid in bids:
        product = bid.product
        
        # Check if user is leading
        highest_bid = (
            db.query(Bid)
            .filter(Bid.product_id == product.id)
            .order_by(Bid.amount.desc())
            .first()
        )
        
        is_leading = highest_bid and highest_bid.buyer_id == current_user.id
        
        result.append({
            "bid_id": bid.id,
            "product_id": product.id,
            "product_title": product.title,
            "product_image": product.images[0] if product.images else None,
            "my_bid": bid.amount,
            "current_bid": product.current_bid,
            "is_leading": is_leading,
            "end_time": product.end_time,
            "timestamp": bid.timestamp
        })
    
    return result