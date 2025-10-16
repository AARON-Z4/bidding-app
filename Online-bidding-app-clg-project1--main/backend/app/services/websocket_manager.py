from typing import Dict, List, Optional
from fastapi import WebSocket
import json
from datetime import datetime


class ConnectionManager:
    def __init__(self):
        # Store active connections: {product_id: [websockets]}
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # Store user-specific connections: {user_id: websocket}
        self.user_connections: Dict[int, WebSocket] = {}
        # Store websocket to user mapping
        self.websocket_to_user: Dict[WebSocket, int] = {}
    
    async def connect(self, websocket: WebSocket, product_id: int, user_id: Optional[int] = None):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        
        if product_id not in self.active_connections:
            self.active_connections[product_id] = []
        
        self.active_connections[product_id].append(websocket)
        
        # Store user-specific connection if user_id provided
        if user_id:
            self.user_connections[user_id] = websocket
            self.websocket_to_user[websocket] = user_id
        
        print(f"Client connected to product {product_id}. Total connections: {len(self.active_connections[product_id])}")
    
    def disconnect(self, websocket: WebSocket, product_id: int):
        """Remove a WebSocket connection"""
        if product_id in self.active_connections:
            if websocket in self.active_connections[product_id]:
                self.active_connections[product_id].remove(websocket)
                print(f"Client disconnected from product {product_id}. Remaining: {len(self.active_connections[product_id])}")
            
            # Clean up empty product rooms
            if len(self.active_connections[product_id]) == 0:
                del self.active_connections[product_id]
        
        # Clean up user connections
        if websocket in self.websocket_to_user:
            user_id = self.websocket_to_user[websocket]
            if user_id in self.user_connections:
                del self.user_connections[user_id]
            del self.websocket_to_user[websocket]
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send a message to a specific client"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"Error sending personal message: {e}")
    
    async def broadcast_to_product(self, message: dict, product_id: int):
        """Broadcast a message to all clients watching a specific product"""
        if product_id not in self.active_connections:
            return
        
        disconnected = []
        for connection in self.active_connections[product_id]:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error broadcasting to client: {e}")
                disconnected.append(connection)
        
        # Remove disconnected clients
        for connection in disconnected:
            self.disconnect(connection, product_id)
    
    async def broadcast_new_bid(self, product_id: int, bid_data: dict):
        """Broadcast a new bid to all watchers"""
        message = {
            "type": "new_bid",
            "product_id": product_id,
            "data": bid_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast_to_product(message, product_id)
    
    async def broadcast_auction_ended(self, product_id: int, winner_data: dict):
        """Broadcast auction end notification"""
        message = {
            "type": "auction_ended",
            "product_id": product_id,
            "data": winner_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast_to_product(message, product_id)
    
    async def send_to_user(self, user_id: int, message: dict):
        """Send a message to a specific user"""
        if user_id in self.user_connections:
            try:
                await self.user_connections[user_id].send_json(message)
            except Exception as e:
                print(f"Error sending message to user {user_id}: {e}")
    
    async def notify_seller(self, seller_id: int, notification_data: dict):
        """Send notification to seller about new bid"""
        message = {
            "type": "seller_notification",
            "data": notification_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_to_user(seller_id, message)
    
    async def notify_buyer(self, buyer_id: int, notification_data: dict):
        """Send notification to buyer about bid status"""
        message = {
            "type": "buyer_notification",
            "data": notification_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_to_user(buyer_id, message)
    
    async def broadcast_product_sold(self, product_id: int, sale_data: dict):
        """Broadcast when seller accepts a bid and sells the product"""
        message = {
            "type": "product_sold",
            "product_id": product_id,
            "data": sale_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast_to_product(message, product_id)
    
    def get_active_connections_count(self, product_id: int) -> int:
        """Get number of active connections for a product"""
        return len(self.active_connections.get(product_id, []))


# Global instance
manager = ConnectionManager()