'use client';

import './globals.css'
import Link from 'next/link'
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Try to get name from users table first, fallback to auth metadata
        const { data: profileData } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (profileData?.full_name) {
          setUserName(profileData.full_name);
        } else {
          setUserName(user.user_metadata?.display_name || user.email);
        }
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        setUserName(session.user.user_metadata?.display_name || session.user.email);
      } else {
        setUser(null);
        setUserName('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 font-sans">
        {/* Navigation Bar - Only render after mounted to prevent hydration mismatch */}
        {mounted && (
          <nav className="fixed w-full z-50 bg-slate-900/90 backdrop-blur text-white p-4 flex justify-between items-center border-b border-white/10">
            <div className="text-xl font-bold tracking-tighter">msai.studio</div>
            <div className="space-x-6 text-sm font-medium flex">
              <Link href="/" className="hover:text-blue-400 transition">Home</Link>
              <Link href="/apps" className="hover:text-blue-400 transition">AI Apps</Link>
              {user ? (
                <>
                  <Link href="/mood-today" className="hover:text-blue-400 transition">Dashboard</Link>
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="hover:text-blue-400 transition flex items-center space-x-1"
                    >
                      <span>{userName || 'Profile'}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link href="/login" className="hover:text-blue-400 transition">Login</Link>
              )}
              <Link href="/shop" className="hover:text-blue-400 transition">Shop</Link>
            </div>
          </nav>
        )}

        {/* Main Content Area */}
        {children}

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 py-8 text-center mt-20">
          <p>© 2025 msai.studio – Affordable for ALL.</p>
        </footer>
      </body>
    </html>
  )
}
