import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const authAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // FastAPI uses refresh token directly - redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email, password) => 
    axios.post(`${API_BASE_URL}/auth/login`, { email, password }),
  
  register: (userData) => 
    axios.post(`${API_BASE_URL}/auth/register`, userData),
  
  logout: () => 
    authAxios.post('/auth/logout'),
  
  getProfile: () => 
    authAxios.get('/auth/profile'),
  
  updateProfile: (userData) => 
    authAxios.patch('/auth/profile', userData),
  
  changePassword: (oldPassword, newPassword, newPassword2) => 
    authAxios.post('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password2: newPassword2,
    }),
  
  requestPasswordReset: (email) => 
    axios.post(`${API_BASE_URL}/auth/password-reset/request`, { email }),
  
  confirmPasswordReset: (token, newPassword, newPassword2) => 
    axios.post(`${API_BASE_URL}/auth/password-reset/confirm`, {
      token,
      new_password: newPassword,
      new_password2: newPassword2,
    }),
  
  verifyEmail: (token) => 
    axios.post(`${API_BASE_URL}/auth/verify-email`, { token }),
  
  refreshUserData: async () => {
    const response = await authAxios.get('/auth/profile');
    const userData = response.data;
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  },
};

export default authAxios;