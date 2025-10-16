from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uvicorn

from app.core.config import settings
from app.core.database import init_db, get_db
from app.api import api_router
from app.services.websocket_manager import manager
from app.models.product import Product
from app.models.bid import Bid
from app.models.user import User

# Create FastAPI app
app = FastAPI(
    title="NextGen Marketplace API",
    description="Full-stack auction platform with real-time bidding",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup"""
    print("Initializing database...")
    init_db()
    print("Database initialized successfully!")


# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "NextGen Marketplace API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# Include API routes
app.include_router(api_router, prefix="/api")


# WebSocket endpoint for user notifications (dashboards)
@app.websocket("/ws")
async def websocket_user_endpoint(
    websocket: WebSocket,
    token: str = Query(None)
):
    """WebSocket endpoint for user-specific notifications (buyer/seller dashboards)"""
    from app.core.security import verify_token
    
    # Verify token and get user
    if not token:
        await websocket.close(code=1008, reason="Token required")
        return
    
    try:
        payload = verify_token(token)
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=1008, reason="Invalid token")
            return
        
        user_id = int(user_id)
    except Exception as e:
        print(f"Token verification failed: {e}")
        await websocket.close(code=1008, reason="Invalid token")
        return
    
    # Accept connection
    await websocket.accept()
    
    # Store user connection
    manager.user_connections[user_id] = websocket
    manager.websocket_to_user[websocket] = user_id
    
    print(f"✅ User {user_id} connected to WebSocket")
    
    try:
        # Send connection success message
        await websocket.send_json({
            "type": "connected",
            "message": "Connected to real-time notifications",
            "user_id": user_id
        })
        
        # Keep connection alive and listen for messages
        while True:
            data = await websocket.receive_json()
            
            # Handle ping/pong for keep-alive
            if data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        # Clean up user connection
        if user_id in manager.user_connections:
            del manager.user_connections[user_id]
        if websocket in manager.websocket_to_user:
            del manager.websocket_to_user[websocket]
        print(f"🔌 User {user_id} disconnected from WebSocket")
    
    except Exception as e:
        print(f"❌ WebSocket error for user {user_id}: {e}")
        # Clean up user connection
        if user_id in manager.user_connections:
            del manager.user_connections[user_id]
        if websocket in manager.websocket_to_user:
            del manager.websocket_to_user[websocket]


# WebSocket endpoint for real-time bidding
@app.websocket("/ws/auction/{product_id}")
async def websocket_auction_endpoint(
    websocket: WebSocket,
    product_id: int,
    token: str = Query(None),
    db: Session = Depends(get_db)
):
    """WebSocket endpoint for real-time auction updates"""
    await manager.connect(websocket, product_id)
    
    try:
        # Send initial connection success message
        await manager.send_personal_message({
            "type": "connected",
            "message": f"Connected to auction {product_id}",
            "active_viewers": manager.get_active_connections_count(product_id)
        }, websocket)
        
        # Listen for messages
        while True:
            data = await websocket.receive_json()
            
            # Handle different message types
            if data.get("type") == "ping":
                await manager.send_personal_message({"type": "pong"}, websocket)
            
            elif data.get("type") == "place_bid":
                # Broadcast new bid to all watchers
                bid_amount = data.get("amount")
                buyer_name = data.get("buyer_name", "Anonymous")
                
                await manager.broadcast_new_bid(product_id, {
                    "amount": bid_amount,
                    "buyer_name": buyer_name,
                    "product_id": product_id
                })
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, product_id)
        print(f"Client disconnected from auction {product_id}")
    
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, product_id)


# Run the application
if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )