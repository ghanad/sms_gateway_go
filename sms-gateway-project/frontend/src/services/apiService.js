import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
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

const getClients = async () => {
  const response = await api.get('/admin/clients');
  return response.data;
};

const createClient = async (clientData) => {
  const response = await api.post('/admin/clients', clientData);
  return response.data;
};

const updateClient = async (clientId, clientData) => {
  const response = await api.put(`/admin/clients/${clientId}`, clientData);
  return response.data;
};

export default {
  login,
  getDashboardStats,
  getMessages,
  getMessageDetails,
  getClients,
  createClient,
  updateClient
};
