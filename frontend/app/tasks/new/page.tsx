'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useTasks } from '@/hooks/useTasks';
import { TaskForm } from '@/components/tasks/TaskForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewTaskPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { createTask } = useTasks();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleCreateTask = async (data: any) => {
    setSubmitting(true);
    const result = await createTask(data);
    setSubmitting(false);
    if (result) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors active:scale-95"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm transition-colors">
        <div className="border-b border-slate-100 dark:border-slate-850 pb-4 mb-6">
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
            Deploy New Task
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Define task parameters, assign teammate workload, and trigger notifications.
          </p>
        </div>

        <TaskForm onSubmit={handleCreateTask} loading={submitting} />
      </div>
    </div>
  );
}
