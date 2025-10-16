from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import razorpay
import hmac
import hashlib

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.core.config import settings
from app.models.user import User
from app.models.product import Product, AuctionStatus
from app.models.transaction import Transaction, PaymentStatus
from app.schemas.transaction import TransactionCreate, TransactionResponse, PaymentVerification

router = APIRouter()

# Initialize Razorpay client
razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


@router.post("/create-order", response_model=dict)
async def create_payment_order(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a Razorpay order for payment"""
    # Get product
    product = db.query(Product).filter(Product.id == transaction_data.product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if auction is completed
    if product.status != AuctionStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Auction is not completed yet"
        )
    
    # Check if user is the winner
    if product.winner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not the winner of this auction"
        )
    
    # Check if payment already exists
    existing_transaction = (
        db.query(Transaction)
        .filter(
            Transaction.product_id == product.id,
            Transaction.buyer_id == current_user.id,
            Transaction.status == PaymentStatus.COMPLETED
        )
        .first()
    )
    
    if existing_transaction:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment already completed for this product"
        )
    
    # Calculate platform fee (5%)
    amount = product.current_bid
    platform_fee = amount * 0.05
    
    # Create Razorpay order
    try:
        razorpay_order = razorpay_client.order.create({
            "amount": int(amount * 100),  # Amount in paise
            "currency": "INR",
            "payment_capture": 1
        })
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment order: {str(e)}"
        )
    
    # Create transaction record
    transaction = Transaction(
        product_id=product.id,
        buyer_id=current_user.id,
        seller_id=product.seller_id,
        amount=amount,
        platform_fee=platform_fee,
        razorpay_order_id=razorpay_order["id"],
        status=PaymentStatus.PENDING
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    
    return {
        "order_id": razorpay_order["id"],
        "amount": amount,
        "currency": "INR",
        "key_id": settings.RAZORPAY_KEY_ID
    }


@router.post("/verify-payment", response_model=TransactionResponse)
async def verify_payment(
    payment_data: PaymentVerification,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Verify Razorpay payment signature"""
    # Get transaction
    transaction = (
        db.query(Transaction)
        .filter(Transaction.razorpay_order_id == payment_data.razorpay_order_id)
        .first()
    )
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Verify signature
    generated_signature = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        f"{payment_data.razorpay_order_id}|{payment_data.razorpay_payment_id}".encode(),
        hashlib.sha256
    ).hexdigest()
    
    if generated_signature != payment_data.razorpay_signature:
        transaction.status = PaymentStatus.FAILED
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment signature"
        )
    
    # Update transaction
    transaction.razorpay_payment_id = payment_data.razorpay_payment_id
    transaction.razorpay_signature = payment_data.razorpay_signature
    transaction.status = PaymentStatus.COMPLETED
    
    db.commit()
    db.refresh(transaction)
    
    return transaction


@router.get("/my-transactions", response_model=list[TransactionResponse])
async def get_my_transactions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all transactions for current user (as buyer or seller)"""
    transactions = (
        db.query(Transaction)
        .filter(
            (Transaction.buyer_id == current_user.id) | 
            (Transaction.seller_id == current_user.id)
        )
        .order_by(Transaction.created_at.desc())
        .all()
    )
    
    return transactions


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific transaction"""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Check if user is buyer or seller
    if transaction.buyer_id != current_user.id and transaction.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this transaction"
        )
    
    return transaction