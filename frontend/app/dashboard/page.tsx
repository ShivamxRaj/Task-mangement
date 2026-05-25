'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useTasks } from '@/hooks/useTasks';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CheckSquare, Calendar, User, Clock, CheckCircle, BarChart3, Plus, Keyboard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { tasks, loading: tasksLoading, createTask, completeTask, deleteTask } = useTasks();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsCreateModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const assignedToMe = tasks.filter(t => t.assigned_to === user?.id).length;

  const stats = [
    { label: 'Total Tasks', value: totalTasks, icon: <CheckSquare className="text-slate-500" />, desc: 'Workspace total tasks' },
    { label: 'Completed', value: completedTasks, icon: <CheckCircle className="text-emerald-500" />, desc: 'Successfully finalized' },
    { label: 'In Progress', value: inProgressTasks, icon: <Clock className="text-blue-500" />, desc: 'Actively working' },
    { label: 'Assigned to Me', value: assignedToMe, icon: <User className="text-indigo-500" />, desc: 'Personal workload' },
  ];

  const chartData = [
    { name: 'To Do', count: tasks.filter(t => t.status === 'todo').length, color: '#94A3B8' },
    { name: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length, color: '#3B82F6' },
    { name: 'Completed', count: tasks.filter(t => t.status === 'completed').length, color: '#10B981' }
  ];

  const handleCreateTask = async (data: any) => {
    setSubmitting(true);
    const result = await createTask(data);
    setSubmitting(false);
    if (result) {
      setIsCreateModalOpen(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
            Workspace Dashboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
            <span>Collaborate, update statuses, and monitor team benchmarks.</span>
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50 font-bold">
              <Keyboard size={10} />
              Ctrl+N
            </span>
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          <span>New Task</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="glass-panel border border-slate-200/40 dark:border-slate-800/40 rounded-2xl p-5 shadow-sm transition-all duration-200"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {stat.label}
              </span>
              <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-850">
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-950 dark:text-white font-display">
              {tasksLoading ? (
                <div className="h-8 w-12 bg-slate-200 dark:bg-slate-800 animate-pulse rounded"></div>
              ) : (
                stat.value
              )}
            </div>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-550 mt-1 block">
              {stat.desc}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-blue-500" />
              <span>Workspace Analytics</span>
            </h3>
          </div>

          <div className="h-64 w-full">
            {tasksLoading ? (
              <div className="h-full w-full bg-slate-100 dark:bg-slate-900 animate-pulse rounded-xl"></div>
            ) : totalTasks === 0 ? (
              <div className="h-full flex items-center justify-center text-xs font-bold text-slate-405">
                No task metrics available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748B" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#64748B" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={45}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
              <Keyboard size={18} className="text-indigo-500" />
              <span>Keyboard Shortcuts</span>
            </h3>
            
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-850 pb-2">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Open New Task Form</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-extrabold border border-slate-200/50 dark:border-slate-700/50">
                  Ctrl + N
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-850 pb-2">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Close Modal Popups</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-extrabold border border-slate-200/50 dark:border-slate-700/50">
                  Escape
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/20 text-xs text-blue-700 dark:text-blue-300 mt-4 font-semibold leading-relaxed">
            💡 Quick Tip: Selecting High Priority automatically sets the due date to 24 hours from today.
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
          Task Workspace
        </h3>

        {tasksLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-900 h-48 space-y-4 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mt-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            onComplete={completeTask}
            onDelete={deleteTask}
          />
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Deploy New Workspace Task"
      >
        <TaskForm onSubmit={handleCreateTask} loading={submitting} />
      </Modal>
    </div>
  );
}
