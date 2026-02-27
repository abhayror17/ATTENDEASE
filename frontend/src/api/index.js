import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // FastAPI - redirect to login on auth failure
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    console.error('[API Response Error]', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Employee APIs
export const employeeApi = {
  getAll: (params = {}) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  getActive: () => api.get('/employees/active'),
  getAttendance: (id) => api.get(`/employees/${id}/attendance`),
  linkUser: (id, userEmail) => api.post(`/employees/${id}/link-user`, { user_email: userEmail }),
};

// Department APIs
export const departmentApi = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
  getEmployees: (id) => api.get(`/departments/${id}/employees`),
};

// Attendance APIs
export const attendanceApi = {
  getAll: (params = {}) => api.get('/attendance', { params }),
  getById: (id) => api.get(`/attendance/${id}`),
  create: (data) => api.post('/attendance', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
  getToday: () => api.get('/attendance/today'),
  getDailySummary: (params = {}) => api.get('/attendance/daily-summary', { params }),
  getStats: (date) => api.get('/attendance/stats', { params: { date } }),
  checkIn: (employeeId) => api.post('/attendance/check-in', { employee: employeeId }),
  checkOut: (employeeId) => api.post('/attendance/check-out', { employee: employeeId }),
};

// Leave Request APIs
export const leaveRequestApi = {
  getAll: (params = {}) => api.get('/leave-requests', { params }),
  getById: (id) => api.get(`/leave-requests/${id}`),
  create: (data) => api.post('/leave-requests', data),
  update: (id, data) => api.put(`/leave-requests/${id}`, data),
  delete: (id) => api.delete(`/leave-requests/${id}`),
  approve: (id, adminComment = '') => api.post(`/leave-requests/${id}/approve`, { admin_comment: adminComment }),
  reject: (id, adminComment = '') => api.post(`/leave-requests/${id}/reject`, { admin_comment: adminComment }),
};

export default api;
