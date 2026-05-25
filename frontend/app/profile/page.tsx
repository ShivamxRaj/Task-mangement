'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useTasks } from '@/hooks/useTasks';
import { api } from '@/lib/api';
import { Mail, Shield, Calendar, Award, CheckSquare, ListTodo, ThumbsUp, Camera, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, updateUserMetadata } = useAuth();
  const router = useRouter();
  const { tasks } = useTasks();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64String = reader.result as string;
        
        const response = await api.put('/api/users/profile', { avatar_url: base64String });
        if (!response.success) {
          throw new Error(response.error || 'Failed to update backend profile.');
        }

        await updateUserMetadata({ avatar_url: base64String });
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      } catch (err: any) {
        console.error('Error uploading photo:', err);
        setUploadError(err.message || 'An error occurred during photo upload.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read file.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

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

  const myAssignedTasks = tasks.filter(t => t.assigned_to === user?.id);
  const myAssignedCount = myAssignedTasks.length;
  const myCompletedCount = myAssignedTasks.filter(t => t.status === 'completed').length;
  const myCreatedCount = tasks.filter(t => t.created_by === user?.id).length;

  const creationDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Not Available';

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
          My Profile
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          View your workload allocation, credentials, and performance analytics.
        </p>
      </div>

      <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm transition-colors space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-850">
          <div className="relative group cursor-pointer">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div 
              onClick={triggerFileInput}
              className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-blue-500 shadow-md group-hover:border-blue-400 transition-all duration-200"
              title="Click to upload profile photo"
            >
              {isUploading ? (
                <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center text-white">
                  <Loader2 size={24} className="animate-spin text-blue-400" />
                </div>
              ) : (
                <>
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata.full_name || 'Profile Picture'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-blue-600 text-white font-extrabold text-3xl flex items-center justify-center">
                      {user?.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200">
                    <Camera size={18} className="mb-0.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Change</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="text-center sm:text-left space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </h3>
            
            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Mail size={14} className="text-slate-400" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Shield size={14} className="text-slate-400" />
                <span>Supabase Verified User (Google OAuth)</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Calendar size={14} className="text-slate-400" />
                <span>Joined: {creationDate}</span>
              </div>
            </div>

            {uploadError && (
              <p className="text-xs font-semibold text-red-500 animate-fadeIn pt-1">
                {uploadError}
              </p>
            )}
            {uploadSuccess && (
              <p className="text-xs font-semibold text-emerald-500 animate-fadeIn pt-1">
                Profile photo updated successfully!
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50 dark:border-slate-850">
            <div className="flex items-center justify-between mb-2 text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Assigned to Me</span>
              <ListTodo size={16} />
            </div>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white font-display">
              {myAssignedCount}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50 dark:border-slate-850">
            <div className="flex items-center justify-between mb-2 text-emerald-500">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completed by Me</span>
              <ThumbsUp size={16} />
            </div>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white font-display">
              {myCompletedCount}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-xl border border-slate-200/50 dark:border-slate-850">
            <div className="flex items-center justify-between mb-2 text-blue-500">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Created by Me</span>
              <CheckSquare size={16} />
            </div>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white font-display">
              {myCreatedCount}
            </span>
          </div>
        </div>
      </div>

      <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm flex items-start gap-4 transition-colors">
        <div className="p-3 bg-blue-50 dark:bg-blue-955 rounded-xl text-blue-600 dark:text-blue-400 flex-shrink-0">
          <Award size={24} />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Performance Insights</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {myAssignedCount > 0 
              ? `You have successfully finalized ${myCompletedCount} out of ${myAssignedCount} tasks assigned to you (${Math.round((myCompletedCount / myAssignedCount) * 100)}% completion rate). Keep up the great momentum!` 
              : 'You do not have any tasks currently assigned to you in the workspace. Explore the dashboard to assign yourself open tasks.'}
          </p>
        </div>
      </div>
    </div>
  );
}
