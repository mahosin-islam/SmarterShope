'use client';

// AuthModal — Login / Register modal matching the Stitch design.
// Opens as a popup overlay over the landing page (like Daraz.com).

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/authContext';
import { useAuthModal, type AuthModalTab } from '@/lib/authModal.context';

// ─── Validation helpers ───────────────────────────────────────────────────────
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// ─── Login Form ───────────────────────────────────────────────────────────────
interface LoginFormProps {
  onSwitch: () => void;
  onSuccess: () => void;
}

function LoginForm({ onSwitch, onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  useEffect(() => { emailRef.current?.focus(); }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!email.trim()) { setError('Please enter your email.'); return; }
      if (!isValidEmail(email)) { setError('Please enter a valid email address.'); return; }
      if (!password) { setError('Please enter your password.'); return; }

      setIsSubmitting(true);
      try {
        await login({ email: email.trim(), password });
        onSuccess();
        // Redirect based on role — role is now in auth context user object
        // We read it after login resolves; useAuth() state updates asynchronously
        // so we push to a role-aware page and let middleware handle it.
        router.push('/');
        router.refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, login, onSuccess, router],
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Email / Phone */}
      <div>
        <label htmlFor="login-email" className="sr-only">Email</label>
        <input
          ref={emailRef}
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Please enter your Phone or Email"
          disabled={isSubmitting}
          className="w-full px-4 py-3.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4600] focus:border-transparent placeholder:text-gray-400 disabled:opacity-60 transition"
        />
      </div>

      {/* Password */}
      <div className="relative">
        <label htmlFor="login-password" className="sr-only">Password</label>
        <input
          id="login-password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Please enter your password"
          disabled={isSubmitting}
          className="w-full px-4 py-3.5 pr-12 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4600] focus:border-transparent placeholder:text-gray-400 disabled:opacity-60 transition"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {/* Forgot password */}
      <div className="flex justify-end">
        <button
          type="button"
          className="text-sm text-gray-500 hover:text-[#ff4600] transition-colors"
          onClick={() => { /* TODO: Implement forgot password flow */ }}
        >
          Forgot password?
        </button>
      </div>

      {/* Error */}
      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 bg-[#ff4600] hover:bg-[#e03e00] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-widest rounded-xl transition-colors"
      >
        {isSubmitting ? 'Logging in…' : 'LOGIN'}
      </button>

      {/* Switch to register */}
      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="text-[#ff4600] font-semibold hover:underline focus:outline-none"
        >
          Sign up
        </button>
      </p>

      {/* Social divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-white text-sm text-gray-400">Or, login with</span>
        </div>
      </div>

      {/* Social buttons — UI only, no implementation yet */}
      <div className="flex items-center justify-center gap-6">
        <button
          type="button"
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-medium text-gray-700"
          aria-label="Login with Google (coming soon)"
        >
          {/* Google G logo */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </button>
        <button
          type="button"
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-medium text-gray-700"
          aria-label="Login with Facebook (coming soon)"
        >
          {/* Facebook logo */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </button>
      </div>
    </form>
  );
}

// ─── Register Form ────────────────────────────────────────────────────────────
interface RegisterFormProps {
  onSwitch: () => void;
  onSuccess: () => void;
}

function RegisterForm({ onSwitch, onSuccess }: RegisterFormProps) {
  const { register } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const firstNameRef = useRef<HTMLInputElement>(null);
  useEffect(() => { firstNameRef.current?.focus(); }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!firstName.trim()) { setError('First name is required.'); return; }
      if (!email.trim() || !isValidEmail(email)) { setError('Please enter a valid email address.'); return; }
      if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

      setIsSubmitting(true);
      try {
        await register({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim() || undefined,
        });
        onSuccess();
        router.push('/account/dashboard');
        router.refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [firstName, lastName, email, password, confirmPassword, register, onSuccess, router],
  );

  const inputClass =
    'w-full px-4 py-3.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4600] focus:border-transparent placeholder:text-gray-400 disabled:opacity-60 transition';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
      {/* Name row */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="reg-first-name" className="sr-only">First Name</label>
          <input
            ref={firstNameRef}
            id="reg-first-name"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            disabled={isSubmitting}
            className={inputClass}
          />
        </div>
        <div className="flex-1">
          <label htmlFor="reg-last-name" className="sr-only">Last Name</label>
          <input
            id="reg-last-name"
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            disabled={isSubmitting}
            className={inputClass}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="reg-email" className="sr-only">Email</label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          disabled={isSubmitting}
          className={inputClass}
        />
      </div>

      {/* Password */}
      <div className="relative">
        <label htmlFor="reg-password" className="sr-only">Password</label>
        <input
          id="reg-password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min. 8 characters)"
          disabled={isSubmitting}
          className={`${inputClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {/* Confirm Password */}
      <div className="relative">
        <label htmlFor="reg-confirm-password" className="sr-only">Confirm Password</label>
        <input
          id="reg-confirm-password"
          type={showConfirm ? 'text' : 'password'}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          disabled={isSubmitting}
          className={`${inputClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShowConfirm((v) => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
        >
          {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 bg-[#ff4600] hover:bg-[#e03e00] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-widest rounded-xl transition-colors"
      >
        {isSubmitting ? 'Creating account…' : 'CREATE ACCOUNT'}
      </button>

      {/* Switch to login */}
      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="text-[#ff4600] font-semibold hover:underline focus:outline-none"
        >
          Log in
        </button>
      </p>
    </form>
  );
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────
export function AuthModal() {
  const { isOpen, activeTab, closeAuthModal, switchTab } = useAuthModal();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, closeAuthModal]);

  // Close on backdrop click
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === overlayRef.current) closeAuthModal();
    },
    [closeAuthModal],
  );

  const switchToRegister = useCallback(() => switchTab('register'), [switchTab]);
  const switchToLogin = useCallback(() => switchTab('login'), [switchTab]);

  if (!isOpen) return null;

  const tabs: { key: AuthModalTab; label: string }[] = [
    { key: 'login', label: 'Login' },
    { key: 'register', label: 'Register' },
  ];

  return (
    /* Overlay */
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={activeTab === 'login' ? 'Login' : 'Create account'}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
    >
      {/* Modal card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition focus:outline-none"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-8 pt-8 pb-8">
          {/* Brand */}
          <p className="font-editorial text-2xl font-bold text-[#ff4600] tracking-tight text-center mb-1">
            MODORA
          </p>
          <p className="text-center text-xs text-gray-400 mb-6 uppercase tracking-widest">
            Minimalist European Luxury
          </p>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => switchTab(tab.key)}
                className={`flex-1 pb-3 text-sm font-semibold transition-colors focus:outline-none ${
                  activeTab === tab.key
                    ? 'border-b-2 border-[#ff4600] text-[#ff4600]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active form */}
          {activeTab === 'login' ? (
            <LoginForm onSwitch={switchToRegister} onSuccess={closeAuthModal} />
          ) : (
            <RegisterForm onSwitch={switchToLogin} onSuccess={closeAuthModal} />
          )}
        </div>
      </div>
    </div>
  );
}
