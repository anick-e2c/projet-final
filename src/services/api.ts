import axios from 'axios';

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

const API_BASE_URL = import.meta.env.VITE_API_URL || `${getBackendUrl()}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: { username: string; email: string; password: string }) =>
    api.post('/auth/register', userData),
  
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  logout: () => api.post('/auth/logout'),
  
  getMe: () => api.get('/auth/me'),
};

// Rooms API
export const roomsAPI = {
  getAllRooms: () => api.get('/rooms'),
  
  getMyRooms: () => api.get('/rooms/my-rooms'),
  
  createRoom: (roomData: { 
    name: string; 
    description?: string; 
    isPrivate?: boolean; 
    maxMembers?: number 
  }) => api.post('/rooms', roomData),
  
  joinRoom: (roomId: string) => api.post(`/rooms/${roomId}/join`),
  
  leaveRoom: (roomId: string) => api.post(`/rooms/${roomId}/leave`),
  
  getRoomDetails: (roomId: string) => api.get(`/rooms/${roomId}`),
};

// Messages API
export const messagesAPI = {
  getRoomMessages: (roomId: string, page = 1, limit = 50) =>
    api.get(`/messages/room/${roomId}?page=${page}&limit=${limit}`),
  
  sendMessage: (messageData: { 
    content: string; 
    roomId: string; 
    messageType?: string 
  }) => api.post('/messages', messageData),
  
  editMessage: (messageId: string, content: string) =>
    api.put(`/messages/${messageId}`, { content }),
  
  deleteMessage: (messageId: string) => api.delete(`/messages/${messageId}`),
};

export default api;