// WebSocket Manager for Real-time Communication
class WebSocketManager {
  constructor() {
    this.ws = null
    this.listeners = {}
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
    this.token = null
  }

  connect(token = null) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected')
      return
    }

    // Get token from localStorage if not provided
    this.token = token || localStorage.getItem('token')
    
    if (!this.token) {
      console.error('No authentication token available for WebSocket connection')
      return
    }

    try {
      // Connect to WebSocket server with token
      const wsUrl = `ws://localhost:8000/ws?token=${this.token}`
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected')
        this.reconnectAttempts = 0
        this.emit('connected', {})
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('📨 WebSocket message received:', data)
          
          // Emit event to all registered listeners
          if (data.type) {
            this.emit(data.type, data.data || data)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        this.emit('error', error)
      }

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected')
        this.emit('disconnected', {})
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
          setTimeout(() => this.connect(this.token), this.reconnectDelay)
        }
      }
    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(type, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, data })
      this.ws.send(message)
      console.log('📤 WebSocket message sent:', { type, data })
    } else {
      console.error('WebSocket is not connected')
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  off(event, callback = null) {
    if (!this.listeners[event]) return
    
    if (callback) {
      // Remove specific callback
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
    } else {
      // Remove all callbacks for this event
      delete this.listeners[event]
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${event}:`, error)
        }
      })
    }
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN
  }
}

// Create singleton instance
export const wsManager = new WebSocketManager()

// Export class for testing
export default WebSocketManager