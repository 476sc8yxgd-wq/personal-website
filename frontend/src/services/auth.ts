import { supabase } from '../config/supabase';

// 用户认证API
export const authApi = {
  // 注册
  signUp: async (email: string, password: string, options?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options
      });
      
      if (error) {
        console.error('注册失败:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('注册时发生错误:', error);
      throw error;
    }
  },
  
  // 登录
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('登录失败:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('登录时发生错误:', error);
      throw error;
    }
  },
  
  // 登出
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('登出失败:', error);
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('登出时发生错误:', error);
      throw error;
    }
  },
  
  // 获取当前用户
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('获取当前用户失败:', error);
        throw error;
      }
      
      return user;
    } catch (error) {
      console.error('获取当前用户时发生错误:', error);
      throw error;
    }
  },
  
  // 重置密码
  resetPassword: async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        console.error('重置密码失败:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('重置密码时发生错误:', error);
      throw error;
    }
  },
  
  // 监听认证状态变化
  onAuthStateChange: (callback: (event: any, session: any) => void) => {
    try {
      return supabase.auth.onAuthStateChange(callback);
    } catch (error) {
      console.error('监听认证状态变化时发生错误:', error);
      throw error;
    }
  }
};