import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  // Register new user
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },
};

// Playlist Service
export const playlistService = {
  getAll: async () => {
    const response = await api.get('/playlists');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/playlists/${id}`);
    return response.data;
  },

  create: async (name, description, isPublic = false) => {
    const response = await api.post('/playlists', { name, description, isPublic });
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/playlists/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/playlists/${id}`);
    return response.data;
  },

  addSong: async (playlistId, song) => {
    const response = await api.post(`/playlists/${playlistId}/songs`, song);
    return response.data;
  },

  removeSong: async (playlistId, trackId) => {
    const response = await api.delete(`/playlists/${playlistId}/songs/${trackId}`);
    return response.data;
  },

  getShared: async (token) => {
    const response = await axios.get(`${API_URL}/shared/${token}`);
    return response.data;
  },

  searchPublic: async (term = '', limit = 20) => {
    const response = await api.get('/playlists/public/search', { params: { term, limit } });
    return response.data;
  },
};

// Song Service
export const songService = {
  search: async (term, limit = 25) => {
    const response = await api.get('/search', { params: { term, limit } });
    return response.data;
  },

  getTrending: async (limit = 12) => {
    const response = await api.get('/songs/trending', { params: { limit } });
    return response.data;
  },
};

// Favorites Service
export const favoritesService = {
  getAll: async () => {
    const response = await api.get('/favorites');
    return response.data;
  },

  add: async (song) => {
    const response = await api.post('/favorites', song);
    return response.data;
  },

  remove: async (trackId) => {
    const response = await api.delete(`/favorites/${trackId}`);
    return response.data;
  },

  check: async (trackId) => {
    const response = await api.get(`/favorites/check/${trackId}`);
    return response.data;
  },
};

// History Service
export const historyService = {
  getAll: async (limit = 50, offset = 0) => {
    const response = await api.get('/history', { params: { limit, offset } });
    return response.data;
  },

  add: async (song) => {
    const response = await api.post('/history', song);
    return response.data;
  },

  getRecent: async (limit = 10) => {
    const response = await api.get('/history/recent', { params: { limit } });
    return response.data;
  },

  clear: async () => {
    const response = await api.delete('/history');
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/user/dashboard');
    return response.data;
  },
};

export default api;
