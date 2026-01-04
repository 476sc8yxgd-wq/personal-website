import { supabase } from '../config/supabase';
import { BlogPost, QAItem, Profile, Comment } from '../types';

// 个人信息API
export const profileApi = {
  getProfile: async (): Promise<Profile> => {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .single();
      
      if (error) {
        console.error('获取个人信息失败:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('获取个人信息时发生错误:', error);
      throw error;
    }
  },
  
  updateProfile: async (profileData: Partial<Profile>): Promise<Profile> => {
    try {
      const { data, error } = await supabase
        .from('profile')
        .update(profileData)
        .eq('id', 1)
        .select()
        .single();
      
      if (error) {
        console.error('更新个人信息失败:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('更新个人信息时发生错误:', error);
      throw error;
    }
  }
};

// 博客API
export const blogApi = {
  getBlogs: async (page = 0, limit = 10, categoryId?: number): Promise<{ blogs: BlogPost[], total: number }> => {
    try {
      let query = supabase
        .from('blogs')
        .select(`
          *,
          blog_categories(
            id,
            name,
            description
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      // 如果指定了分类ID，则筛选该分类
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data: blogs, error } = await query
        .range(page * limit, (page + 1) * limit - 1);

      if (error) {
        console.error('获取博客列表失败:', error);
        throw error;
      }

      // 调试：查看返回的博客数据
      console.log('[blogApi.getBlogs] 返回的博客数据:', blogs);
      blogs?.forEach((blog: any, index: number) => {
        console.log(`[blogApi.getBlogs] 博客 ${index + 1}:`, {
          id: blog.id,
          title: blog.title,
          cover_image: blog.cover_image,
          所有字段: Object.keys(blog)
        });
      });

      // 获取总数 - 修复：使用条件判断，只在有 categoryId 时才添加过滤
      let countQuery = supabase
        .from('blogs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');
      
      if (categoryId) {
        countQuery = countQuery.eq('category_id', categoryId);
      }
      
      const { count: totalCount } = await countQuery;
      
      return {
        blogs: blogs || [],
        total: totalCount || 0
      };
    } catch (error) {
      console.error('获取博客列表时发生错误:', error);
      throw error;
    }
  },
  
  getBlog: async (id: string): Promise<BlogPost> => {
    try {
      // 获取博客详情
      const { data: blog, error } = await supabase
        .from('blogs')
        .select(`
          *,
          blog_categories(
            id,
            name,
            description
          )
        `)
        .eq('id', parseInt(id))
        .single();
      
      if (error) {
        console.error('获取博客详情失败:', error);
        throw error;
      }

      if (!blog) {
        throw new Error('博客不存在');
      }

      // 获取博客标签
      const { data: tags } = await supabase
        .from('blog_tags')
        .select(`
          id,
          name
        `)
        .in('id', 
          await supabase
            .from('blog_tag_relations')
            .select('tag_id')
            .eq('blog_id', parseInt(id))
            .then(({ data }) => data?.map(item => item.tag_id) || [])
        );

      // 增加浏览量
      await supabase
        .from('blogs')
        .update({ view_count: (blog as any).view_count + 1 })
        .eq('id', parseInt(id));

      return {
        ...blog,
        tags: tags || []
      } as BlogPost;
    } catch (error) {
      console.error('获取博客详情时发生错误:', error);
      throw error;
    }
  },
  
  getCategories: async (): Promise<any[]> => {
    try {
      const { data: categories, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('获取博客分类失败:', error);
        throw error;
      }
      
      return categories || [];
    } catch (error) {
      console.error('获取博客分类时发生错误:', error);
      throw error;
    }
  },
  
  getTags: async (): Promise<any[]> => {
    try {
      const { data: tags, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('获取博客标签失败:', error);
        throw error;
      }
      
      return tags || [];
    } catch (error) {
      console.error('获取博客标签时发生错误:', error);
      throw error;
    }
  },

  createBlog: async (blogData: { title: string; content: string; category_id: string; cover_image?: string }): Promise<BlogPost> => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .insert({
          title: blogData.title,
          content: blogData.content,
          category_id: parseInt(blogData.category_id),
          cover_image: blogData.cover_image,
          status: 'published',
          view_count: 0,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('创建博客失败:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('创建博客时发生错误:', error);
      throw error;
    }
  },

  createCategory: async (categoryData: { name: string; description: string }): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .insert({
          name: categoryData.name,
          description: categoryData.description,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('创建分类失败:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('创建分类时发生错误:', error);
      throw error;
    }
  },

  deleteCategory: async (id: number): Promise<void> => {
    try {
      console.log(`[deleteCategory] 开始删除分类，ID: ${id}`);

      // 步骤1: 先将所有引用该分类的博客的 category_id 设置为 NULL
      console.log(`[deleteCategory] 步骤1: 更新引用该分类的博客`);
      const { error: updateError } = await supabase
        .from('blogs')
        .update({ category_id: null })
        .eq('category_id', id);

      if (updateError) {
        console.error('[deleteCategory] 更新博客分类失败:', updateError);
        throw updateError;
      }
      console.log(`[deleteCategory] 步骤1完成: 博客分类已更新`);

      // 步骤2: 删除分类
      console.log(`[deleteCategory] 步骤2: 删除分类`);
      const { error } = await supabase
        .from('blog_categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[deleteCategory] 删除分类失败:', error);
        console.error('[deleteCategory] 错误详情:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log(`[deleteCategory] 步骤2完成: 分类已删除`);
    } catch (error) {
      console.error('[deleteCategory] 删除分类时发生错误:', error);
      throw error;
    }
  },

  updateBlog: async (id: string, blogData: Partial<BlogPost>): Promise<BlogPost> => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .update(blogData)
        .eq('id', parseInt(id))
        .select()
        .single();

      if (error) {
        console.error('更新博客失败:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('更新博客时发生错误:', error);
      throw error;
    }
  },

  deleteBlog: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', parseInt(id));

      if (error) {
        console.error('删除博客失败:', error);
        throw error;
      }
    } catch (error) {
      console.error('删除博客时发生错误:', error);
      throw error;
    }
  }
};

// 问答API
export const qaApi = {
  getQuestions: async (page = 0, limit = 10, status?: 'pending' | 'answered'): Promise<{ questions: QAItem[], total: number }> => {
    try {
      let query = supabase
        .from('qa')
        .select('*')
        .order('created_at', { ascending: false });

      // 如果指定了状态，则筛选该状态
      if (status) {
        query = query.eq('status', status);
      }

      const { data: questions, error } = await query
        .range(page * limit, (page + 1) * limit - 1);
      
      if (error) {
        console.error('获取问答列表失败:', error);
        throw error;
      }

      // 获取总数 - 修复：使用条件判断，只在有 status 时才添加过滤
      let countQuery = supabase
        .from('qa')
        .select('*', { count: 'exact', head: true });
      
      if (status) {
        countQuery = countQuery.eq('status', status);
      }
      
      const { count: totalCount } = await countQuery;
      
      return {
        questions: questions || [],
        total: totalCount || 0
      };
    } catch (error) {
      console.error('获取问答列表时发生错误:', error);
      throw error;
    }
  },
  
  askQuestion: async (question: string): Promise<QAItem> => {
    try {
      // 获取用户IP（前端无法直接获取，使用默认值）
      const questionerIp = 'unknown';
      
      const { data, error } = await supabase
        .from('qa')
        .insert({
          question,
          status: 'pending',
          questioner_ip: questionerIp,
          question_time: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('提交问题失败:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('提交问题时发生错误:', error);
      throw error;
    }
  },
  
  likeQuestion: async (id: number): Promise<QAItem> => {
    try {
      // 先获取当前点赞数
      const { data: question } = await supabase
        .from('qa')
        .select('likes')
        .eq('id', id)
        .single();

      if (!question) {
        throw new Error('问题不存在');
      }

      // 增加点赞数
      const { data: updatedQuestion, error } = await supabase
        .from('qa')
        .update({
          likes: (question as any).likes + 1
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('点赞问题失败:', error);
        throw error;
      }
      
      return updatedQuestion;
    } catch (error) {
      console.error('点赞问题时发生错误:', error);
      throw error;
    }
  },

  answerQuestion: async (id: number, answer: string): Promise<QAItem> => {
    try {
      const { data, error } = await supabase
        .from('qa')
        .update({
          answer: answer,
          status: 'answered',
          answer_time: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('回答问题失败:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('回答问题时发生错误:', error);
      throw error;
    }
  },

  deleteQuestion: async (id: number): Promise<void> => {
    try {
      console.log(`[qaApi] 准备删除问答，ID: ${id}`);
      const { error, count } = await supabase
        .from('qa')
        .delete()
        .eq('id', id);

      console.log(`[qaApi] 删除结果:`, { error, count });

      if (error) {
        console.error('删除问题失败:', error);
        throw error;
      }

      if (count === 0) {
        console.warn(`[qaApi] 警告: 删除了 ${count} 条记录，ID: ${id}`);
      }
    } catch (error) {
      console.error('删除问题时发生错误:', error);
      throw error;
    }
  }
};

// 评论API
export const commentApi = {
  // 获取博客评论列表
  getComments: async (blogId: number): Promise<Comment[]> => {
    try {
      const { data: comments, error } = await supabase
        .from('comments')
        .select('*')
        .eq('blog_id', blogId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取评论列表失败:', error);
        throw error;
      }

      return comments || [];
    } catch (error) {
      console.error('获取评论列表时发生错误:', error);
      throw error;
    }
  },

  // 添加评论
  addComment: async (blogId: number, userId: string, username: string, content: string): Promise<Comment> => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          blog_id: blogId,
          user_id: userId,
          username: username,
          content: content
        })
        .select()
        .single();

      if (error) {
        console.error('添加评论失败:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('添加评论时发生错误:', error);
      throw error;
    }
  },

  // 删除评论
  deleteComment: async (commentId: string, userId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', parseInt(commentId))
        .eq('user_id', userId);

      if (error) {
        console.error('删除评论失败:', error);
        throw error;
      }
    } catch (error) {
      console.error('删除评论时发生错误:', error);
      throw error;
    }
  }
};