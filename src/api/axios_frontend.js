import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_NODE_API_URL || 'http://localhost:3500',
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor to attach token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken'); // get from localStorage
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`; // Add Bearer token
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default api;
