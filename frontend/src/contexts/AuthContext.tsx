import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  username: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const usernameToEmail = (username: string): string => {
  return `${username}@local.dev`;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user?.user_metadata?.username) {
        setUsername(session.user.user_metadata.username);
      }
      
      if (session?.user?.user_metadata?.username === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user?.user_metadata?.username) {
        setUsername(session.user.user_metadata.username);
      }
      
      if (session?.user?.user_metadata?.username === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const email = usernameToEmail(username);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: '登录失败，请稍后重试' };
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const email = usernameToEmail(username);
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username: username,
            email_confirmed: true
          },
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      const loginResult = await login(username, password);
      if (!loginResult.success) {
        return { success: false, error: '注册成功但自动登录失败，请手动登录' };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: '注册失败，请稍后重试' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUsername('');
    setIsAdmin(false);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    username
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};