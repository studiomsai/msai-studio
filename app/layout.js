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

  useEffect(() => {
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

  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 font-sans">
        {/* Navigation Bar */}
        <nav className="fixed w-full z-50 bg-slate-900/90 backdrop-blur text-white p-4 flex justify-between items-center border-b border-white/10">
          <div className="text-xl font-bold tracking-tighter">msai.studio</div>
          <div className="space-x-6 text-sm font-medium">
            <Link href="/" className="hover:text-blue-400 transition">Home</Link>
            <Link href="/apps" className="hover:text-blue-400 transition">AI Apps</Link>
            {user ? (
              <>
                <Link href="/dashboard" className="hover:text-blue-400 transition">Dashboard</Link>
                <Link href="/profile" className="hover:text-blue-400 transition">
                  {userName || 'Profile'}
                </Link>
              </>
            ) : (
              <Link href="/login" className="hover:text-blue-400 transition">Login</Link>
            )}
            <Link href="/shop" className="hover:text-blue-400 transition">Shop</Link>
          </div>
        </nav>

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
