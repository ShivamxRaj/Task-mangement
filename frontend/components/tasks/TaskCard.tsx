'use client';

import React from 'react';
import { Task } from '../../types';
import { TaskStatusBadge, TaskPriorityBadge } from './TaskStatusBadge';
import { Calendar, UserPlus, CheckCircle, Trash2, Edit3, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface TaskCardProps {
  task: Task;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onDelete }) => {
  const isOverdue = (): boolean => {
    if (!task.due_date || task.status === 'completed') return false;
    const due = new Date(task.due_date);
    const now = new Date();
    return due < now;
  };

  const formattedDueDate = (): string => {
    if (!task.due_date) return '';
    return new Date(task.due_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="group border border-slate-200/80 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-200 flex flex-col justify-between min-h-[200px]">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <TaskStatusBadge status={task.status} />
            <TaskPriorityBadge priority={task.priority} />
          </div>
          
          {isOverdue() && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 animate-pulse">
              <AlertCircle size={10} />
              OVERDUE
            </span>
          )}
        </div>

        <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          <Link href={`/tasks/${task.id}`}>
            {task.title}
          </Link>
        </h4>

        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
          {task.description || 'No description provided.'}
        </p>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800/50 pt-4 mt-auto">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            {task.due_date && (
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${isOverdue() ? 'text-rose-600 dark:text-rose-450' : 'text-slate-450 dark:text-slate-550'}`}>
                <Calendar size={13} />
                <span>{formattedDueDate()}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              {task.assigned_to_profile ? (
                <div className="flex items-center gap-1" title={`Assigned to ${task.assigned_to_profile.full_name}`}>
                  {task.assigned_to_profile.avatar_url ? (
                    <img
                      src={task.assigned_to_profile.avatar_url}
                      alt={task.assigned_to_profile.full_name}
                      className="h-5 w-5 rounded-full border border-slate-200 dark:border-slate-850 object-cover"
                    />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {task.assigned_to_profile.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[80px] hidden sm:inline">
                    {task.assigned_to_profile.full_name?.split(' ')[0]}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500" title="Unassigned">
                  <UserPlus size={13} />
                  <span className="text-[11px] font-medium hidden sm:inline">Assign</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 pl-1 ml-auto border-l border-slate-100 dark:border-slate-800/80">
            {task.status !== 'completed' && onComplete && (
              <button
                onClick={() => onComplete(task.id)}
                className="p-1.5 rounded-md text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                title="Mark Completed"
                aria-label="Mark Completed"
              >
                <CheckCircle size={15} />
              </button>
            )}
            
            <Link
              href={`/tasks/${task.id}`}
              className="p-1.5 rounded-md text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Edit Task"
              aria-label="Edit Task"
            >
              <Edit3 size={15} />
            </Link>

            {onDelete && (
              <button
                onClick={() => onDelete(task.id)}
                className="p-1.5 rounded-md text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                title="Delete Task"
                aria-label="Delete Task"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default TaskCard;
