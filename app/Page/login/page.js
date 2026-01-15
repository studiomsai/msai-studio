'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mode, setMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      if (type === 'recovery') return 'reset';
    }
    return 'login';
  });
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    // Check if user is returning from password reset email
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const type = hashParams.get('type');

    if (type === 'recovery' && accessToken && refreshToken) {
      // User clicked reset link, set session and show password reset form
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }

      // Call the signup API
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          phone
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error);
        setLoading(false);
      } else {
        setSuccess('Account created successfully! You can now sign in.');
        setLoading(false);
      }
    } else if (mode === 'reset') {
      if (newPassword.length < 6) {
        setError('Password should be at least 6 characters.');
        setLoading(false);
        return;
      }

      if (newPassword !== confirmNewPassword) {
        setError('New passwords do not match.');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setSuccess('Password updated successfully! You can now sign in.');
        setLoading(false);
        setMode('login');
      }
    } else if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/Page/login`,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setSuccess('Password reset email sent! Check your inbox.');
        setLoading(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push('/Service/mood-today');
      }
    }
  };

  const handleForgotPassword = () => {
    setMode('forgot');
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {mode === 'reset' ? 'Update your password' : mode === 'forgot' ? 'Reset your password' : mode === 'signup' ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {mode === 'reset' ? (
              <>
                Enter your new password below
              </>
            ) : mode === 'forgot' ? (
              <>
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                  suppressHydrationWarning={true}
                >
                  Sign in
                </button>
              </>
            ) : mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                  suppressHydrationWarning={true}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                  suppressHydrationWarning={true}
                >
                  Sign up
                </button>
              </>
            )}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleAuth} suppressHydrationWarning={true}>
          {mode === 'signup' ? (
            <div className="rounded-md shadow-sm -space-y-px">
              <input
                type="text"
                required
                autoComplete="name"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                suppressHydrationWarning={true}
              />

              <input
                type="email"
                required
                autoComplete="email"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                suppressHydrationWarning={true}
              />

              <input
                type="password"
                required
                autoComplete="new-password"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                suppressHydrationWarning={true}
              />

              <input
                type="password"
                required
                autoComplete="new-password"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                suppressHydrationWarning={true}
              />

              <input
                type="tel"
                required
                autoComplete="tel"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                suppressHydrationWarning={true}
              />
            </div>
          ) : mode === 'reset' ? (
            <div className="rounded-md shadow-sm -space-y-px">
              <input
                type="password"
                required
                autoComplete="new-password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                suppressHydrationWarning={true}
              />

              <input
                type="password"
                required
                autoComplete="new-password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Confirm New Password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                suppressHydrationWarning={true}
              />
            </div>
          ) : mode === 'forgot' ? (
            <div className="rounded-md shadow-sm -space-y-px">
              <input
                type="email"
                required
                autoComplete="email"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                suppressHydrationWarning={true}
              />
            </div>
          ) : (
            <div className="rounded-md shadow-sm -space-y-px">
              <input
                type="email"
                required
                autoComplete="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                suppressHydrationWarning={true}
              />

              <input
                type="password"
                required
                autoComplete="current-password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                suppressHydrationWarning={true}
              />
            </div>
          )}

          {mode === 'login' && (
            <div className="text-sm">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="font-medium text-indigo-600 hover:text-indigo-500"
                suppressHydrationWarning={true}
              >
                Forgot your password?
              </button>
            </div>
          )}

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {success && <div className="text-green-500 text-sm text-center">{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 rounded-md text-white text-sm font-medium bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            suppressHydrationWarning={true}
          >
            {loading
              ? mode === 'reset'
                ? 'Updating password...'
                : mode === 'forgot'
                ? 'Sending reset email...'
                : mode === 'signup'
                ? 'Signing up...'
                : 'Signing in...'
              : mode === 'reset'
              ? 'Update password'
              : mode === 'forgot'
              ? 'Send reset email'
              : mode === 'signup'
              ? 'Sign up'
              : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}