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
    <div className="user-profile pt-50 pb-30 px-5">
      <div className="container mx-auto">
     

        <div className="max-w-xl w-full mx-auto signup-wrapper">
             <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-4xl font-medium text-center mb-5 sub-title inline-block">
            {mode === 'reset' ? 'Update your password' : mode === 'forgot' ? 'Reset your password' : mode === 'signup' ? 'Create your account' : 'Welcome back to MSAI Studio'}
          </h1>
          <p className="text-xl mb-10">
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
                  className="font-medium text-[#00c0ff] hover:text-[#0e6c8b]"
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
                  className="font-medium text-[#00c0ff] hover:text-[#0e6c8b]"
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
                  className="font-medium text-[#00c0ff] hover:text-[#0e6c8b]"
                  suppressHydrationWarning={true}
                >
                  Sign up
                </button>
              </>
            )}
          </p>
        </div>
          <div className="rounded-lg shadow-lg overflow-hidden">
            <div>
              <form className="space-y-6" onSubmit={handleAuth} suppressHydrationWarning={true}>
                {mode === 'signup' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        autoComplete="name"
                        className="w-full px-3 py-3 border border-[#3a3a3a] bg-transparent text-white rounded focus:ring-2 focus:ring-[#3a3a3a] focus:border-[#3a3a3a]"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        suppressHydrationWarning={true}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        className="w-full px-3 py-3 border border-[#3a3a3a] bg-transparent text-white rounded focus:ring-2 focus:ring-[#3a3a3a] focus:border-[#3a3a3a]"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        suppressHydrationWarning={true}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Password</label>
                      <input
                        type="password"
                        required
                        autoComplete="new-password"
                        className="w-full px-3 py-3 border border-[#3a3a3a] bg-transparent text-white rounded focus:ring-2 focus:ring-[#3a3a3a] focus:border-[#3a3a3a]"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        suppressHydrationWarning={true}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Confirm Password</label>
                      <input
                        type="password"
                        required
                        autoComplete="new-password"
                        className="w-full px-3 py-3 border border-[#3a3a3a] bg-transparent text-white rounded focus:ring-2 focus:ring-[#3a3a3a] focus:border-[#3a3a3a]"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        suppressHydrationWarning={true}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        autoComplete="tel"
                        className="w-full px-3 py-3 border border-[#3a3a3a] bg-transparent text-white rounded focus:ring-2 focus:ring-[#3a3a3a] focus:border-[#3a3a3a]"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        suppressHydrationWarning={true}
                      />
                    </div>
                  </div>
                ) : mode === 'reset' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">New Password</label>
                      <input
                        type="password"
                        required
                        autoComplete="new-password"
                        className="w-full px-3 py-3 border border-[#3a3a3a] bg-transparent text-white rounded focus:ring-2 focus:ring-[#3a3a3a] focus:border-[#3a3a3a]"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        suppressHydrationWarning={true}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        autoComplete="new-password"
                        className="w-full px-3 py-3 border border-[#3a3a3a] bg-transparent text-white rounded focus:ring-2 focus:ring-[#3a3a3a] focus:border-[#3a3a3a]"
                        placeholder="Confirm New Password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        suppressHydrationWarning={true}
                      />
                    </div>
                  </div>
                ) : mode === 'forgot' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        className="w-full px-3 py-3 border border-[#3a3a3a] bg-transparent text-white rounded focus:ring-2 focus:ring-[#3a3a3a] focus:border-[#3a3a3a]"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        suppressHydrationWarning={true}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        className="w-full px-3 py-3 border border-[#3a3a3a] bg-transparent text-white rounded focus:ring-2 focus:ring-[#3a3a3a] focus:border-[#3a3a3a]"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        suppressHydrationWarning={true}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Password</label>
                      <input
                        type="password"
                        required
                        autoComplete="current-password"
                        className="w-full px-3 py-3 border border-[#3a3a3a] bg-transparent text-white rounded focus:ring-2 focus:ring-[#3a3a3a] focus:border-[#3a3a3a]"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        suppressHydrationWarning={true}
                      />
                    </div>
                  </div>
                )}

                {mode === 'login' && (
                  <div className="text-sm">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="font-medium text-[#00c0ff] hover:text-[#0e6c8b]"
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
                  className="primary-btn w-full"
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
        </div>
      </div>
    </div>
  );
}
