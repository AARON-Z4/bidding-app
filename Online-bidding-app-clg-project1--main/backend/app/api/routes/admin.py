from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.core.database import get_db
from app.core.security import require_role
from app.models.user import User, UserRole
from app.models.product import Product, AuctionStatus
from app.models.bid import Bid
from app.models.transaction import Transaction, PaymentStatus
from app.schemas.user import UserResponse

router = APIRouter()


@router.get("/stats", response_model=dict)
async def get_admin_stats(
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Get platform statistics (Admin only)"""
    # User stats
    total_users = db.query(User).count()
    total_buyers = db.query(User).filter(User.role == UserRole.BUYER).count()
    total_sellers = db.query(User).filter(User.role == UserRole.SELLER).count()
    
    # Product stats
    total_products = db.query(Product).count()
    active_auctions = db.query(Product).filter(Product.status == AuctionStatus.ACTIVE).count()
    completed_auctions = db.query(Product).filter(Product.status == AuctionStatus.COMPLETED).count()
    
    # Transaction stats
    total_revenue = db.query(func.sum(Transaction.amount)).filter(
        Transaction.status == PaymentStatus.COMPLETED
    ).scalar() or 0
    
    platform_fees = db.query(func.sum(Transaction.platform_fee)).filter(
        Transaction.status == PaymentStatus.COMPLETED
    ).scalar() or 0
    
    return {
        "total_users": total_users,
        "total_buyers": total_buyers,
        "total_sellers": total_sellers,
        "total_products": total_products,
        "active_auctions": active_auctions,
        "completed_auctions": completed_auctions,
        "total_revenue": total_revenue,
        "platform_fees": platform_fees
    }


@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    role: UserRole = None,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Get all users (Admin only)"""
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    
    users = query.offset(skip).limit(limit).all()
    return users


@router.put("/users/{user_id}/toggle-active", response_model=UserResponse)
async def toggle_user_active(
    user_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Toggle user active status (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from deactivating themselves
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Delete a user (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from deleting themselves
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    db.delete(user)
    db.commit()
    
    return None


@router.get("/products", response_model=List[dict])
async def get_all_products_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: AuctionStatus = None,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Get all products with seller info (Admin only)"""
    query = db.query(Product)
    
    if status:
        query = query.filter(Product.status == status)
    
    products = query.offset(skip).limit(limit).all()
    
    result = []
    for product in products:
        seller = db.query(User).filter(User.id == product.seller_id).first()
        result.append({
            "id": product.id,
            "title": product.title,
            "seller_id": product.seller_id,
            "seller_name": seller.name if seller else "Unknown",
            "current_bid": product.current_bid,
            "status": product.status,
            "created_at": product.created_at
        })
    
    return result


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product_admin(
    product_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Delete any product (Admin only)"""
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    db.delete(product)
    db.commit()
    
    return None