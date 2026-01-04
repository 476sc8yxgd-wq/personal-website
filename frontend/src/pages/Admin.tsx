import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { blogApi, qaApi } from '../services/supabase';
import { BlogPost, QAItem } from '../types';
import { supabase } from '../config/supabase';
import { Link } from 'react-router-dom';
import { cacheService } from '../services/cacheService';

const Admin: React.FC = () => {
  const { user, username } = useAuth();
  const [activeTab, setActiveTab] = useState('blogs');
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [questions, setQuestions] = useState<QAItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBlog, setNewBlog] = useState({ title: '', content: '', category_id: '', cover_image: '' });
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [editBlog, setEditBlog] = useState({ title: '', content: '', category_id: '', cover_image: '' });
  const [answerForm, setAnswerForm] = useState<{ [key: number]: string }>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'blogs') {
      fetchBlogs();
      fetchCategories();
    } else if (activeTab === 'qa') {
      fetchQuestions();
    }
  }, [activeTab]);

  const fetchBlogs = async () => {
    try {
      const data = await blogApi.getBlogs(0, 50);
      console.log('Fetched blogs:', data.blogs);
      setBlogs(data.blogs);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await blogApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      // 获取所有问答（不传递status参数，包括已回答和未回答的）
      const data = await qaApi.getQuestions(0, 50);
      console.log('Fetched questions after delete:', data.questions);
      setQuestions(data.questions);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  // 强制刷新问答列表（不使用缓存）
  const forceRefreshQuestions = async () => {
    try {
      console.log('[Admin] 强制刷新问答列表...');
      const data = await qaApi.getQuestions(0, 50);
      console.log('[Admin] 刷新后的问答数量:', data.questions.length);
      setQuestions(data.questions);
    } catch (error) {
      console.error('[Admin] 强制刷新问答失败:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('开始上传图片:', { fileName, filePath, fileSize: file.size });

      const { error: uploadError, data } = await supabase
        .storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('上传错误完整对象:', JSON.stringify(uploadError, null, 2));
        console.error('上传错误属性:', {
          message: uploadError.message,
          name: uploadError.name
        });
        throw new Error(`上传失败: ${uploadError.message || JSON.stringify(uploadError)}`);
      }

      console.log('上传成功，获取公共URL...');

      const { data: { publicUrl } } = supabase
        .storage
        .from('blog-images')
        .getPublicUrl(filePath);

      console.log('图片URL:', publicUrl);

      setNewBlog(prev => ({ ...prev, cover_image: publicUrl }));
      alert('图片上传成功！');
      console.log('已更新 newBlog 状态，cover_image:', publicUrl);
    } catch (error: any) {
      console.error('Failed to upload image:', error);
      alert(`图片上传失败: ${error?.message || error?.toString() || '未知错误'}\n\n请检查：\n1. Supabase 是否创建了 blog-images 存储桶\n2. 存储桶是否设置为公开访问\n3. 存储桶的上传权限配置`);
    } finally {
      setUploading(false);
    }
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('开始上传编辑图片:', { fileName, filePath, fileSize: file.size });

      const { error: uploadError } = await supabase
        .storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('上传错误详情:', uploadError);
        throw new Error(`上传失败: ${uploadError.message || '未知错误'}`);
      }

      const { data: { publicUrl } } = supabase
        .storage
        .from('blog-images')
        .getPublicUrl(filePath);

      console.log('编辑图片URL:', publicUrl);

      setEditBlog(prev => ({ ...prev, cover_image: publicUrl }));
      alert('图片上传成功！');
      console.log('已更新 editBlog 状态，cover_image:', publicUrl);
    } catch (error: any) {
      console.error('Failed to upload image:', error);
      alert(`图片上传失败: ${error?.message || error?.toString() || '未知错误'}`);
    } finally {
      setUploading(false);
    }
  };

  const glassCard = "glass-card bg-night-dark/70 backdrop-blur-md border-2 border-sakura-pink/40 p-6 shadow-2xl shadow-sakura-pink/10";
  const inputClass = "w-full bg-night-dark/50 border-sakura-pink/30 text-sakura-white rounded-lg px-4 py-3 focus:border-sakura-pink focus:ring-2 focus:ring-sakura-pink/20 placeholder-sakura-white/40";
  const buttonClass = "w-full px-6 py-3 bg-gradient-to-r from-sakura-pink to-pink-400 text-night-black font-semibold rounded-lg hover:from-sakura-pink/90 hover:to-pink-400/90 transition-all shadow-lg shadow-sakura-pink/20 disabled:opacity-50";
  const tableHeaderClass = "px-6 py-4 text-left text-xs font-semibold text-sakura-white uppercase tracking-wider bg-night-dark/60";
  const tableCellClass = "px-6 py-4 text-sm text-sakura-white border-b border-sakura-pink/20";

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newBlog.title.trim() || !newBlog.content.trim()) {
      alert('标题和内容不能为空');
      return;
    }

    console.log('准备创建博客:', newBlog);

    try {
      const result = await blogApi.createBlog(newBlog);
      console.log('博客创建成功:', result);
      alert('博客创建成功！');
      setNewBlog({ title: '', content: '', category_id: '', cover_image: '' });
      await fetchBlogs();

      // 清除所有缓存，确保主页和问答页面显示最新数据
      console.log('清除缓存...');
      await cacheService.clear();

      // 提示用户返回首页查看
      if (window.confirm('博客创建成功！是否返回首页查看？')) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Failed to create blog:', error);
      alert(`创建博客失败: ${(error as any)?.message || '未知错误'}`);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategory.name.trim()) {
      alert('分类名称不能为空');
      return;
    }

    try {
      await blogApi.createCategory(newCategory);
      alert('分类创建成功！');
      setNewCategory({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      console.error('Failed to create category:', error);
      alert('创建分类失败，请稍后重试');
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!confirm(`确定要删除分类"${name}"吗？\n\n注意：删除分类不会删除该分类下的博客，但会影响博客的分类显示。此操作不可恢复！`)) {
      return;
    }

    try {
      console.log(`[Admin] 开始删除分类，ID: ${id}, 名称: ${name}`);
      await blogApi.deleteCategory(id);
      console.log(`[Admin] 分类删除成功，ID: ${id}`);
      alert('分类删除成功！');
      fetchCategories();
      await cacheService.clear();
      // 刷新博客列表以更新分类显示
      if (activeTab === 'blogs') {
        console.log('[Admin] 刷新博客列表以更新分类显示...');
        fetchBlogs();
      }
    } catch (error: any) {
      console.error('[Admin] Failed to delete category:', error);
      console.error('[Admin] 错误详情:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      alert(`删除分类失败: ${error?.message || '未知错误'}\n\n可能原因:\n1. Supabase RLS 权限问题\n2. 分类被博客引用\n\n请检查 Supabase 控制台的 RLS 策略和权限设置`);
    }
  };

  const handleEditBlog = (blog: BlogPost) => {
    setEditingBlog(blog);
    setEditBlog({
      title: blog.title,
      content: blog.content,
      category_id: blog.category_id?.toString() || '',
      cover_image: (blog as any).cover_image || ''
    });
  };

  const handleUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editBlog.title.trim() || !editBlog.content.trim()) {
      alert('标题和内容不能为空');
      return;
    }

    try {
      await blogApi.updateBlog(editingBlog!.id, {
        title: editBlog.title,
        content: editBlog.content,
        category_id: editBlog.category_id ? parseInt(editBlog.category_id) : undefined,
        cover_image: editBlog.cover_image
      });
      alert('博客更新成功！');
      setEditingBlog(null);
      setEditBlog({ title: '', content: '', category_id: '', cover_image: '' });
      await fetchBlogs();
      await cacheService.clear();

      // 提示用户返回首页查看
      if (window.confirm('博客更新成功！是否返回首页查看？')) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Failed to update blog:', error);
      alert('更新博客失败，请稍后重试');
    }
  };

  const handleDeleteBlog = async (id: string, title: string) => {
    if (!confirm(`确定要删除博客"${title}"吗？此操作不可恢复！`)) {
      return;
    }

    try {
      await blogApi.deleteBlog(id);
      alert('博客删除成功！');
      await fetchBlogs();
      await cacheService.clear();

      // 提示用户返回首页查看
      if (window.confirm('博客删除成功！是否返回首页查看？')) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Failed to delete blog:', error);
      alert('删除博客失败，请稍后重试');
    }
  };

  const handleAnswerQuestion = async (questionId: number) => {
    const answer = answerForm[questionId];
    if (!answer || !answer.trim()) {
      alert('回答不能为空');
      return;
    }

    try {
      await qaApi.answerQuestion(questionId, answer);
      alert('回答提交成功！');
      setAnswerForm({ ...answerForm, [questionId]: '' });
      await fetchQuestions();
      await cacheService.clear();

      // 提示用户返回问答页面查看
      if (window.confirm('回答提交成功！是否返回问答页面查看？')) {
        window.location.href = '/qa';
      }
    } catch (error) {
      console.error('Failed to answer question:', error);
      alert('回答问题失败，请稍后重试');
    }
  };

  const handleDeleteQuestion = async (questionId: number, question: string) => {
    if (!confirm(`确定要删除这个问题吗？\n\n问题: "${question}"\n\n此操作不可恢复！`)) {
      return;
    }

    try {
      console.log('[Admin] 开始删除问答，ID:', questionId);
      await qaApi.deleteQuestion(questionId);
      console.log('[Admin] 删除成功，开始刷新列表...');

      // 立即从本地状态中删除，提供即时反馈
      setQuestions(prevQuestions => {
        const filtered = prevQuestions.filter(q => q.id !== questionId);
        console.log('[Admin] 本地删除后剩余数量:', filtered.length);
        return filtered;
      });

      alert('问题删除成功！');

      // 清除所有缓存
      await cacheService.clear();

      // 强制刷新（不使用缓存）
      await new Promise(resolve => setTimeout(resolve, 500)); // 等待本地更新完成
      await forceRefreshQuestions();
    } catch (error) {
      console.error('[Admin] Failed to delete question:', error);
      alert(`删除问题失败: ${error}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative" style={{
        backgroundImage: `url('/anime-girl.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}>
        <div className="absolute inset-0 bg-gradient-to-b from-night-black/70 via-night-black/75 to-night-black/80" />
        <div className="relative z-10 flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-sakura-pink"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{
      backgroundImage: `url('/anime-girl.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      <div className="absolute inset-0 bg-gradient-to-b from-night-black/70 via-night-black/75 to-night-black/80" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-sakura-white mb-2 drop-shadow-lg">
              <span className="bg-gradient-to-r from-sakura-pink to-pink-400 bg-clip-text text-transparent">
                管理后台
              </span>
            </h1>
            <p className="text-sakura-white/60 text-sm">
              欢迎回来, {username}
            </p>
          </div>
          <div className="flex gap-3">
            {activeTab === 'qa' ? (
              <Link
                to="/qa"
                className="px-6 py-3 bg-night-dark/50 border-2 border-sakura-pink/50 text-sakura-white rounded-lg hover:bg-night-dark/70 hover:border-sakura-pink/60 transition-all"
              >
                返回问答
              </Link>
            ) : (
              <Link
                to="/"
                className="px-6 py-3 bg-night-dark/50 border-2 border-sakura-pink/50 text-sakura-white rounded-lg hover:bg-night-dark/70 hover:border-sakura-pink/60 transition-all"
              >
                返回首页
              </Link>
            )}
          </div>
        </div>

        <div className={`${glassCard} mb-8`}>
          <nav className="flex gap-2">
            {['blogs', 'qa'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-sakura-pink to-pink-400 text-night-black shadow-lg shadow-sakura-pink/20'
                    : 'bg-night-dark/30 text-sakura-white/70 hover:bg-night-dark/50 hover:text-sakura-white'
                }`}
              >
                {tab === 'blogs' ? '📝 博客管理' : '💬 问答管理'}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'blogs' && (
          <div className="space-y-6">
            <div className={glassCard}>
              <h2 className="text-2xl font-semibold text-sakura-white mb-6 flex items-center gap-2">
                <span className="bg-sakura-pink/20 p-2 rounded-lg">✏️</span>
                创建新博客
              </h2>
              <form onSubmit={handleCreateBlog} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-sakura-white mb-2">标题</label>
                  <input
                    type="text"
                    value={newBlog.title}
                    onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                    className={inputClass}
                    placeholder="输入博客标题..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sakura-white mb-2">分类</label>
                  <select
                    value={newBlog.category_id}
                    onChange={(e) => setNewBlog({ ...newBlog, category_id: e.target.value })}
                    className={inputClass}
                    required
                  >
                    <option value="" className="text-night-black">选择分类</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="text-night-black">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-sakura-white mb-2">封面图片</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={inputClass}
                    disabled={uploading}
                    key={newBlog.cover_image || 'upload-input'}
                  />
                  {uploading && <p className="mt-2 text-sm text-sakura-pink animate-pulse">上传中...</p>}
                  {newBlog.cover_image && (
                    <img
                      src={newBlog.cover_image}
                      alt="封面预览"
                      className="mt-4 h-40 w-40 object-cover rounded-lg border-2 border-sakura-pink/30 shadow-lg"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-sakura-white mb-2">内容</label>
                  <textarea
                    value={newBlog.content}
                    onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                    rows={8}
                    className={inputClass}
                    placeholder="输入博客内容..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className={buttonClass}
                  disabled={uploading}
                >
                  {uploading ? '创建中...' : '🚀 创建博客'}
                </button>
              </form>
            </div>

            <div className={glassCard}>
              <h2 className="text-2xl font-semibold text-sakura-white mb-6 flex items-center gap-2">
                <span className="bg-sakura-pink/20 p-2 rounded-lg">📂</span>
                创建新分类
              </h2>
              <form onSubmit={handleCreateCategory} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-sakura-white mb-2">分类名称</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className={inputClass}
                    placeholder="输入分类名称..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sakura-white mb-2">分类描述</label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    rows={3}
                    className={inputClass}
                    placeholder="输入分类描述..."
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-night-black font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
                >
                  ➕ 创建分类
                </button>
              </form>
            </div>

            {/* 分类列表 */}
            <div className={glassCard}>
              <h2 className="text-2xl font-semibold text-sakura-white mb-6 flex items-center gap-2">
                <span className="bg-sakura-pink/20 p-2 rounded-lg">📑</span>
                分类列表
              </h2>
              <div className="overflow-x-auto rounded-lg">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className={tableHeaderClass}>ID</th>
                      <th className={tableHeaderClass}>名称</th>
                      <th className={tableHeaderClass}>描述</th>
                      <th className={tableHeaderClass}>博客数量</th>
                      <th className={tableHeaderClass}>创建时间</th>
                      <th className={tableHeaderClass}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-night-dark/30 transition-colors">
                          <td className={tableCellClass}>{cat.id}</td>
                          <td className={tableCellClass + " font-medium"}>{cat.name}</td>
                          <td className={tableCellClass}>{cat.description || '-'}</td>
                          <td className={tableCellClass}>
                            {blogs.filter(blog => blog.category_id === cat.id).length}
                          </td>
                          <td className={tableCellClass}>
                            {cat.created_at ? new Date(cat.created_at).toLocaleDateString('zh-CN') : '-'}
                          </td>
                          <td className={tableCellClass + " space-x-2"}>
                            <button
                              onClick={() => handleDeleteCategory(cat.id, cat.name)}
                              className="px-3 py-1.5 bg-red-500/20 border-2 border-red-500/40 text-red-400 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all text-sm font-medium"
                            >
                              删除
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sakura-white/60">
                          暂无分类
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={glassCard}>
              <h2 className="text-2xl font-semibold text-sakura-white mb-6 flex items-center gap-2">
                <span className="bg-sakura-pink/20 p-2 rounded-lg">📚</span>
                博客列表
              </h2>
              <div className="overflow-x-auto rounded-lg">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className={tableHeaderClass}>封面</th>
                      <th className={tableHeaderClass}>标题</th>
                      <th className={tableHeaderClass}>分类</th>
                      <th className={tableHeaderClass}>浏览量</th>
                      <th className={tableHeaderClass}>状态</th>
                      <th className={tableHeaderClass}>创建时间</th>
                      <th className={tableHeaderClass}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map((blog) => (
                      <tr key={blog.id} className="hover:bg-night-dark/30 transition-colors">
                        <td className={tableCellClass}>
                          {(blog as any).cover_image ? (
                            <img
                              src={(blog as any).cover_image}
                              alt="封面"
                              className="h-20 w-20 object-cover rounded-lg border-2 border-sakura-pink/30"
                            />
                          ) : (
                            <div className="h-20 w-20 bg-night-dark/40 rounded-lg border-2 border-sakura-pink/20 flex items-center justify-center">
                              <span className="text-sakura-white/40 text-xs">无图片</span>
                            </div>
                          )}
                        </td>
                        <td className={tableCellClass + " font-medium"}>{blog.title}</td>
                        <td className={tableCellClass}>
                          {blog.category_id ? categories.find(c => c.id === blog.category_id)?.name || blog.category_id : '-'}
                        </td>
                        <td className={tableCellClass}>{blog.view_count}</td>
                        <td className={tableCellClass}>
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            blog.status === 'published'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {blog.status === 'published' ? '已发布' : '草稿'}
                          </span>
                        </td>
                        <td className={tableCellClass}>
                          {new Date(blog.created_at || new Date().toISOString()).toLocaleDateString('zh-CN')}
                        </td>
                        <td className={tableCellClass + " space-x-2"}>
                          <button
                            onClick={() => handleEditBlog(blog)}
                            className="text-sakura-pink hover:text-sakura-pink-light font-medium transition-colors"
                          >
                            ✏️ 编辑
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(blog.id, blog.title)}
                            className="text-red-400 hover:text-red-300 font-medium transition-colors"
                          >
                            🗑️ 删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'qa' && (
          <div className="space-y-6">
            {questions.map((question) => (
              <div key={question.id} className={glassCard}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-sakura-white mb-3 flex items-center gap-2">
                      <span className="bg-sakura-pink/20 p-2 rounded-lg">❓</span>
                      问题: {question.question}
                    </h3>
                    <p className="text-sm text-sakura-white/60">
                      提问时间: {new Date(question.created_at || question.createdAt || new Date().toISOString()).toLocaleDateString('zh-CN')}
                      {(question as any).questioner_ip && ` | IP: ${(question as any).questioner_ip}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(question.id, question.question)}
                    className="px-4 py-2 bg-red-500/20 border-2 border-red-500/40 text-red-400 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all font-medium"
                  >
                    删除
                  </button>
                </div>

                {!question.answer && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-sakura-white mb-2">回答问题</label>
                    <textarea
                      value={answerForm[question.id] || ''}
                      onChange={(e) => setAnswerForm({ ...answerForm, [question.id]: e.target.value })}
                      rows={4}
                      className={inputClass}
                      placeholder="输入回答..."
                    />
                    <button
                      onClick={() => handleAnswerQuestion(question.id)}
                      className="mt-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-night-black font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
                    >
                      💬 提交回答
                    </button>
                  </div>
                )}

                {question.answer && (
                  <div className="mt-6 p-6 bg-night-dark/40 rounded-xl border-2 border-sakura-pink/30">
                    <h4 className="text-lg font-semibold text-sakura-white mb-3 flex items-center gap-2">
                      <span className="bg-sakura-pink/20 p-2 rounded-lg">💡</span>
                      回答:
                    </h4>
                    <p className="text-sakura-white/90 mb-3">{question.answer}</p>
                    <p className="text-sm text-sakura-white/60">
                      回答时间: {new Date(question.answer_time || new Date().toISOString()).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {questions.length === 0 && (
              <div className={glassCard + " text-center py-12"}>
                <p className="text-sakura-white/60 text-lg">🎉 暂无问答记录</p>
                <p className="text-sakura-white/40 text-sm mt-2">列表为空，可以等待用户提问或删除不需要的记录</p>
              </div>
            )}
          </div>
        )}

        {editingBlog && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-night-dark/95 backdrop-blur-xl rounded-2xl border-2 border-sakura-pink/40 shadow-2xl shadow-sakura-pink/30 max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-sakura-white mb-8 flex items-center gap-3">
                  <span className="bg-sakura-pink/20 p-2 rounded-lg">✏️</span>
                  编辑博客
                </h2>
                <form onSubmit={handleUpdateBlog} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-sakura-white mb-2">标题</label>
                    <input
                      type="text"
                      value={editBlog.title}
                      onChange={(e) => setEditBlog({ ...editBlog, title: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sakura-white mb-2">分类</label>
                    <select
                      value={editBlog.category_id}
                      onChange={(e) => setEditBlog({ ...editBlog, category_id: e.target.value })}
                      className={inputClass}
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id} className="text-night-black">
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sakura-white mb-2">封面图片</label>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageUpload}
                    className={inputClass}
                    disabled={uploading}
                    key={editBlog.cover_image || 'edit-upload-input'}
                  />
                    {uploading && <p className="mt-2 text-sm text-sakura-pink animate-pulse">上传中...</p>}
                    {editBlog.cover_image && (
                      <img
                        src={editBlog.cover_image}
                        alt="封面预览"
                        className="mt-4 h-40 w-40 object-cover rounded-lg border-2 border-sakura-pink/30 shadow-lg"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sakura-white mb-2">内容</label>
                    <textarea
                      value={editBlog.content}
                      onChange={(e) => setEditBlog({ ...editBlog, content: e.target.value })}
                      rows={10}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className={buttonClass}
                      disabled={uploading}
                    >
                      {uploading ? '更新中...' : '💾 保存修改'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBlog(null);
                        setEditBlog({ title: '', content: '', category_id: '', cover_image: '' });
                      }}
                      className="flex-1 px-6 py-3 bg-night-dark/50 border-2 border-sakura-pink/50 text-sakura-white rounded-lg hover:bg-night-dark/70 transition-all"
                    >
                      ❌ 取消
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
