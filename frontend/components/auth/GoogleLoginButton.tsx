'use client';

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';

export const GoogleLoginButton: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to authenticate with Google');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none"
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-1.14 2.78-2.4 3.63v3.01h3.87c2.26-2.08 3.58-5.14 3.58-8.49z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.87-3.01c-1.08.72-2.45 1.16-4.09 1.16-3.15 0-5.81-2.13-6.76-4.99H1.27v3.11C3.26 21.3 7.39 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.24 14.25c-.24-.72-.38-1.5-.38-2.25s.14-1.53.38-2.25V6.64H1.27C.46 8.25 0 10.07 0 12s.46 3.75 1.27 5.36l3.97-3.11z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.39 0 3.26 2.7 1.27 6.64l3.97 3.11c.95-2.86 3.61-4.99 6.76-4.99z"
          />
        </svg>
      )}
      <span>{loading ? 'Connecting...' : 'Sign in with Google'}</span>
    </button>
  );
};
export default GoogleLoginButton;
