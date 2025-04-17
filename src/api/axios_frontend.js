import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_NODE_API_URL || 'http://localhost:3500',
  headers: { 'Content-Type': 'application/json' }
});

// Simple request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;