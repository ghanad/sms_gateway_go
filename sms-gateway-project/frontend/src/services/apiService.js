import axios from 'axios';

// Base URL for backend API. When no environment variable is provided the
// frontend will proxy `/api` to the backend service.
const rawBaseUrl =
  import.meta.env.NEXT_PUBLIC_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  '';

const api = axios.create({
  baseURL: `${rawBaseUrl.replace(/\/$/, '')}/api`
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(err);
  }
);

const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

const logout = async () => {
  await api.post('/auth/logout');
};

const getDashboardStats = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

const getMessages = async (filters) => {
  const response = await api.get('/messages', { params: filters });
  return response.data;
};

const getMessageDetails = async (trackingId) => {
  const response = await api.get(`/messages/${trackingId}`);
  return response.data;
};

const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

const updateUser = async (userId, userData) => {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
};

const deleteUser = async (userId) => {
  await api.delete(`/users/${userId}`);
};

const activateUser = async (userId) => {
  await api.post(`/users/${userId}/activate`);
};

const deactivateUser = async (userId) => {
  await api.post(`/users/${userId}/deactivate`);
};

export default {
  login,
  logout,
  getDashboardStats,
  getMessages,
  getMessageDetails,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser
};
