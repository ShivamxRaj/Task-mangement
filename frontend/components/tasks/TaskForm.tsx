'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { useUsers } from '../../hooks/useUsers';
import Button from '../ui/Button';
import { Sparkles } from 'lucide-react';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string(),
  priority: z.enum(['low', 'medium', 'high'] as const),
  status: z.enum(['todo', 'in_progress', 'completed'] as const),
  assigned_to: z.string().nullable().optional(),
  due_date: z.string().nullable().optional()
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  initialData?: Task;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({ initialData, onSubmit, loading = false }) => {
  const { users, loading: loadingUsers } = useUsers();
  const [smartSuggestion, setSmartSuggestion] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'medium',
      status: initialData?.status || 'todo',
      assigned_to: initialData?.assigned_to || '',
      due_date: initialData?.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : '',
    }
  });

  const selectedPriority = watch('priority');

  useEffect(() => {
    const calcSuggestion = () => {
      const now = new Date();
      let daysToAdd = 3;
      if (selectedPriority === 'high') daysToAdd = 1;
      if (selectedPriority === 'low') daysToAdd = 7;

      now.setDate(now.getDate() + daysToAdd);
      const formattedDate = now.toISOString().split('T')[0];
      setSmartSuggestion(formattedDate);
    };

    calcSuggestion();
  }, [selectedPriority]);

  const applySmartDate = () => {
    if (smartSuggestion) {
      setValue('due_date', smartSuggestion);
    }
  };

  const formattedSuggestionText = () => {
    if (!smartSuggestion) return '';
    const date = new Date(smartSuggestion);
    const dayStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    let label = '3 days';
    if (selectedPriority === 'high') label = '1 day';
    if (selectedPriority === 'low') label = '7 days';
    return `${dayStr} (${label})`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Task Title
        </label>
        <input
          type="text"
          {...register('title')}
          placeholder="e.g. Implement payment gateway integration"
          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 transition-all text-sm"
        />
        {errors.title && (
          <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Description
        </label>
        <textarea
          {...register('description')}
          placeholder="Describe the task specifications, scope, and instructions..."
          rows={4}
          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 transition-all leading-relaxed"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Priority Level
          </label>
          <select
            {...register('priority')}
            className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Task Status
          </label>
          <select
            {...register('status')}
            className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Assign To (Teammate)
          </label>
          <select
            {...register('assigned_to')}
            className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
            disabled={loadingUsers}
          >
            <option value="">Unassigned</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.full_name || user.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Due Date
            </label>
            {smartSuggestion && (
              <button
                type="button"
                onClick={applySmartDate}
                className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline active:scale-95 transition-all"
                title="Autofill based on priority suggestion"
              >
                <Sparkles size={11} />
                <span>Suggest: {formattedSuggestionText()}</span>
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="date"
              {...register('due_date')}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-850">
        <Button
          type="submit"
          loading={loading}
          className="w-full md:w-auto"
        >
          {initialData ? 'Update Task Specifications' : 'Deploy New Task'}
        </Button>
      </div>
    </form>
  );
};
export default TaskForm;
