import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor to automatically add the JWT token if logged in
api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('sakhi_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (error) {
        console.error('Error parsing token from localStorage', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle expired or deleted user tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const msg = error.response.data?.message || '';
      if (msg.includes('user not found') || msg.includes('token failed') || msg.includes('jwt expired')) {
        console.warn('Stale or invalid token detected. Clearing localStorage session...');
        localStorage.removeItem('sakhi_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
