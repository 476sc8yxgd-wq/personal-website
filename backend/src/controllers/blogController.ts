import { Request, Response } from 'express';
import { BlogModel } from '../models/Blog';

// 获取博客列表
export const getBlogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    
    const { blogs, total } = await BlogModel.getBlogs(page, limit, categoryId);
    
    res.status(200).json({
      success: true,
      data: { blogs, total },
      message: '获取博客列表成功'
    });
  } catch (error) {
    console.error('Error in getBlogs:', error);
    res.status(500).json({
      success: false,
      message: '获取博客列表失败'
    });
  }
};

// 获取单篇博客
export const getBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const blog = await BlogModel.getBlogById(parseInt(id));
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: '博客不存在'
      });
    }
    
    res.status(200).json({
      success: true,
      data: blog,
      message: '获取博客成功'
    });
  } catch (error) {
    console.error('Error in getBlog:', error);
    res.status(500).json({
      success: false,
      message: '获取博客失败'
    });
  }
};

// 创建博客
export const createBlog = async (req: Request, res: Response) => {
  try {
    const { title, content, category_id, author, status, tagIds } = req.body;
    
    // 验证必填字段
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: '标题和内容不能为空'
      });
    }
    
    const blogData = {
      title,
      content,
      category_id,
      author: author || '博主',
      status: status || 'published',
      view_count: 0
    };
    
    const newBlog = await BlogModel.createBlog(blogData, tagIds);
    
    res.status(201).json({
      success: true,
      data: newBlog,
      message: '创建博客成功'
    });
  } catch (error) {
    console.error('Error in createBlog:', error);
    res.status(500).json({
      success: false,
      message: '创建博客失败'
    });
  }
};

// 获取博客分类
export const getBlogCategories = async (req: Request, res: Response) => {
  try {
    const categories = await BlogModel.getCategories();
    
    res.status(200).json({
      success: true,
      data: categories,
      message: '获取博客分类成功'
    });
  } catch (error) {
    console.error('Error in getBlogCategories:', error);
    res.status(500).json({
      success: false,
      message: '获取博客分类失败'
    });
  }
};

// 获取博客标签
export const getBlogTags = async (req: Request, res: Response) => {
  try {
    const tags = await BlogModel.getTags();
    
    res.status(200).json({
      success: true,
      data: tags,
      message: '获取博客标签成功'
    });
  } catch (error) {
    console.error('Error in getBlogTags:', error);
    res.status(500).json({
      success: false,
      message: '获取博客标签失败'
    });
  }
};

// 创建博客分类
export const createBlogCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '分类名称不能为空'
      });
    }
    
    const newCategory = await BlogModel.createCategory({ name, description });
    
    res.status(201).json({
      success: true,
      data: newCategory,
      message: '创建博客分类成功'
    });
  } catch (error) {
    console.error('Error in createBlogCategory:', error);
    res.status(500).json({
      success: false,
      message: '创建博客分类失败'
    });
  }
};