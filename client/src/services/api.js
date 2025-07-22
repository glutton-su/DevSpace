import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authService = {
  login: async (credentials) => {
    const response = await authAPI.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await authAPI.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await authAPI.post('/auth/logout');
    return response.data;
  },

  refreshToken: async () => {
    const response = await authAPI.post('/auth/refresh');
    return response.data;
  }
};

// Projects API
export const projectAPI = {
  getAllProjects: async () => {
    const response = await authAPI.get('/projects/');
    return response.data;
  },

  getProjects: async (params = {}) => {
    const response = await authAPI.get('/projects/', { params });
    return response.data;
  },

  getProject: async (id) => {
    const response = await authAPI.get(`/projects/${id}`);
    return response.data;
  },

  createProject: async (projectData) => {
    const response = await authAPI.post('/projects', projectData);
    return response.data;
  },

  updateProject: async (id, updates) => {
    const response = await authAPI.put(`/projects/${id}`, updates);
    return response.data;
  },

  deleteProject: async (id) => {
    const response = await authAPI.delete(`/projects/${id}`);
    return response.data;
  },

  starProject: async (id) => {
    const response = await authAPI.post(`/projects/${id}/star`);
    return response.data;
  },

  forkProject: async (id) => {
    const response = await authAPI.post(`/projects/${id}/fork`);
    return response.data;
  }
};

// Code Snippets API
export const snippetAPI = {
  getSnippets: async (params = {}) => {
    const response = await authAPI.get('/code', { params });
    return response.data;
  },

  getSnippet: async (id) => {
    const response = await authAPI.get(`/code/${id}`);
    return response.data;
  },

  createSnippet: async (snippetData) => {
    const response = await authAPI.post('/code', snippetData);
    return response.data;
  },

  updateSnippet: async (id, updates) => {
    const response = await authAPI.put(`/code/${id}`, updates);
    return response.data;
  },

  deleteSnippet: async (id) => {
    const response = await authAPI.delete(`/code/${id}`);
    return response.data;
  },

  toggleLike: async (id) => {
    const response = await authAPI.post(`/code/${id}/like`);
    return response.data;
  },

  toggleStar: async (id) => {
    const response = await authAPI.post(`/code/${id}/star`);
    return response.data;
  },

  forkSnippet: async (id) => {
    const response = await authAPI.post(`/code/${id}/fork`);
    return response.data;
  },

  getLanguageStats: async (projectId) => {
    const response = await authAPI.get(`/code/project/${projectId}/languages`);
    return response.data;
  },

  getCollaborativeSnippets: async (params = {}) => {
    const response = await authAPI.get('/code/collaborative', { params });
    return response.data;
  },

  // User-specific snippet collections
  getUserOwnedSnippets: async (params = {}) => {
    const response = await authAPI.get('/code/user/owned', { params });
    return response.data;
  },

  getUserStarredSnippets: async (params = {}) => {
    const response = await authAPI.get('/code/user/starred', { params });
    return response.data;
  },

  getUserForkedSnippets: async (params = {}) => {
    const response = await authAPI.get('/code/user/forked', { params });
    return response.data;
  },

  // Public snippets
  getPublicSnippets: async (params = {}) => {
    const response = await authAPI.get('/code/public/all', { params });
    return response.data;
  }
};

// Users API
export const userAPI = {
  getUserProfile: async (username) => {
    const response = await authAPI.get(`/users/${username}`);
    return response.data;
  },

  getUserProjects: async (username) => {
    const response = await authAPI.get(`/users/${username}/projects`);
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await authAPI.get('/users/search', { params: { q: query } });
    return response.data;
  },

  followUser: async (username) => {
    const response = await authAPI.post(`/users/${username}/follow`);
    return response.data;
  },

  updateUserStats: async () => {
    const response = await authAPI.post('/users/stats/update');
    return response.data;
  }
};

// Notifications API
export const notificationAPI = {
  getNotifications: async () => {
    const response = await authAPI.get('/notifications');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await authAPI.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await authAPI.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await authAPI.put('/notifications/mark-all-read');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await authAPI.delete(`/notifications/${id}`);
    return response.data;
  }
};

// Files API
export const fileAPI = {
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await authAPI.post('/files/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  uploadCodeFiles: async (files, projectId) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (projectId) formData.append('projectId', projectId);
    const response = await authAPI.post('/files/code', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  uploadProjectAssets: async (files, projectId) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('projectId', projectId);
    const response = await authAPI.post('/files/assets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getFile: async (id) => {
    const response = await authAPI.get(`/files/${id}`);
    return response.data;
  },

  downloadFile: async (id) => {
    const response = await authAPI.get(`/files/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  getProjectFiles: async (projectId) => {
    const response = await authAPI.get(`/files/project/${projectId}`);
    return response.data;
  },

  deleteFile: async (id) => {
    const response = await authAPI.delete(`/files/${id}`);
    return response.data;
  }
};

// Collaboration API (for future implementation)
export const collaborationAPI = {
  getRooms: async () => {
    // This would connect to your WebSocket/collaboration endpoints
    // For now, returning empty array until backend collaboration is implemented
    return { data: [] };
  },

  createRoom: async (roomData) => {
    // Placeholder for collaboration room creation
    return { data: { id: Date.now(), ...roomData } };
  },

  joinRoom: async (roomId) => {
    // Placeholder for joining collaboration room
    return { data: { success: true } };
  },

  leaveRoom: async (roomId) => {
    // Placeholder for leaving collaboration room
    return { data: { success: true } };
  }
};

export const tagAPI = {
  getAllTags: async () => {
    const response = await authAPI.get('/tag');
    return response.data;
  },
};

export default authAPI;