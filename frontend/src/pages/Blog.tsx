import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { blogApi } from '../services/supabase';
import { BlogPost } from '../types';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';

const Blog: React.FC = () => {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const blogsPerPage = 10;
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const { user, username, isAdmin, logout } = useAuth();

  // 博客列表（根据分类缓存10分钟）
  const { data: blogsResponse, loading: blogsLoading, execute: fetchBlogs } = useApi(
    (page: number, limit: number, categoryId?: number) => blogApi.getBlogs(page, limit, categoryId),
    { 
      cacheKey: `blogs-page-${currentPage}-${selectedCategory}`, 
      cacheExpiry: 10 * 60 * 1000,
      retryCount: 3
    }
  );

  // 分类列表（长期缓存60分钟）
  const { data: categories } = useApi(
    blogApi.getCategories,
    { 
      immediate: true, 
      cacheKey: 'blog-categories', 
      cacheExpiry: 60 * 60 * 1000,
      retryCount: 3
    }
  );

  // 标签列表（长期缓存60分钟）
  const { data: tags } = useApi(
    blogApi.getTags,
    { 
      immediate: true, 
      cacheKey: 'blog-tags', 
      cacheExpiry: 60 * 60 * 1000,
      retryCount: 3
    }
  );

  const blogs = blogsResponse?.blogs || [];
  const categoriesList = categories || [];
  const tagsList = tags || [];
  const totalPages = blogsResponse ? Math.ceil(blogsResponse.total / blogsPerPage) : 1;
  const loading = blogsLoading;
  const hasMounted = useRef(false);

  // 组件挂载时自动刷新博客列表
  useEffect(() => {
    if (!hasMounted.current) {
      console.log('[Blog] 组件首次挂载，自动刷新博客列表');
      fetchBlogs(currentPage, blogsPerPage, selectedCategory ? parseInt(selectedCategory) : undefined);
      hasMounted.current = true;
    }
  }, [fetchBlogs, currentPage, blogsPerPage, selectedCategory]);

  // 监听路由变化，从管理后台返回时自动刷新
  useEffect(() => {
    // 检查是否从管理后台返回（通过 location.state）
    if (location.state?.refreshBlogs) {
      console.log('[Blog] 从管理后台返回，刷新博客列表');
      fetchBlogs(currentPage, blogsPerPage, selectedCategory ? parseInt(selectedCategory) : undefined);
    }
  }, [location, fetchBlogs, currentPage, blogsPerPage, selectedCategory]);

  // 动画变体
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: 'easeOut'
      }
    })
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 处理分类点击，自动刷新博客列表
  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(0); // 切换分类时重置到第一页
    console.log(`[Blog] 切换分类: ${categoryId || '全部'}, 自动刷新博客列表`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-night-gray rounded w-1/4 mb-6"></div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-sakura-pink/20 rounded-lg p-6 bg-night-dark/30">
                  <div className="h-6 bg-night-gray rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-night-gray rounded w-1/2 mb-3"></div>
                  <div className="h-20 bg-night-gray rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={sectionRef}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="min-h-screen relative flex flex-col"
      style={{
        backgroundImage: `url('/【哲风壁纸】ins风-咖啡店.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* 半透明遮罩层 - 提高内容可读性 */}
      <div className="absolute inset-0 bg-gradient-to-b from-night-black/70 via-night-black/65 to-night-black/70 pointer-events-none" />

      {/* 主内容容器 */}
      <div className="relative z-10 container mx-auto px-4 py-24 flex-1">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-sakura-white drop-shadow-lg">
            <span className="bg-gradient-to-r from-sakura-pink to-pink-400 bg-clip-text text-transparent">
              个人博客
            </span>
          </h1>

          {/* 登录/用户状态按钮 */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-sakura-pink/30"
                  >
                    管理后台
                  </Link>
                )}
                <div className="flex items-center gap-2 glass-card bg-night-dark/70 backdrop-blur-md border border-sakura-pink/40 px-4 py-2 rounded-lg">
                  <span className="text-sakura-white font-medium">{username}</span>
                  <button
                    onClick={() => logout()}
                    className="text-sakura-pink hover:text-sakura-pink-light transition-colors font-medium"
                  >
                    登出
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-gradient-to-r from-sakura-pink to-pink-400 text-white rounded-lg hover:from-pink-400 hover:to-pink-300 transition-all shadow-lg shadow-sakura-pink/30"
              >
                登录
              </Link>
            )}
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 侧边栏 */}
          <aside className="lg:w-1/4">
            <div className="glass-card bg-night-dark/70 backdrop-blur-md border-2 border-sakura-pink/40 p-6 shadow-2xl shadow-sakura-pink/10">
              <h2 className="text-xl font-semibold text-sakura-white mb-4">分类</h2>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryClick('')}
                  className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                    selectedCategory === ''
                      ? 'bg-sakura-pink/20 text-sakura-pink border border-sakura-pink/40'
                      : 'hover:bg-night-dark/50 text-sakura-white/70'
                  }`}
                >
                  全部文章
                </button>
                {categoriesList.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-sakura-pink/20 text-sakura-pink border border-sakura-pink/40'
                        : 'hover:bg-night-dark/50 text-sakura-white/70'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* 主内容区 */}
          <main className="lg:w-3/4">
            {blogs.length > 0 ? (
              <div className="space-y-6">
                {blogs.map((blog) => (
                  <article key={blog.id} className="glass-card bg-night-dark/70 backdrop-blur-md border-2 border-sakura-pink/30 p-0 hover:border-sakura-pink/60 hover:shadow-2xl hover:shadow-sakura-pink/20 transition-all overflow-hidden">
                    {/* 封面图 */}
                    {(blog as any).cover_image && (blog as any).cover_image.trim() !== '' ? (
                      <div className="w-full h-48 overflow-hidden">
                        <img
                          src={(blog as any).cover_image}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                          onLoad={() => console.log(`[Blog] 图片加载成功: ${(blog as any).cover_image}`)}
                          onError={() => console.log(`[Blog] 图片加载失败: ${(blog as any).cover_image}`)}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-br from-night-dark/50 to-night-dark/30 flex items-center justify-center">
                        <span className="text-sakura-white/30 text-sm">无封面图</span>
                      </div>
                    )}

                    <div className="p-6">
                      <h2 className="text-2xl font-semibold text-sakura-white mb-3">
                      <Link
                        to={`/blog/${blog.id}`}
                        className="hover:text-sakura-pink transition-colors"
                      >
                        {blog.title}
                      </Link>
                    </h2>

                    <div className="flex flex-wrap gap-3 text-sm text-sakura-white/70 mb-4">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z" clipRule="evenodd" />
                        </svg>
                        {formatDate(blog.created_at || (blog.createdAt ? blog.createdAt.toISOString() : new Date().toISOString()))}
                      </div>
                      
                      {blog.category && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                          </svg>
                          {blog.category}
                        </div>
                      )}
                    </div>
                    
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {blog.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-sakura-pink/10 text-sakura-pink border border-sakura-pink/30 rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-sakura-white/80 mb-4">
                      <p className="line-clamp-3">
                        {blog.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                      </p>
                    </div>

                    <Link
                      to={`/blog/${blog.id}`}
                      className="inline-flex items-center text-sakura-pink hover:text-sakura-pink-light font-medium transition-colors"
                    >
                      阅读全文
                      <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="glass-card bg-night-dark/70 backdrop-blur-md border-2 border-sakura-pink/30 p-8 text-center shadow-2xl shadow-sakura-pink/10">
                <p className="text-sakura-white/70">暂无博客文章</p>
              </div>
            )}

            {/* 分页 */}
            {totalPages && totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg transition-all backdrop-blur-md border-2 font-medium ${
                      currentPage === 1
                        ? 'bg-night-dark/40 text-sakura-white/50 cursor-not-allowed border-sakura-pink/20'
                        : 'bg-night-dark/70 border-sakura-pink/40 hover:bg-sakura-pink hover:border-sakura-pink hover:text-night-black text-sakura-white shadow-lg shadow-sakura-pink/10'
                    }`}
                  >
                    上一页
                  </button>

                  {[...Array(Math.max(0, totalPages))].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg transition-all backdrop-blur-md border-2 font-medium min-w-[40px] ${
                          currentPage === page
                            ? 'bg-sakura-pink text-night-black border-sakura-pink shadow-lg shadow-sakura-pink/30 scale-105'
                            : 'bg-night-dark/70 border-sakura-pink/40 hover:bg-sakura-pink/20 hover:border-sakura-pink/60 text-sakura-white'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg transition-all backdrop-blur-md border-2 font-medium ${
                      currentPage === totalPages
                        ? 'bg-night-dark/40 text-sakura-white/50 cursor-not-allowed border-sakura-pink/20'
                        : 'bg-night-dark/70 border-sakura-pink/40 hover:bg-sakura-pink hover:border-sakura-pink hover:text-night-black text-sakura-white shadow-lg shadow-sakura-pink/10'
                    }`}
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </motion.div>
  );
};

export default Blog;