import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, PushNotification } from '../types';
import { api } from './api';
import { auth as fbAuth } from './firebase';
import { onAuthStateChanged, sendPasswordResetEmail, sendEmailVerification, signOut } from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  token: string | null;
  loading: boolean;
  authError: string | null;
  login: (email: string, role?: UserRole) => Promise<void>;
  register: (payload: { name: string; email: string; role: string; departmentId: string; agreePrivacy: boolean }) => Promise<void>;
  logout: () => void;
  /** Dev-only impersonation. Guarded by VITE_DEV_IMPERSONATION + audit. */
  switchUserByRole: (role: UserRole) => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  latestToast: PushNotification | null;
  dismissToast: () => void;
  triggerToast: (toast: PushNotification) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEV_IMPERSONATION = import.meta.env.VITE_DEV_IMPERSONATION === 'true';

function persistSession(user: User, token: string) {
  setCurrentUserSafe(user, token);
  try {
    localStorage.setItem('444_current_user_id', user.id);
    localStorage.setItem('444_current_user_role', user.role);
    localStorage.setItem('444_session_token', token);
  } catch {}
}

let setCurrentUserSafe: (u: User, t: string) => void = () => {};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(2);
  const [latestToast, setLatestToast] = useState<PushNotification | null>(null);

  setCurrentUserSafe = (u, t) => {
    setCurrentUser(u);
    setToken(t);
  };

  // Session persistence: Firebase session wins; fall back to saved demo session.
  useEffect(() => {
    let cancelled = false;
    const unsub = onAuthStateChanged(fbAuth, async (fbUser) => {
      try {
        if (fbUser) {
          const idToken = await fbUser.getIdToken().catch(() => '');
          // Resolve profile from demo API (keyed by email when available).
          const email = fbUser.email || '';
          if (email) {
            try {
              const res = await api.login(email);
              if (!cancelled) {
                setCurrentUser(res.user);
                setToken(idToken || res.token);
                localStorage.setItem('444_current_user_id', res.user.id);
                localStorage.setItem('444_current_user_role', res.user.role);
                if (idToken) localStorage.setItem('444_session_token', idToken);
              }
              return;
            } catch {
              // Fall through to signed-in-but-unlinked state.
            }
          }
          if (!cancelled) {
            setToken(idToken || null);
          }
          return;
        }
        // No Firebase session — restore saved demo session if present.
        const savedUserId = localStorage.getItem('444_current_user_id');
        if (savedUserId) {
          try {
            const users = await api.getUsers();
            const found = users.find((u) => u.id === savedUserId) || null;
            if (!cancelled) {
              setCurrentUser(found);
              setToken(found ? localStorage.getItem('444_session_token') : null);
            }
          } catch {
            if (!cancelled) {
              setCurrentUser(null);
              setToken(null);
            }
          }
        } else if (!cancelled) {
          // No auto-login: guests stay signed out until they sign in.
          setCurrentUser(null);
          setToken(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const login = async (email: string, role?: UserRole) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await api.login(email, role);
      persistSession(res.user, res.token);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Sign-in failed. Please retry.';
      setAuthError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: { name: string; email: string; role: string; departmentId: string; agreePrivacy: boolean }) => {
    setLoading(true);
    setAuthError(null);
    try {
      if (!payload.agreePrivacy) {
        throw new Error('POPIA consent is required. Please accept the privacy notice.');
      }
      const res = await api.register(payload);
      persistSession(res.user, res.token);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Registration failed. Please retry.';
      setAuthError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(fbAuth);
    } catch {}
    setCurrentUser(null);
    setToken(null);
    setAuthError(null);
    try {
      localStorage.removeItem('444_current_user_id');
      localStorage.removeItem('444_current_user_role');
      localStorage.removeItem('444_session_token');
    } catch {}
    window.location.href = '/onboarding';
  };

  const switchUserByRole = async (role: UserRole) => {
    if (!DEV_IMPERSONATION) {
      throw new Error('Role switching is disabled in this build.');
    }
    setLoading(true);
    try {
      const users = await api.getUsers();
      const user = users.find((u) => u.role === role) || users[0];
      if (!user) throw new Error('No users available');
      persistSession(user, `dev-${user.role}-${user.id}`);
      console.warn(`[audit] DEV impersonation: switched to ${user.id} (${user.role})`);
    } finally {
      setLoading(false);
    }
  };

  const refreshCurrentUser = async () => {
    if (!currentUser) return;
    try {
      const users = await api.getUsers();
      const user = users.find((u) => u.id === currentUser.id);
      if (user) {
        setCurrentUser(user);
      }
    } catch (e) {
      console.warn('Failed to refresh user', e);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(fbAuth, email);
  };

  const resendVerification = async () => {
    if (fbAuth.currentUser) {
      await sendEmailVerification(fbAuth.currentUser);
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
        authError,
        login,
        register,
        logout,
        switchUserByRole,
        refreshCurrentUser,
        resetPassword,
        resendVerification,
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
