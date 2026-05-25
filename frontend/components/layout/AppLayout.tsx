'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12 flex items-center justify-center">
            <span className="absolute animate-ping h-8 w-8 rounded-full bg-blue-500 opacity-75"></span>
            <span className="relative rounded-full h-8 w-8 bg-blue-600"></span>
          </div>
          <p className="text-sm font-semibold tracking-wide text-slate-400 animate-pulse">
            Configuring workspace environment...
          </p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <Navbar />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 w-full md:pl-64 px-4 py-8 md:px-8 max-w-7xl mx-auto">
            <div className="animate-fadeIn">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {children}
    </div>
  );
};
export default AppLayout;
