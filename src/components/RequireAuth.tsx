import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import type { UserRole } from '../types';

export const RequireAuth: React.FC<{
  children: React.ReactElement;
  roles?: UserRole[];
}> = ({ children, roles }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="p-8" role="status" aria-live="polite" aria-label="Loading">
        <div className="max-w-md mx-auto bg-white border rounded-xl p-6 text-center">
          <p className="font-mono text-xs uppercase tracking-widest">Loading session…</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/onboarding" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
