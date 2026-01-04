import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { blogApi, commentApi } from '../services/supabase';
import { BlogPost, Comment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Tag, ArrowLeft, Clock, User, MessageSquare, Trash2, UserCircle } from 'lucide-react';

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, username } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await blogApi.getBlog(id);
        setBlog(data);

        // 获取评论
        setCommentsLoading(true);
        const commentsData = await commentApi.getComments(parseInt(id));
        setComments(commentsData);
      } catch (error) {
        console.error('Failed to fetch blog:', error);
        setError('获取博客失败');
      } finally {
        setLoading(false);
        setCommentsLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  // 提交评论
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !user || !blog) return;

    try {
      setSubmittingComment(true);
      await commentApi.addComment(
        blog.id as unknown as number,
        user.id,
        username,
        commentContent
      );
      setCommentContent('');
      // 重新获取评论列表
      const commentsData = await commentApi.getComments(parseInt(id!));
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('评论失败，请稍后重试');
    } finally {
      setSubmittingComment(false);
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId: string) => {
    if (!user || !confirm('确定要删除这条评论吗？')) return;

    try {
      await commentApi.deleteComment(commentId, user.id);
      // 重新获取评论列表
      const commentsData = await commentApi.getComments(parseInt(id!));
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('删除评论失败，请稍后重试');
    }
  };

  // 读取时间函数
  const getReadTime = (content: string) => {
    const wordsPerMinute = 400;
    const wordCount = content.length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} 分钟`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-night-black relative overflow-hidden">
        {/* 背景底图 */}
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url('/【哲风壁纸】动漫少女-和服-和风.png')`,
          }}
        />
        {/* 樱花粉渐变覆盖层 */}
        <div className="fixed inset-0 bg-gradient-to-br from-night-dark/95 via-night-black/90 to-night-darker/95 pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="space-y-4">
              <div className="h-8 bg-sakura-pink/20 rounded animate-pulse" />
              <div className="h-4 bg-sakura-pink/10 rounded w-3/4 animate-pulse" />
              <div className="h-64 bg-night-gray/50 rounded animate-pulse" />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-night-black relative overflow-hidden">
        {/* 背景底图 */}
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url('/【哲风壁纸】动漫少女-和服-和风.png')`,
          }}
        />
        {/* 樱花粉渐变覆盖层 */}
        <div className="fixed inset-0 bg-gradient-to-br from-night-dark/95 via-night-black/90 to-night-darker/95 pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="glass-card p-8">
              <h1 className="text-3xl font-bold text-sakura-white mb-6">博客详情</h1>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-sakura-white/90">{error || '博客不存在'}</p>
              </div>
              <Link
                to="/blog"
            className="inline-flex items-center px-6 py-3 bg-sakura-pink/20 border border-sakura-pink/50 text-sakura-pink rounded-lg hover:bg-sakura-pink/30 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回博客列表
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night-black relative overflow-hidden">
      {/* 背景底图 */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url('/【哲风壁纸】动漫少女-和服-和风.png')`,
        }}
      />
      {/* 樱花粉渐变覆盖层 */}
      <div className="fixed inset-0 bg-gradient-to-br from-night-dark/95 via-night-black/90 to-night-darker/95 pointer-events-none" />

      <div className="relative z-10">
        {/* 返回按钮 */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-24 left-4 z-20"
        >
          <Link
            to="/blog"
            className="glass-card px-4 py-3 inline-flex items-center text-sakura-pink hover:border-sakura-pink/60 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
          {/* 左侧：封面图区域（30%） */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hidden lg:block lg:col-span-3 fixed lg:relative h-screen lg:h-auto overflow-y-auto"
          >
            <div className="p-6 lg:p-8 sticky top-24">
              {/* 封面图 */}
              <div className="relative mb-6">
                {(blog as any).cover_image && (blog as any).cover_image.trim() !== '' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl"
                  >
                    <img
                      src={(blog as any).cover_image}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-night-black/80 via-transparent to-transparent" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-sakura-pink/10 to-sakura-pink/5 flex items-center justify-center border border-sakura-pink/20"
                  >
                    <span className="text-sakura-white/30 text-sm">无封面图</span>
                  </motion.div>
                )}
              </div>

              {/* 文章元信息 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                {/* 阅读时间 */}
                <div className="flex items-center text-sakura-white/70 text-sm">
                  <Clock className="w-4 h-4 mr-2 text-sakura-pink/80" />
                  阅读时间: {getReadTime(blog.content)}
                </div>

                {/* 发布日期 */}
                <div className="flex items-center text-sakura-white/70 text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-sakura-pink/80" />
                  {new Date(blog.created_at || (blog.createdAt ? blog.createdAt.toISOString() : new Date().toISOString())).toLocaleDateString('zh-CN')}
                </div>

                {/* 分类 */}
                {blog.category && (
                  <div className="flex items-center text-sakura-white/70 text-sm">
                    <Tag className="w-4 h-4 mr-2 text-sakura-pink/80" />
                    <span className="px-3 py-1 bg-sakura-pink/20 rounded-full text-sakura-pink text-xs">
                      {blog.category}
                    </span>
                  </div>
                )}

                {/* 标签 */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-night-gray/50 border border-sakura-pink/30 rounded-full text-xs text-sakura-white/80"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* 右侧：内容区域（70%） */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="lg:col-span-9 lg:col-start-4 py-8 px-4 lg:px-8"
          >
            {/* 文章标题 */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-bold text-sakura-white mb-6 leading-tight"
            >
              {blog.title}
            </motion.h1>

            {/* 文章元信息（移动端显示） */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:hidden flex flex-wrap gap-4 text-sakura-white/70 text-sm mb-6 pb-6 border-b border-sakura-pink/20"
            >
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-sakura-pink/80" />
                {new Date(blog.created_at || (blog.createdAt ? blog.createdAt.toISOString() : new Date().toISOString())).toLocaleDateString('zh-CN')}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-sakura-pink/80" />
                {getReadTime(blog.content)}
              </div>
              {blog.category && (
                <div className="flex items-center">
                  <Tag className="w-4 h-4 mr-1 text-sakura-pink/80" />
                  {blog.category}
                </div>
              )}
            </motion.div>

            {/* 文章内容 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="glass-card p-6 lg:p-8 mb-12"
            >
              <div
                className="prose prose-lg max-w-none text-sakura-white/90 leading-loose"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </motion.div>

            {/* 评论区域 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-12"
            >
              <div className="flex items-center mb-6">
                <MessageSquare className="w-5 h-5 mr-2 text-sakura-pink" />
                <h2 className="text-2xl font-bold text-sakura-white">
                  评论 ({comments.length})
                </h2>
              </div>

              {/* 评论列表 */}
              <AnimatePresence mode="popLayout">
                {commentsLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="glass-card p-6">
                        <div className="h-6 bg-sakura-pink/10 rounded w-1/4 mb-3 animate-pulse" />
                        <div className="h-16 bg-night-gray/50 rounded animate-pulse" />
                      </div>
                    ))}
                  </motion.div>
                ) : comments.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4 mb-8"
                  >
                    {comments.map((comment, index) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="glass-card p-6 hover:border-sakura-pink/40 transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sakura-pink to-sakura-pink-light flex items-center justify-center text-night-black font-bold text-sm">
                              {comment.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sakura-white">{comment.username}</p>
                              <p className="text-sm text-sakura-white/60">
                                {comment.created_at
                                  ? new Date(comment.created_at).toLocaleString('zh-CN')
                                  : '刚刚'}
                              </p>
                            </div>
                          </div>
                          {user && user.id === comment.user_id && (
                            <button
                              onClick={() => handleDeleteComment(comment.id as string)}
                              className="text-sakura-pink/80 hover:text-sakura-pink text-sm transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-sakura-white/90 leading-relaxed">{comment.content}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-8 text-center"
                  >
                    <p className="text-sakura-white/60">暂无评论，快来发表第一条评论吧！</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 评论表单 - 仅登录用户可见 */}
              <AnimatePresence>
                {user ? (
                  <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    onSubmit={handleAddComment}
                    className="glass-card p-6"
                  >
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-sakura-white mb-2">
                        发表评论
                      </label>
                      <textarea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-night-gray/50 border border-sakura-pink/30 rounded-lg focus:ring-2 focus:ring-sakura-pink/50 focus:border-transparent resize-none text-sakura-white placeholder-sakura-white/30 transition-all"
                        placeholder="写下你的评论..."
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingComment}
                      className="px-8 py-3 bg-gradient-to-r from-sakura-pink/80 to-sakura-pink-light/80 text-night-black rounded-lg hover:from-sakura-pink hover:to-sakura-pink-light transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingComment ? '提交中...' : '发表评论'}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card p-8 text-center"
                  >
                    <UserCircle className="w-12 h-12 text-sakura-pink/60 mb-4 mx-auto" />
                    <p className="text-sakura-white/80 mb-4">登录后可以发表评论</p>
                    <Link
                      to="/login"
                      className="inline-block px-8 py-3 bg-gradient-to-r from-sakura-pink/80 to-sakura-pink-light/80 text-night-black rounded-lg hover:from-sakura-pink hover:to-sakura-pink-light transition-all font-medium"
                    >
                      立即登录
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;