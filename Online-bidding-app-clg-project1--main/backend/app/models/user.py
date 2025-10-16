from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class UserRole(str, enum.Enum):
    BUYER = "buyer"
    SELLER = "seller"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.BUYER)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    products = relationship("Product", back_populates="seller", foreign_keys="Product.seller_id")
    bids = relationship("Bid", back_populates="buyer")
    transactions_as_buyer = relationship(
        "Transaction", 
        back_populates="buyer", 
        foreign_keys="Transaction.buyer_id"
    )
    transactions_as_seller = relationship(
        "Transaction", 
        back_populates="seller", 
        foreign_keys="Transaction.seller_id"
    )