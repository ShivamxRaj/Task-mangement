'use client';

import React, { useState, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority } from '../../types';
import TaskCard from './TaskCard';
import { useAuth } from '../../hooks/useAuth';
import { Search, Grid, List, CheckCircle, Clock, ListTodo } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

type ScopeFilter = 'all' | 'assigned_to_me' | 'created_by_me';

export const TaskList: React.FC<TaskListProps> = ({ tasks, onComplete, onDelete }) => {
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      if (scopeFilter === 'assigned_to_me') {
        if (task.assigned_to !== user?.id) return false;
      } else if (scopeFilter === 'created_by_me') {
        if (task.created_by !== user?.id) return false;
      }

      if (statusFilter !== 'all' && task.status !== statusFilter) return false;

      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      return true;
    });
  }, [tasks, searchTerm, scopeFilter, statusFilter, priorityFilter, user?.id]);

  const columns: { status: TaskStatus; label: string; icon: React.ReactNode; colorClass: string }[] = [
    { 
      status: 'todo', 
      label: 'To Do', 
      icon: <ListTodo size={16} className="text-slate-500" />,
      colorClass: 'border-t-slate-400 bg-slate-50/50 dark:bg-slate-900/10'
    },
    { 
      status: 'in_progress', 
      label: 'In Progress', 
      icon: <Clock size={16} className="text-blue-500" />,
      colorClass: 'border-t-blue-500 bg-blue-50/10 dark:bg-blue-950/5'
    },
    { 
      status: 'completed', 
      label: 'Completed', 
      icon: <CheckCircle size={16} className="text-emerald-500" />,
      colorClass: 'border-t-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/5'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-colors">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search task titles, instructions, parameters..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-855">
            {(['all', 'assigned_to_me', 'created_by_me'] as ScopeFilter[]).map((scope) => (
              <button
                key={scope}
                onClick={() => setScopeFilter(scope)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  scopeFilter === scope
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {scope === 'all' && 'All Scope'}
                {scope === 'assigned_to_me' && 'Assigned to Me'}
                {scope === 'created_by_me' && 'Assigned by Me'}
              </button>
            ))}
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
            className="px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          {viewMode === 'list' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
              className="px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          )}

          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-3">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'board'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                  : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
              title="Board View"
              aria-label="Board View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                  : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
              title="List View"
              aria-label="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-center shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <Search size={22} />
          </div>
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1.5">No Tasks Found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
            No matching tasks fit your search descriptors or scope criteria. Try modifying your parameters.
          </p>
        </div>
      )}

      {filteredTasks.length > 0 && (
        viewMode === 'board' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {columns.map((col) => {
              const columnTasks = filteredTasks.filter(t => t.status === col.status);
              
              return (
                <div 
                  key={col.status} 
                  className={`flex flex-col gap-4 border-t-2 ${col.colorClass} p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 min-h-[500px] shadow-sm`}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                    <div className="flex items-center gap-2">
                      {col.icon}
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{col.label}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {columnTasks.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] pr-1.5 scrollbar-thin">
                    {columnTasks.length === 0 ? (
                      <div className="text-center py-10 text-xs text-slate-400 dark:text-slate-500 font-semibold border border-dashed border-slate-200/40 dark:border-slate-850 rounded-xl bg-slate-50/20 dark:bg-slate-900/5">
                        No tasks here
                      </div>
                    ) : (
                      columnTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onComplete={onComplete}
                          onDelete={onDelete}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={onComplete}
                onDelete={onDelete}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
};
export default TaskList;
