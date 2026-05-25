'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserMetadata: (metadata: { full_name?: string; avatar_url?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there is a mock session first (Developer bypass mode)
    const mockUserStr = localStorage.getItem('mock_user');
    const isMockBypassActive = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                               process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-supabase-project-id");

    if (mockUserStr || isMockBypassActive) {
      if (mockUserStr) {
        try {
          const mockUser = JSON.parse(mockUserStr);
          setUser(mockUser);
          setSession({
            access_token: 'mock-access-token',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'mock-refresh-token',
            user: mockUser,
          } as any);
          setLoading(false);
          return;
        } catch (e) {
          localStorage.removeItem('mock_user');
        }
      }
    }

    // Normal Supabase session checks
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const isMockBypassActive = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                               process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-supabase-project-id");

    if (isMockBypassActive) {
      setLoading(true);
      // Create a mock user payload
      const mockUser = {
        id: 'd9b50e2d-dc99-43ef-b387-052637738f61',
        email: 'intern.developer@example.com',
        user_metadata: {
          full_name: 'Intern Developer',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
        },
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser as any);
      setSession({
        access_token: 'mock-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: mockUser,
      } as any);
      
      setLoading(false);
      window.location.href = '/dashboard';
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error("Google authentication error:", err);
      setLoading(false);
      throw err;
    }
  };

  const signOut = async () => {
    setLoading(true);
    localStorage.removeItem('mock_user');
    
    try {
      // Safely attempt Supabase sign out if configured
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-supabase-project-id")) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn("Supabase signOut error:", err);
    } finally {
      setUser(null);
      setSession(null);
      setLoading(false);
      window.location.href = '/';
    }
  };

  const updateUserMetadata = async (metadata: { full_name?: string; avatar_url?: string }) => {
    const isMockBypassActive = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                               process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-supabase-project-id");

    if (isMockBypassActive) {
      if (!user) return;
      const updatedUser = {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          ...metadata,
        }
      };
      localStorage.setItem('mock_user', JSON.stringify(updatedUser));
      setUser(updatedUser as any);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.updateUser({
        data: metadata
      });
      if (error) throw error;
      setUser(data.user);
    } catch (err) {
      console.error("Update profile metadata error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut, updateUserMetadata }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
