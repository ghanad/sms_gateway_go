import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import ForbiddenPage from '../../pages/ForbiddenPage.jsx';

export const useAdminGuard = () => {
  const { user } = useAuth();
  if (!user?.isAdmin) {
    return <ForbiddenPage />;
  }
  return null;
};

export default useAdminGuard;
