import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
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
      // Remove invalid token
      localStorage.removeItem('token');
      
      // Only redirect to login if we're not on public pages
      const currentPath = window.location.pathname;
      const publicPaths = ['/', '/login', '/register'];
      
      if (!publicPaths.includes(currentPath)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// User API methods
export const userAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  getUserById: (userId) => api.get(`/users/user/${userId}`),
  updateProfile: (userData) => api.put('/users/profile', userData),
  searchTeachers: (params) => api.get('/users/teachers', { params }),
  getTeachersBySubject: (subject) => api.get(`/users/teachers/subject/${subject}`),
  getDashboardStats: () => api.get('/users/dashboard-stats'),
  getTeacher: (teacherId) => api.get(`/users/teacher/${teacherId}`),
};

// Subject API methods
export const subjectAPI = {
  getAll: () => api.get('/subjects'),
  create: (subjectData) => api.post('/subjects', subjectData),
  update: (id, subjectData) => api.put(`/subjects/${id}`, subjectData),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// Chat API methods
export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId) => api.get(`/chat/conversation/${conversationId}`),
  sendMessage: (messageData) => api.post('/chat/send', {
    receiverId: messageData.recipientId,
    content: messageData.content,
    messageType: messageData.type || 'text'
  }),
  createConversation: (participantId) => api.post('/chat/conversations', { participantId }),
  markAsRead: (chatId) => api.put(`/chat/mark-read/${chatId}`),
  getUnreadCount: () => api.get('/chat/unread-count'),
};

// WebRTC API methods
export const webrtcAPI = {
  getTurnConfig: () => api.get('/webrtc/turn-config'),
  testXirsys: () => api.get('/webrtc/test-xirsys'),
};

export default api;
