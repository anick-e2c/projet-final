import { io, Socket } from 'socket.io-client';

// Helper function to get the correct backend URL
function getBackendUrl(): string {
  const currentUrl = window.location.href;
  
  // Check if we're in a webcontainer environment
  if (currentUrl.includes('webcontainer-api.io') || currentUrl.includes('stackblitz.io')) {
    // Extract the base URL and replace the port
    const url = new URL(currentUrl);
    const hostname = url.hostname;
    const protocol = url.protocol;
    
    // Replace the frontend port (5173) with backend port (3001)
    const backendHostname = hostname.replace(/--5173--/, '--3001--');
    return `${protocol}//${backendHostname}`;
  }
  
  // Default to localhost for local development
  return 'http://localhost:3001';
}

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    this.token = token;
    
    const socketUrl = import.meta.env.VITE_WS_URL || getBackendUrl();
    
    this.socket = io(socketUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('✅ Connecté au serveur Socket.IO');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Déconnecté du serveur Socket.IO');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion Socket.IO:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Room methods
  joinRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('join-room', roomId);
    }
  }

  leaveRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('leave-room', roomId);
    }
  }

  // Message methods
  sendMessage(data: { content: string; roomId: string; messageType?: string }) {
    if (this.socket) {
      this.socket.emit('send-message', data);
    }
  }

  // Typing indicators
  startTyping(roomId: string) {
    if (this.socket) {
      this.socket.emit('typing-start', { roomId });
    }
  }

  stopTyping(roomId: string) {
    if (this.socket) {
      this.socket.emit('typing-stop', { roomId });
    }
  }

  // Message reactions
  addReaction(messageId: string, reaction: string) {
    if (this.socket) {
      this.socket.emit('message-reaction', { messageId, reaction });
    }
  }

  // Event listeners
  onNewMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  onUserJoined(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user-joined', callback);
    }
  }

  onUserLeft(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user-left', callback);
    }
  }

  onUserTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  onUserStopTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user-stop-typing', callback);
    }
  }

  onUserOffline(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user-offline', callback);
    }
  }

  onMessageReaction(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('message-reaction', callback);
    }
  }

  onError(callback: (error: any) => void) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  // Remove event listeners
  off(event: string, callback?: any) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export const socketService = new SocketService();
export default socketService;