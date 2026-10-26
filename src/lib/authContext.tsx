import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, PushNotification } from '../types';
import { auth as fbAuth, db } from './firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { resolveClaimRole } from './claims';

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  token: string | null;
  loading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; role: string; departmentId: string; agreePrivacy: boolean }) => Promise<void>;
  logout: () => void;
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

/**
 * Resolve the app-level User.
 *
 * Authorisation role comes exclusively from Firebase Auth custom claims, the
 * same source firestore.rules trusts. Firestore profile docs only supply
 * display fields (name, department, student id) and can never elevate a role.
 */
async function resolveUser(fbUser: FirebaseUser, forceRefresh = false): Promise<User | null> {
  const role = await resolveClaimRole(fbUser, forceRefresh);
  const uid = fbUser.uid;
  const email = fbUser.email;
  const displayName = fbUser.displayName;

  const candidates = [doc(db, 'users', uid), doc(db, 'students', uid), doc(db, 'teachers', uid)];
  for (const ref of candidates) {
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const d = snap.data() as Record<string, unknown>;
        return {
          id: uid,
          name: (d.name as string) || displayName || email?.split('@')[0] || 'Learner',
          email: (d.email as string) || email || '',
          role,
          avatarUrl: (d.avatarUrl as string | undefined) || (d.photoURL as string | undefined) || fbUser.photoURL || undefined,
          departmentId: d.department as string | undefined ?? (d.departmentId as string | undefined),
          departmentName: d.departmentName as string | undefined,
          studentId: d.studentId as string | undefined,
          employeeId: d.employeeId as string | undefined,
          level: d.level as number | undefined,
          xp: d.xp as number | undefined,
          streakDays: d.streakDays as number | undefined,
          badges: d.badges as string[] | undefined,
          registeredDate: d.registeredDate as string | undefined,
        } as User;
      }
    } catch {
      // Firestore unavailable or denied - try next source.
    }
  }
  return null;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(2);
  const [latestToast, setLatestToast] = useState<PushNotification | null>(null);

  // Firebase-native session: persists across refresh via the Auth SDK.
  useEffect(() => {
    let cancelled = false;
    const unsub = onAuthStateChanged(fbAuth, async (fbUser) => {
      try {
        if (!fbUser) {
          if (!cancelled) {
            setCurrentUser(null);
            setToken(null);
          }
          return;
        }
        const [idToken, user] = await Promise.all([
          fbUser.getIdToken().catch(() => ''),
          resolveUser(fbUser),
        ]);
        if (!cancelled) {
          setCurrentUser(user);
          setToken(idToken || null);
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

  const login = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(fbAuth, email, password);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Sign-in failed. Please retry.';
      setAuthError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: { name: string; email: string; password: string; role: string; departmentId: string; agreePrivacy: boolean }) => {
    setLoading(true);
    setAuthError(null);
    try {
      if (!payload.agreePrivacy) {
        throw new Error('POPIA consent is required. Please accept the privacy notice.');
      }
      const cred = await createUserWithEmailAndPassword(fbAuth, payload.email, payload.password);
      if (payload.name) {
        await updateProfile(cred.user, { displayName: payload.name }).catch(() => {});
      }
      // Self-registration is always a learner. Elevated roles are granted only
      // by an admin through the setCustomRole function (custom claims).
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        name: payload.name,
        email: payload.email,
        role: 'learner',
        departmentId: payload.departmentId || '',
        privacyPolicyAccepted: true,
        codeOfConductAccepted: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
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
    window.location.href = '/onboarding';
  };

  const refreshCurrentUser = async () => {
    const fbUser = fbAuth.currentUser;
    if (!fbUser) return;
    try {
      // Force-refresh the ID token so a role change made by an admin appears
      // immediately instead of waiting for the token's one-hour cycle.
      const user = await resolveUser(fbUser, true);
      if (user) setCurrentUser(user);
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
