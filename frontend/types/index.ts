export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  created_at?: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  created_by: string;
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  created_by_profile?: User | null;
  assigned_to_profile?: User | null;
}

export interface NotificationLog {
  id: string;
  user_id: string;
  task_id: string;
  type: 'task_created' | 'task_assigned' | 'task_completed';
  sent_at: string;
  email_sent: boolean;
}
