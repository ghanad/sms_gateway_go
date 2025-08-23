import React, { createContext, useContext, useState } from 'react';
import apiService from '../services/apiService.js';

const AuthContext = createContext(null);

const getInitialToken = () => {
  const t = localStorage.getItem('token');
  if (!t) return null;
  try {
    const payload = JSON.parse(atob(t.split('.')[1]));
    const expired = payload.exp * 1000 < Date.now();
    if (expired) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
    return t;
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored && stored !== 'undefined' ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(getInitialToken);
  const isAuthenticated = !!token;

  const login = async (username, password) => {
    const data = await apiService.login(username, password);
    const payload = JSON.parse(atob(data.token.split('.')[1]));
    const userInfo = { username: payload.username, id: payload.user_id, isAdmin: payload.is_admin };
    setUser(userInfo);
    setToken(data.token);
    localStorage.setItem('user', JSON.stringify(userInfo));
    localStorage.setItem('token', data.token);
  };

    const logout = async () => {
      await apiService.logout();
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
