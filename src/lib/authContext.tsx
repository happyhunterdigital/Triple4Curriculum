import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, PushNotification } from '../types';
import { api } from './api';

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  token: string | null;
  loading: boolean;
  login: (email: string, role?: UserRole) => Promise<void>;
  register: (payload: { name: string; email: string; role: string; departmentId: string }) => Promise<void>;
  logout: () => void;
  switchUserByRole: (role: UserRole) => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  latestToast: PushNotification | null;
  dismissToast: () => void;
  triggerToast: (toast: PushNotification) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(2);
  const [latestToast, setLatestToast] = useState<PushNotification | null>(null);

  // Initialize with student Sarah Khumalo
  useEffect(() => {
    async function initAuth() {
      try {
        const savedUserId = localStorage.getItem('444_current_user_id') || 'stu_01';
        const users = await api.getUsers();
        const found = users.find(u => u.id === savedUserId) || users[0];
        if (found) {
          setCurrentUser(found);
          setToken(`jwt-444-${found.id}`);
        }
      } catch (err) {
        console.error('Failed to init auth:', err);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email: string, role?: UserRole) => {
    setLoading(true);
    try {
      const res = await api.login(email, role);
      setCurrentUser(res.user);
      setToken(res.token);
      localStorage.setItem('444_current_user_id', res.user.id);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: { name: string; email: string; role: string; departmentId: string }) => {
    setLoading(true);
    try {
      const res = await api.register(payload);
      setCurrentUser(res.user);
      setToken(res.token);
      localStorage.setItem('444_current_user_id', res.user.id);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('444_current_user_id');
  };

  const switchUserByRole = async (role: UserRole) => {
    setLoading(true);
    try {
      const users = await api.getUsers();
      const user = users.find(u => u.role === role) || users[0];
      setCurrentUser(user);
      setToken(`jwt-444-${user.id}`);
      localStorage.setItem('444_current_user_id', user.id);
    } finally {
      setLoading(false);
    }
  };

  const refreshCurrentUser = async () => {
    if (!currentUser) return;
    try {
      const users = await api.getUsers();
      const user = users.find(u => u.id === currentUser.id);
      if (user) {
        setCurrentUser(user);
      }
    } catch (e) {
      console.warn('Failed to refresh user', e);
    }
  };

  const triggerToast = (toast: PushNotification) => {
    setLatestToast(toast);
    setTimeout(() => {
      setLatestToast(null);
    }, 6000);
  };

  const dismissToast = () => {
    setLatestToast(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser?.role || 'student',
        token,
        loading,
        login,
        register,
        logout,
        switchUserByRole,
        refreshCurrentUser,
        unreadCount,
        setUnreadCount,
        latestToast,
        dismissToast,
        triggerToast
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
