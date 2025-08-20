import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import MessageHistoryPage from './pages/MessageHistoryPage.jsx';
import MessageDetailPage from './pages/MessageDetailPage.jsx';
import ClientManagementPage from './pages/admin/ClientManagementPage.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function App() {
  return (
    <AuthProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/messages" element={<MessageHistoryPage />} />
                <Route path="/messages/:trackingId" element={<MessageDetailPage />} />
                <Route element={<AdminRoute />}>
                  <Route path="/admin/clients" element={<ClientManagementPage />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </Router>
      </LocalizationProvider>
    </AuthProvider>
  );
}

export default App;
