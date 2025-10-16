from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class BidBase(BaseModel):
    amount: float = Field(..., gt=0)


class BidCreate(BidBase):
    product_id: int


class BidResponse(BidBase):
    id: int
    product_id: int
    buyer_id: int
    timestamp: datetime
    buyer_name: Optional[str] = None
    
    class Config:
        from_attributes = True