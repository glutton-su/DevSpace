
import axios from 'axios';

// Update this to your backend URL
const API_BASE = 'http://localhost:3000/api'; // Change this to your backend URL

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  console.log('Making API request to:', config.baseURL + config.url);
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error.response?.status, error.message);
    
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE}/auth/refresh`, {
            refreshToken,
          });
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          // Retry the original request
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return api.request(error.config);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Refresh failed, logout user
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response received:', response.data);
      
      return {
        user: {
          id: response.data.user.id,
          username: response.data.user.username,
          email: response.data.user.email,
          avatar: response.data.user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.data.user.username}`,
          role: response.data.user.role || 'user',
          themePreference: response.data.user.themePreference || 'light'
        },
        tokens: {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken
        }
      };
    } catch (error) {
      console.error('Login API error:', error);
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to server. Please check if your backend is running.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid credentials');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error('Network error. Please check your connection.');
      }
    }
  },

  register: async (username, email, password, fullName) => {
    try {
      console.log('Attempting registration for:', email);
      const response = await api.post('/auth/register', { 
        username, 
        email, 
        password,
        fullName 
      });
      
      console.log('Registration response received:', response.data);
      
      return {
        user: {
          id: response.data.user.id,
          username: response.data.user.username,
          email: response.data.user.email,
          avatar: response.data.user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.data.user.username}`,
          role: response.data.user.role || 'user',
          themePreference: response.data.user.themePreference || 'light'
        },
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        message: response.data.message
      };
    } catch (error) {
      console.error('Registration API error:', error);
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to server. Please check if your backend is running.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Registration failed');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error('Network error. Please check your connection.');
      }
    }
  },

  resetPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return { message: response.data.message };
    } catch (error) {
      console.error('Reset password API error:', error);
      throw new Error('Failed to send reset password email');
    }
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch (error) {
        console.error('Logout API error:', error);
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

// Projects API - Keep existing mock data for now
export const projectsAPI = {
  getProjects: async (params) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      projects: mockProjects,
      totalCount: mockProjects.length,
      page: params?.page || 1,
      pageSize: params?.pageSize || 10
    };
  },

  getProject: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockProjects.find(p => p.id === id) || null;
  },

  starProject: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return { starred: true };
  },

  forkProject: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return { forked: true };
  }
};

// Mock data
const mockProjects = [
  {
    id: '1',
    name: 'React Todo App',
    description: 'A modern todo application built with React and TypeScript',
    language: 'JavaScript',
    tags: ['React', 'TypeScript', 'Frontend'],
    stars: 24,
    forks: 8,
    owner: {
      username: 'demouser',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo'
    },
    isStarred: true,
    updatedAt: '2024-01-15T10:30:00Z',
    snippets: [
      {
        id: '1',
        name: 'App.jsx',
        language: 'typescript',
        content: `import React, { useState } from 'react';
import './App.css';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: inputValue,
        completed: false
      }]);
      setInputValue('');
    }
  };

  return (
    <div className="App">
      <h1>Todo App</h1>
      <div>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;`
      },
      {
        id: '2',
        name: 'README.md',
        language: 'markdown',
        content: `# React Todo App

A simple and elegant todo application built with React and TypeScript.

## Features

- Add new todos
- Mark todos as complete
- Delete todos
- Filter by status
- Persistent storage

## Installation

\`\`\`bash
npm install
npm start
\`\`\`

## Technologies Used

- React 18
- TypeScript
- CSS Modules
- Local Storage API

## Contributing

Feel free to submit issues and enhancement requests!`
      }
    ]
  },
  {
    id: '2',
    name: 'Python Web Scraper',
    description: 'Efficient web scraping tool with async support',
    language: 'Python',
    tags: ['Python', 'Scraping', 'AsyncIO'],
    stars: 42,
    forks: 15,
    owner: {
      username: 'pydev',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pydev'
    },
    isStarred: false,
    updatedAt: '2024-01-14T15:45:00Z',
    snippets: []
  },
  {
    id: '3',
    name: 'Vue Dashboard',
    description: 'Admin dashboard with charts and analytics',
    language: 'JavaScript',
    tags: ['Vue', 'Dashboard', 'Charts'],
    stars: 18,
    forks: 5,
    owner: {
      username: 'vuemaster',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vuemaster'
    },
    isStarred: false,
    updatedAt: '2024-01-13T09:20:00Z',
    snippets: []
  }
];

export default api;
