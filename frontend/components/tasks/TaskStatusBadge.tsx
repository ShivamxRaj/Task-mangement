import React from 'react';
import { TaskStatus, TaskPriority } from '../../types';

interface StatusBadgeProps {
  status: TaskStatus;
}

export const TaskStatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const configs = {
    todo: {
      label: 'To Do',
      classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/80',
    },
    in_progress: {
      label: 'In Progress',
      classes: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30',
    },
    completed: {
      label: 'Completed',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
    },
  };

  const config = configs[status] || configs.todo;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${config.classes}`}>
      {config.label}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export const TaskPriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const configs = {
    low: {
      label: 'Low',
      classes: 'bg-emerald-50/50 text-emerald-600 dark:bg-emerald-950/10 dark:text-emerald-500',
    },
    medium: {
      label: 'Medium',
      classes: 'bg-amber-50/50 text-amber-600 dark:bg-amber-950/10 dark:text-amber-500',
    },
    high: {
      label: 'High',
      classes: 'bg-rose-50/50 text-rose-600 dark:bg-rose-950/10 dark:text-rose-500',
    },
  };

  const config = configs[priority] || configs.medium;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${config.classes}`}>
      {config.label}
    </span>
  );
};
