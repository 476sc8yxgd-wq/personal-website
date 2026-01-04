import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { blogApi, profileApi } from '../services/supabase';
import { Profile, BlogPost } from '../types';
import { useApi } from '../hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

const Home: React.FC = () => {
  const location = useLocation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  // 使用增强的 useApi 获取个人信息（缓存30分钟）
  const { data: profile, loading: profileLoading } = useApi(
    profileApi.getProfile,
    { 
      immediate: true, 
      cacheKey: 'home-profile',
      cacheExpiry: 30 * 60 * 1000,
      retryCount: 3
    }
  );

  // 使用增强的 useApi 获取最新博客（缓存5分钟）
  const { data: blogsData, loading: blogsLoading, execute: refreshBlogs } = useApi(
    () => blogApi.getBlogs(0, 3),
    {
      immediate: true,
      cacheKey: 'home-recent-blogs',
      cacheExpiry: 5 * 60 * 1000,
      retryCount: 3
    }
  );

  const recentBlogs = blogsData?.blogs || [];
  const loading = profileLoading || blogsLoading;
  const [debugMode, setDebugMode] = React.useState(false);
  const hasMounted = useRef(false);

  // 组件挂载时自动刷新博客列表
  useEffect(() => {
    if (!hasMounted.current) {
      console.log('[Home] 组件首次挂载，自动刷新博客列表');
      refreshBlogs();
      hasMounted.current = true;
    }
  }, [refreshBlogs]);

  // 调试：查看博客数据
  console.log('[Home] 博客数据:', recentBlogs);
  recentBlogs.forEach((blog, index) => {
    const coverImage = (blog as any).cover_image;
    console.log(`[Home] 博客 ${index + 1}:`, {
      id: blog.id,
      title: blog.title,
      cover_image: coverImage,
      cover_image_type: typeof coverImage,
      cover_image_exists: !!coverImage,
      cover_image_isEmpty: coverImage === '',
      cover_image_truthy: !!coverImage,
      cover_image_trimmed: coverImage?.trim() || ''
    });
  });

  // 监听路由变化，从管理后台返回时自动刷新
  useEffect(() => {
    // 检查是否从管理后台返回（通过 location.state）
    if (location.state?.refreshBlogs) {
      console.log('[Home] 从管理后台返回，强制刷新博客列表（清除缓存）');
      // 强制清除缓存并重新获取
      refreshBlogs();
    }
  }, [location, refreshBlogs]);

  // 动画变体
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
      }
    })
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded-lg w-1/3"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            
            <div className="h-8 bg-gray-200 rounded w-1/4 mt-12"></div>
            <div className="h-40 bg-gray-200 rounded-lg w-full"></div>
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
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50"
    >
      <div className="container mx-auto px-4 py-24">
        {/* 刷新按钮 - Sticky 定位 */}
        <div className="sticky top-24 flex justify-end mb-4 gap-2">
          <button
            onClick={() => setDebugMode(!debugMode)}
            className="px-4 py-2 bg-yellow-100/90 backdrop-blur-md border-2 border-yellow-400/60 rounded-lg hover:bg-yellow-200 text-yellow-700 transition-all font-medium flex items-center gap-2 shadow-lg"
          >
            {debugMode ? '关闭调试' : '调试模式'}
          </button>
          <button
            onClick={() => refreshBlogs()}
            disabled={blogsLoading}
            className="px-4 py-2 bg-white/90 backdrop-blur-md border-2 border-primary/40 rounded-lg hover:bg-primary hover:text-white hover:border-primary text-primary transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
          >
            <svg className={`w-4 h-4 ${blogsLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {blogsLoading ? '刷新中...' : '刷新'}
          </button>
        </div>

        {/* 调试信息面板 */}
        {debugMode && (
          <div className="mb-8 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4">🔧 博客数据调试面板</h3>
            <pre className="bg-white p-4 rounded border overflow-auto max-h-96 text-xs">
              {JSON.stringify(recentBlogs, null, 2)}
            </pre>
          </div>
        )}

        {/* 个人简介 */}
        {profile && (
          <div className="mb-16">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-2xl">个人信息</CardTitle>
                  <CardDescription>关于我的一些基本信息</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{profile.name}</p>
                      <p className="text-sm text-muted-foreground">{profile.age}岁 · {profile.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">QQ: {profile.qq}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-2xl">座右铭</CardTitle>
                  <CardDescription>我的生活信条</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-medium italic text-foreground leading-relaxed">
                    "{profile.motto}"
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* 最新博客 */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">最新博客</h2>
              <p className="text-muted-foreground">探索我的最新思考和分享</p>
            </div>
            <a href="#blog">
              <Button variant="outline" size="lg">
                查看全部 →
              </Button>
            </a>
          </div>
          
          {recentBlogs.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {recentBlogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  custom={index}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="border-2 hover:border-primary transition-all hover:shadow-lg h-full overflow-hidden">
                    {/* 调试：检查封面图条件 */}
                    {(blog as any).cover_image && (blog as any).cover_image.trim() !== '' ? (
                      <div className="w-full h-48 overflow-hidden">
                        <img
                          src={(blog as any).cover_image}
                          alt={blog.title}
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                          onLoad={() => console.log(`[Home] 图片加载成功: ${(blog as any).cover_image}`)}
                          onError={() => console.log(`[Home] 图片加载失败: ${(blog as any).cover_image}`)}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">无封面图</span>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl line-clamp-2">
                        <Link
                          to={`/blog/${blog.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {blog.title}
                        </Link>
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{new Date(blog.created_at || (blog.createdAt ? blog.createdAt.toISOString() : new Date().toISOString())).toLocaleDateString('zh-CN')}</span>
                        </div>
                        {blog.category && (
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                            {blog.category}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                        {blog.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="border-2">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <p className="text-lg text-muted-foreground mb-6">暂无博客文章</p>
                <Link to="/blog">
                  <Button size="lg">
                    浏览博客页面
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
        </div>
      </motion.div>
  );
};

export default Home;