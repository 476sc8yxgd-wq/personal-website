import { supabase } from '../config/supabase';
import { Blog, BlogCategory, BlogTag } from '../types';

export class BlogModel {
  /**
   * 获取博客列表（分页）
   * @param page 页码（从0开始）
   * @param limit 每页数量
   * @param categoryId 分类ID（可选）
   * @returns 博客列表和总数
   */
  static async getBlogs(page: number = 0, limit: number = 10, categoryId?: number): Promise<{
    blogs: Blog[];
    total: number;
  }> {
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
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      // 如果指定了分类ID，则筛选该分类
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data: blogs, error, count } = await query;
      
      if (error) {
        console.error('获取博客列表失败:', error);
        throw error;
      }

      // 获取总数
      const { count: totalCount } = await supabase
        .from('blogs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .eq('category_id', categoryId || null);
      
      return {
        blogs: blogs as Blog[],
        total: totalCount || 0
      };
    } catch (error) {
      console.error('获取博客列表时发生错误:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取博客详情
   * @param id 博客ID
   * @returns 博客详情
   */
  static async getBlogById(id: number): Promise<Blog | null> {
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
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('获取博客详情失败:', error);
        throw error;
      }

      if (!blog) {
        return null;
      }

      // 确保blog不为undefined
      const blogData = blog as Blog;

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
            .eq('blog_id', id)
            .then(({ data }) => data?.map(item => item.tag_id) || [])
        );

      // 增加浏览量
      await supabase
        .from('blogs')
        .update({ view_count: blogData.view_count + 1 })
        .eq('id', id);

      return {
        ...blog,
        tags: tags || []
      } as Blog;
    } catch (error) {
      console.error('获取博客详情时发生错误:', error);
      throw error;
    }
  }

  /**
   * 创建新博客
   * @param blogData 博客数据
   * @param tagIds 标签ID数组（可选）
   * @returns 创建的博客记录
   */
  static async createBlog(blogData: Partial<Blog>, tagIds?: number[]): Promise<Blog> {
    try {
      // 开始事务
      const { data: blog, error } = await supabase
        .from('blogs')
        .insert(blogData)
        .select()
        .single();
      
      if (error) {
        console.error('创建博客失败:', error);
        throw error;
      }

      const newBlog = blog as Blog;

      // 如果有标签，创建标签关联
      if (tagIds && tagIds.length > 0) {
        const tagRelations = tagIds.map(tagId => ({
          blog_id: newBlog.id,
          tag_id: tagId
        }));

        await supabase
          .from('blog_tag_relations')
          .insert(tagRelations);
      }

      return newBlog;
    } catch (error) {
      console.error('创建博客时发生错误:', error);
      throw error;
    }
  }

  /**
   * 更新博客
   * @param id 博客ID
   * @param blogData 更新的博客数据
   * @param tagIds 标签ID数组（可选）
   * @returns 更新后的博客记录
   */
  static async updateBlog(id: number, blogData: Partial<Blog>, tagIds?: number[]): Promise<Blog> {
    try {
      // 更新博客基本信息
      const { data: blog, error } = await supabase
        .from('blogs')
        .update(blogData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('更新博客失败:', error);
        throw error;
      }

      // 如果指定了标签，先删除旧关联，再创建新关联
      if (tagIds !== undefined) {
        // 删除旧关联
        await supabase
          .from('blog_tag_relations')
          .delete()
          .eq('blog_id', id);

        // 创建新关联
        if (tagIds && tagIds.length > 0) {
          const tagRelations = tagIds.map(tagId => ({
            blog_id: id,
            tag_id: tagId
          }));

          await supabase
            .from('blog_tag_relations')
            .insert(tagRelations);
        }
      }

      return blog as Blog;
    } catch (error) {
      console.error('更新博客时发生错误:', error);
      throw error;
    }
  }

  /**
   * 删除博客
   * @param id 博客ID
   * @returns 删除结果
   */
  static async deleteBlog(id: number): Promise<void> {
    try {
      // 删除博客（会级联删除相关评论和标签关联）
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('删除博客失败:', error);
        throw error;
      }
    } catch (error) {
      console.error('删除博客时发生错误:', error);
      throw error;
    }
  }

  /**
   * 获取博客分类列表
   * @returns 博客分类列表
   */
  static async getCategories(): Promise<BlogCategory[]> {
    try {
      const { data: categories, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('获取博客分类失败:', error);
        throw error;
      }
      
      return categories as BlogCategory[];
    } catch (error) {
      console.error('获取博客分类时发生错误:', error);
      throw error;
    }
  }

  /**
   * 创建博客分类
   * @param categoryData 分类数据
   * @returns 创建的分类记录
   */
  static async createCategory(categoryData: Partial<BlogCategory>): Promise<BlogCategory> {
    try {
      const { data: category, error } = await supabase
        .from('blog_categories')
        .insert(categoryData)
        .select()
        .single();
      
      if (error) {
        console.error('创建博客分类失败:', error);
        throw error;
      }
      
      return category as BlogCategory;
    } catch (error) {
      console.error('创建博客分类时发生错误:', error);
      throw error;
    }
  }

  /**
   * 获取博客标签列表
   * @returns 博客标签列表
   */
  static async getTags(): Promise<BlogTag[]> {
    try {
      const { data: tags, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('获取博客标签失败:', error);
        throw error;
      }
      
      return tags as BlogTag[];
    } catch (error) {
      console.error('获取博客标签时发生错误:', error);
      throw error;
    }
  }

  /**
   * 创建博客标签
   * @param tagData 标签数据
   * @returns 创建的标签记录
   */
  static async createTag(tagData: Partial<BlogTag>): Promise<BlogTag> {
    try {
      const { data: tag, error } = await supabase
        .from('blog_tags')
        .insert(tagData)
        .select()
        .single();
      
      if (error) {
        console.error('创建博客标签失败:', error);
        throw error;
      }
      
      return tag as BlogTag;
    } catch (error) {
      console.error('创建博客标签时发生错误:', error);
      throw error;
    }
  }
}