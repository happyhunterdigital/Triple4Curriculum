import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import type { UserRole } from '../types';

/** Normalize stored/legacy role spellings to app roles (teacher == lecturer, learner == student). */
export function normalizeRole(raw: unknown): UserRole {
  if (raw === 'teacher' || raw === 'lecturer') return 'lecturer';
  if (raw === 'admin') return 'admin';
  return 'student';
}

export const RequireAuth: React.FC<{
  children: React.ReactElement;
  roles?: Array<UserRole | 'teacher' | 'learner'>;
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

  if (roles && !roles.map(normalizeRole).includes(normalizeRole(currentUser.role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
