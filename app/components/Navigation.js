'use client';

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Navigation() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className={`fixed w-full z-50 text-white py-6 px-4 flex justify-between items-center ${isSticky ? 'sticky-nav' : ''}`}>
      <div className="container flex justify-between items-center mx-auto">
        <div className="text-xl font-bold tracking-tighter">
          <Link href="/" >
            <Image
              src="/image/msai-studio.svg"
              alt="Site Logo"
              width={175}
              height={24}
              className="w-full h-full object-cover"
            />
          </Link>
        </div>
        <div className="space-x-6 text-sm font-medium flex justify-center">
          <Link href="/" className="font-tiktok text-lg hover:text-blue-400 transition">Home</Link>
          <Link href="/Page/apps" className="font-tiktok text-lg hover:text-blue-400 transition">Our Service</Link>
          <Link href="/Page/shop" className="font-tiktok text-lg hover:text-blue-400 transition">Purchase Credit</Link>
          <Link href="/Page/contact" className="font-tiktok text-lg hover:text-blue-400 transition">Contact</Link>
          <Link href="/Service/mood-today" className="font-tiktok text-lg hover:text-blue-400 transition">Dashboard</Link>
        </div>
        <div className="profile-btn">
          <Image src="/image/user-icon.svg" alt="User Icon" className="w-10 h-10 inline-block mr-3"  width={40}
              height={40}/>
          {user ? (
            <>
              <div className="relative dropdown-container">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="font-tiktok text-lg hover:text-blue-400 transition flex items-center space-x-1 ">
                  <span>{userName || 'Profile'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-black rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/Page/profile"
                      className="flex items-center px-4 py-2 text-sm w-full"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm  "
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
            <Link href="/Page/login" className="font-tiktok text-lg hover:text-blue-400 transition">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
