from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.transaction import PaymentStatus


class TransactionBase(BaseModel):
    amount: float
    platform_fee: float


class TransactionCreate(BaseModel):
    product_id: int


class TransactionResponse(TransactionBase):
    id: int
    product_id: int
    buyer_id: int
    seller_id: int
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    status: PaymentStatus
    created_at: datetime
    
    class Config:
        from_attributes = True


class PaymentVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str