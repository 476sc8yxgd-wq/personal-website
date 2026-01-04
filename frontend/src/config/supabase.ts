import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase 配置 - 硬编码配置以避免环境变量加载问题
// TODO: 确认工作后改回环境变量
const supabaseUrl = 'https://assfhuxuglbootvpigeu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzc2ZodXh1Z2xib290dnBpZ2V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzOTIzNjUsImV4cCI6MjA4MTk2ODM2NX0.bTWc11pGIvy9Fz5O_9Gch3ZJEVP2pdKlTT5N79gcWCA';

// 创建 Supabase 客户端实例
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export default supabase;