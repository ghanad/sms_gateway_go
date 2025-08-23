import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import MessageHistoryPage from './pages/MessageHistoryPage.jsx';
import MessageDetailPage from './pages/MessageDetailPage.jsx';
import UserManagementPage from './pages/admin/UserManagementPage.jsx';
import ProvidersPage from './pages/admin/ProvidersPage.tsx';
import ProviderAuditPage from './pages/admin/ProviderAuditPage.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<Layout />}>
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/messages" element={<MessageHistoryPage />} />
                <Route path="/messages/:trackingId" element={<MessageDetailPage />} />
                <Route element={<AdminRoute />}>
                  <Route path="/admin/users" element={<UserManagementPage />} />
                  <Route path="/admin/providers" element={<ProvidersPage />} />
                  <Route path="/admin/providers/:id/audit" element={<ProviderAuditPage />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
