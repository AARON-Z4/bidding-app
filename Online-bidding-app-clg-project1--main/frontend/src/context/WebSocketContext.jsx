import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { WS_BASE_URL, STORAGE_KEYS } from '../config/constants';

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentAuction, setCurrentAuction] = useState(null);
  const [latestBid, setLatestBid] = useState(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  // Connect to WebSocket
  const connect = () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      console.warn('No token found, skipping WebSocket connection');
      return;
    }

    try {
      const ws = new WebSocket(`${WS_BASE_URL}?token=${token}`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        setSocket(null);

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`Reconnecting in ${delay}ms... (Attempt ${reconnectAttemptsRef.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      setSocket(ws);
    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
    }
  };

  // Disconnect from WebSocket
  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (socket) {
      socket.close();
      setSocket(null);
      setConnected(false);
    }
  };

  // Handle incoming messages
  const handleMessage = (data) => {
    switch (data.type) {
      case 'bid-update':
        setLatestBid(data.payload);
        break;
      case 'auction-ended':
        console.log('Auction ended:', data.payload);
        break;
      case 'outbid':
        console.log('You were outbid:', data.payload);
        break;
      case 'bid-error':
        console.error('Bid error:', data.payload);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  };

  // Join auction room
  const joinAuction = (auctionId) => {
    if (socket && connected) {
      socket.send(JSON.stringify({
        type: 'join-auction',
        payload: { auctionId },
      }));
      setCurrentAuction(auctionId);
    }
  };

  // Leave auction room
  const leaveAuction = () => {
    if (socket && connected && currentAuction) {
      socket.send(JSON.stringify({
        type: 'leave-auction',
        payload: { auctionId: currentAuction },
      }));
      setCurrentAuction(null);
    }
  };

  // Place bid via WebSocket
  const placeBid = (auctionId, amount) => {
    if (socket && connected) {
      socket.send(JSON.stringify({
        type: 'place-bid',
        payload: { auctionId, amount },
      }));
    }
  };

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  const value = {
    socket,
    connected,
    currentAuction,
    latestBid,
    connect,
    disconnect,
    joinAuction,
    leaveAuction,
    placeBid,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

export default WebSocketContext;