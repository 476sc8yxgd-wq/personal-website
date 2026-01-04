// 数据库实体类型定义

export interface Profile {
  id: number;
  name: string;
  age: number;
  location: string;
  qq: string;
  motto?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface BlogTag {
  id: number;
  name: string;
  created_at: string;
}

export interface Blog {
  id: number;
  title: string;
  content: string;
  category_id?: number;
  author?: string;
  view_count?: number;
  status?: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  blog_categories?: BlogCategory;
  tags?: BlogTag[];
}

export interface QA {
  id: number;
  question: string;
  answer?: string;
  questioner_ip?: string;
  question_time?: string;
  answer_time?: string;
  likes?: number;
  status?: 'pending' | 'answered';
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  blog_id: number;
  content: string;
  author_name: string;
  author_ip?: string;
  parent_id?: number;
  status?: 'pending' | 'approved';
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: number;
  username: string;
  password: string;
  email?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}