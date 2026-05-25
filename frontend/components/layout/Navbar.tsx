'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Sun, Moon, LogOut, CheckSquare } from 'lucide-react';
import Link from 'next/link';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (systemPrefersDark) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-40 px-4 md:px-6 transition-colors">
      <div className="h-full max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <CheckSquare size={20} className="stroke-[2.5]" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
            Task<span className="text-blue-600">Flow</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all active:scale-95"
            aria-label="Toggle Dark/Light Mode"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user && (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.full_name || 'User Profile'}
                  className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="hidden md:flex flex-col text-left">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                  {user.email}
                </span>
              </div>

              <button
                onClick={signOut}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-all active:scale-95 ml-1"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
