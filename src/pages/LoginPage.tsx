import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail,
} from 'firebase/auth';
import { Eye, EyeOff, LogIn, ShieldCheck, ArrowRight } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuth } from '../lib/authContext';

export function LoginPage() {
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    document.title = 'Sign in: Triple 4 Curriculum';
  }, []);

  useEffect(() => {
    if (currentUser) navigate('/dashboard', { replace: true });
  }, [currentUser, navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code || '';
      if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found'].includes(code)) {
        setError('Email or password is incorrect. Try again, or use “Forgot password”.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Wait a few minutes and try again.');
      } else {
        setError(e instanceof Error ? e.message : 'Sign-in failed. Please retry.');
      }
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError('');
    setBusy(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      navigate('/dashboard', { replace: true });
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setError('Sign-in cancelled.');
      } else if (code === 'auth/popup-blocked') {
        setError('Popup blocked — allow popups for triple4c.com and retry.');
      } else {
        setError(e instanceof Error ? e.message : 'Google sign-in failed.');
      }
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async () => {
    if (!email.trim()) {
      setError('Enter your email address first, then choose “Forgot password”.');
      return;
    }
    setError('');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch {
      setError('Could not send the reset email. Check the address and try again.');
    }
  };

  return (
    <div className="w-full bg-[var(--color-canvas-soft)] min-h-[70vh] flex items-start justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-md">
        <div className="rounded-[16px] border border-black/10 bg-white p-6 sm:p-8">
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-t4c-green)] font-semibold">
            T4C Platform
          </p>
          <h1 className="mt-2 font-display text-[28px] sm:text-[34px] font-semibold tracking-tight leading-tight">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Welcome back. Use your school email or Google account.
          </p>

          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="mt-5 w-full flex items-center justify-center gap-2 h-11 rounded-[8px] border border-[#E2E8F0] bg-white hover:bg-neutral-50 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt=""
              className="w-4 h-4"
            />
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#E2E8F0]" />
            <span className="text-[11px] uppercase tracking-widest text-neutral-400">or email</span>
            <div className="h-px flex-1 bg-[#E2E8F0]" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-xs font-medium">Email</label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex h-10 w-full rounded-[6px] border border-[#E2E8F0] bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[var(--color-t4c-green)] focus:ring-1 focus:ring-[var(--color-t4c-green)]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="login-password" className="text-xs font-medium">Password</label>
                <button
                  type="button"
                  onClick={resetPassword}
                  className="text-[11px] font-semibold text-[var(--color-t4c-green)] underline underline-offset-2"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex h-10 w-full rounded-[6px] border border-[#E2E8F0] bg-white px-3 pr-10 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[var(--color-t4c-green)] focus:ring-1 focus:ring-[var(--color-t4c-green)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 hover:text-[var(--color-t4c-green)]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {resetSent && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                Password reset email sent. Check your inbox (and spam).
              </p>
            )}
            {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-[8px] bg-[var(--color-t4c-green)] text-white text-sm font-bold uppercase tracking-widest hover:bg-[var(--color-t4c-black)] transition-colors disabled:opacity-50"
            >
              <LogIn size={16} /> {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-neutral-600">
            New to T4C?{' '}
            <Link to="/onboarding" className="font-bold text-[var(--color-t4c-green)] underline underline-offset-2">
              Apply for a place
            </Link>
          </p>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
          <ShieldCheck size={13} /> Protected by POPIA-compliant school accounts.
        </p>

        <p className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-[var(--color-t4c-green)]">
            <ArrowRight size={13} className="rotate-180" /> Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
