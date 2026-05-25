'use client';

import React, { useEffect, useState, use } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useTasks } from '@/hooks/useTasks';
import { useUsers } from '@/hooks/useUsers';
import { api } from '@/lib/api';
import { Task, User, TaskStatus, TaskPriority } from '@/types';
import { TaskStatusBadge, TaskPriorityBadge } from '@/components/tasks/TaskStatusBadge';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Calendar, UserPlus, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TaskDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const taskId = resolvedParams.id;
  
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { updateTask, deleteTask } = useTasks();
  const { users } = useUsers();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchTaskDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/tasks/${taskId}`);
      if (res.success && res.data) {
        setTask(res.data);
      } else {
        toast.error(res.error || 'Failed to load task details');
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred fetching task details');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTaskDetails();
    }
  }, [taskId, isAuthenticated]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated || loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!task) return null;

  const isOverdue = (): boolean => {
    if (!task.due_date || task.status === 'completed') return false;
    return new Date(task.due_date) < new Date();
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setUpdating(true);
    const updated = await updateTask(task.id, { status: newStatus });
    setUpdating(false);
    if (updated) {
      setTask(updated);
    }
  };

  const handleAssigneeChange = async (newAssigneeId: string) => {
    setUpdating(true);
    const assigned_to = newAssigneeId === "" ? null : newAssigneeId;
    const updated = await updateTask(task.id, { assigned_to });
    setUpdating(false);
    if (updated) {
      setTask(updated);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      setDeleting(true);
      const success = await deleteTask(task.id);
      setDeleting(false);
      if (success) {
        router.push('/dashboard');
      }
    }
  };

  const isCreator = task.created_by === user?.id;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors active:scale-95"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </Link>

        {isCreator && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors disabled:opacity-50 active:scale-95"
          >
            <Trash2 size={14} />
            <span>Delete Task</span>
          </button>
        )}
      </div>

      <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm transition-colors space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-5">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
              {isOverdue() && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30">
                  <AlertCircle size={10} />
                  OVERDUE
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
              {task.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Status:
            </span>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              disabled={updating}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Description
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-955 p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
            {task.description || 'No description provided.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 text-slate-400 dark:text-slate-555">
              <Calendar size={18} />
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Due Date
              </span>
              <span className={`text-sm font-semibold ${isOverdue() ? 'text-rose-600 dark:text-rose-450' : 'text-slate-800 dark:text-slate-200'}`}>
                {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'No deadline'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 text-slate-400 dark:text-slate-555">
              <UserPlus size={18} />
            </div>
            <div className="flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Assigned Team Member
              </span>
              {isCreator ? (
                <select
                  value={task.assigned_to || ''}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  disabled={updating}
                  className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-transparent border-none p-0 focus:ring-0 focus:outline-none cursor-pointer hover:text-blue-600 transition-colors"
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || u.email}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {task.assigned_to_profile?.full_name || task.assigned_to_profile?.email || 'Unassigned'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-850">
          <span>Created by: <strong>{task.created_by_profile?.full_name || task.created_by_profile?.email || 'Unknown'}</strong></span>
          <span>Logged: <strong>{new Date(task.created_at).toLocaleString()}</strong></span>
          <span>Updated: <strong>{new Date(task.updated_at).toLocaleString()}</strong></span>
        </div>
      </div>

      <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm transition-colors space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-500" />
          <span>Activity Log</span>
        </h3>

        <div className="relative pl-6 border-l border-slate-200 dark:border-slate-850 ml-3 space-y-6">
          <div className="relative">
            <span className="absolute -left-[31px] top-0.5 bg-blue-500 h-4.5 w-4.5 rounded-full border-4 border-white dark:border-slate-900 shadow-sm"></span>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Task Deployed</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Task was created and registered in Supabase by {task.created_by_profile?.full_name || task.created_by_profile?.email}.
              </p>
              <span className="text-[9px] font-bold text-slate-400 block mt-1">
                {new Date(task.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          {task.assigned_to_profile && (
            <div className="relative">
              <span className="absolute -left-[31px] top-0.5 bg-indigo-500 h-4.5 w-4.5 rounded-full border-4 border-white dark:border-slate-900 shadow-sm"></span>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Workload Allocated</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Task was assigned to {task.assigned_to_profile.full_name || task.assigned_to_profile.email}. Email notification dispatched.
                </p>
                <span className="text-[9px] font-bold text-slate-400 block mt-1">
                  {new Date(task.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {task.status === 'completed' && (
            <div className="relative">
              <span className="absolute -left-[31px] top-0.5 bg-emerald-500 h-4.5 w-4.5 rounded-full border-4 border-white dark:border-slate-900 shadow-sm"></span>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Task Completed</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Status updated to completed. Notification emails dispatched to creator and assignee.
                </p>
                <span className="text-[9px] font-bold text-slate-400 block mt-1">
                  {new Date(task.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
