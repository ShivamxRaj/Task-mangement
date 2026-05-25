'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import { CheckSquare, Users, Bell, Sparkles, Layers, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-xs text-slate-400 font-medium">Checking workspace auth session...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: <Users className="text-blue-500" size={20} />,
      title: 'Team Collaboration',
      desc: 'Create, assign, and distribute tasks across your team members instantly.'
    },
    {
      icon: <Bell className="text-indigo-500" size={20} />,
      title: 'Gmail Notifications',
      desc: 'Receive immediate email alerts when tasks are created, assigned, or completed.'
    },
    {
      icon: <Sparkles className="text-amber-500" size={20} />,
      title: 'Smart Suggestions',
      desc: 'Generate priority-based due date recommendations automatically.'
    },
    {
      icon: <Layers className="text-purple-500" size={20} />,
      title: 'Kanban Task Board',
      desc: 'Filter and search across tasks visually using columns or a list view.'
    },
    {
      icon: <ShieldCheck className="text-emerald-500" size={20} />,
      title: 'Supabase Security',
      desc: 'Enterprise security standards with Supabase authentication and RLS.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <header className="h-16 px-4 md:px-6 flex items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-600 text-white">
            <CheckSquare size={18} className="stroke-[2.5]" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Task<span className="text-blue-600">Flow</span>
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 text-left space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
            <Sparkles size={12} />
            <span>Collaboration Made Easy</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display leading-tight tracking-tight text-slate-900 dark:text-white">
            Supercharge your team's <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">productivity</span>
          </h1>
          
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
            TaskFlow is a collaborative workspace where team members can assign tasks, receive real-time notifications, and keep projects organized in a central, security-hardened board.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            {features.slice(0, 4).map((f, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 p-2 h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                  {f.icon}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{f.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-md border border-slate-250/60 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xl relative overflow-hidden transition-all duration-300">
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

            <div className="relative space-y-6">
              <div className="text-center">
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-100/50 dark:border-blue-900/30">
                  <CheckSquare size={22} className="stroke-[2.5]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Welcome to TaskFlow</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  Sign in with your Google account to access your workspace.
                </p>
              </div>

              <div className="pt-2">
                <GoogleLoginButton />
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enterprise Grade</span>
                <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
              </div>

              <div className="flex gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/50 dark:border-slate-800/50 text-[11px] text-slate-500 dark:text-slate-400">
                <ShieldCheck className="text-emerald-500 flex-shrink-0 mt-0.5" size={14} />
                <p className="leading-normal">
                  Authentication is managed securely via Google OAuth. We never access or store your password credentials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 px-4 border-t border-slate-200/60 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/30 transition-colors">
        <p>&copy; {new Date().getFullYear()} TaskFlow Collaborative Portal. Created as an internship project.</p>
      </footer>
    </div>
  );
}
