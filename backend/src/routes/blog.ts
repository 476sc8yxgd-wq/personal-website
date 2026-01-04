import express from 'express';
import { getBlogs, getBlog, createBlog, getBlogCategories, getBlogTags, createBlogCategory } from '../controllers/blogController';

const router = express.Router();

// 获取博客列表
router.get('/', getBlogs);

// 获取单篇博客
router.get('/:id', getBlog);

// 创建博客
router.post('/', createBlog);

// 获取博客分类
router.get('/categories/list', getBlogCategories);

// 获取博客标签
router.get('/tags/list', getBlogTags);

// 创建博客分类
router.post('/categories', createBlogCategory);

export default router;