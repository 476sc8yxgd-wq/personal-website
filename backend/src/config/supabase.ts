import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL || 'https://default.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'default-service-key';

// 创建 Supabase 客户端实例
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export default supabase;