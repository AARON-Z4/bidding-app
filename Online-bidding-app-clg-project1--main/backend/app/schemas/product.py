from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.product import AuctionStatus


class ProductBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    category: Optional[str] = None
    starting_bid: float = Field(..., gt=0)
    bid_increment: float = Field(default=100.0, gt=0)
    end_time: datetime


class ProductCreate(ProductBase):
    images: Optional[List[str]] = []


class ProductUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, min_length=10)
    category: Optional[str] = None
    end_time: Optional[datetime] = None
    status: Optional[AuctionStatus] = None


class ProductResponse(ProductBase):
    id: int
    seller_id: int
    current_bid: float
    images: List[str]
    start_time: datetime
    status: AuctionStatus
    winner_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ProductWithBids(ProductResponse):
    total_bids: int
    seller_name: str
    is_user_leading: Optional[bool] = None