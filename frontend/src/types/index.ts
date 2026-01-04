// 博客文章类型
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  category?: string;
  category_id?: string | number;
  createdAt?: Date;
  created_at?: string;
  view_count?: number;
  status?: string;
  tags: string[];
  cover_image?: string;
}

// 评论类型
export interface Comment {
  id: string | number;
  blog_id: number;
  user_id: string;
  username: string;
  content: string;
  author_name?: string;
  author_ip?: string;
  parent_id?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// 问答项目类型
export interface QAItem {
  id: number;
  question: string;
  answer: string;
  likes: number;
  createdAt?: Date;
  created_at?: string;
  answer_time?: string;
  questioner_ip?: string;
}

// 个人信息类型
export interface Profile {
  name: string;
  age: number;
  location: string;
  qq: string;
  interests: string[];
  motto: string;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// 用户信息类型
export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}