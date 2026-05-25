import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { supabase } from '../lib/supabaseClient';
import { Task, TaskStatus, TaskPriority } from '../types';
import { toast } from 'react-hot-toast';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/tasks');
      if (res.success && res.data) {
        setTasks(res.data);
      } else {
        setError(res.error || 'Failed to fetch tasks');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = async (taskData: {
    title: string;
    description: string;
    priority: TaskPriority;
    assigned_to: string | null;
    due_date: string | null;
  }) => {
    try {
      const res = await api.post('/api/tasks', taskData);
      if (res.success && res.data) {
        toast.success('Task created successfully');
        return res.data as Task;
      } else {
        toast.error(res.error || 'Failed to create task');
        return null;
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create task');
      return null;
    }
  };

  const updateTask = async (taskId: string, updateData: Partial<Task>) => {
    try {
      const res = await api.put(`/api/tasks/${taskId}`, updateData);
      if (res.success && res.data) {
        toast.success('Task updated successfully');
        return res.data as Task;
      } else {
        toast.error(res.error || 'Failed to update task');
        return null;
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update task');
      return null;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const res = await api.delete(`/api/tasks/${taskId}`);
      if (res.success) {
        toast.success('Task deleted successfully');
        setTasks(prev => prev.filter(t => t.id !== taskId));
        return true;
      } else {
        toast.error(res.error || 'Failed to delete task');
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete task');
      return false;
    }
  };

  const assignTask = async (taskId: string, userId: string | null) => {
    try {
      const res = await api.put(`/api/tasks/${taskId}/assign`, { assigned_to: userId });
      if (res.success && res.data) {
        toast.success('Task assigned successfully');
        return res.data as Task;
      } else {
        toast.error(res.error || 'Failed to assign task');
        return null;
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign task');
      return null;
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      const res = await api.put(`/api/tasks/${taskId}/complete`);
      if (res.success && res.data) {
        toast.success('Task completed!');
        return res.data as Task;
      } else {
        toast.error(res.error || 'Failed to complete task');
        return null;
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete task');
      return null;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const channel = supabase.channel('tasks-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    refreshTasks: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    assignTask,
    completeTask,
  };
};
export default useTasks;
