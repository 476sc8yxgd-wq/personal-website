import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { qaApi } from '../services/supabase';
import { QAItem } from '../types';
import { useApi } from '../hooks/useApi';

const QA: React.FC = () => {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(0);
  const [newQuestion, setNewQuestion] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const questionsPerPage = 10;
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  // 问题列表（短期缓存5分钟）
  const { data: qaResponse, loading, execute: fetchQuestions } = useApi(
    qaApi.getQuestions,
    {
      cacheKey: `qa-page-${currentPage}`,
      cacheExpiry: 5 * 60 * 1000,
      retryCount: 3
    }
  );

  // 提交问题（不需要缓存，每次都调用）
  const { data: newQuestionData, loading: submitting, execute: submitQuestion } = useApi(
    qaApi.askQuestion,
    {
      retryCount: 3
    }
  );

  const questions = qaResponse?.questions || [];
  const totalPages = qaResponse ? Math.ceil(qaResponse.total / questionsPerPage) : 1;
  const hasMounted = useRef(false);

  // 组件挂载时自动刷新问题列表
  useEffect(() => {
    if (!hasMounted.current) {
      console.log('[QA] 组件首次挂载，自动刷新问答列表');
      fetchQuestions(currentPage, questionsPerPage);
      hasMounted.current = true;
    }
  }, [fetchQuestions, currentPage, questionsPerPage]);

  // 监听路由变化，从管理后台返回时自动刷新
  useEffect(() => {
    // 检查是否从管理后台返回（通过 location.state）
    if (location.state?.refreshQA) {
      console.log('[QA] 从管理后台返回，刷新问答列表');
      fetchQuestions(currentPage, questionsPerPage);
    }
  }, [location, fetchQuestions, currentPage, questionsPerPage]);

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

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newQuestion.trim()) {
      setSubmitError('问题不能为空');
      return;
    }
    
    setSubmitError('');
    const result = await submitQuestion(newQuestion.trim());
    
    if (result) {
      setSubmitSuccess(true);
      setNewQuestion('');
      // 刷新列表，清除缓存
      fetchQuestions(0, questionsPerPage);
      
      // 3秒后隐藏成功消息
      setTimeout(() => setSubmitSuccess(false), 3000);
    } else {
      setSubmitError('提交失败');
    }
  };

  const handleLikeQuestion = async (id: number) => {
    try {
      await qaApi.likeQuestion(id);
      // 点赞后刷新列表，获取最新数据
      fetchQuestions(currentPage, questionsPerPage);
    } catch (error) {
      console.error('Failed to like question:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-night-gray rounded w-1/3 mb-6"></div>
            <div className="h-32 bg-night-gray rounded w-full mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border border-sakura-pink/20 rounded-lg p-4 bg-night-dark/30">
                  <div className="h-4 bg-night-gray rounded w-full mb-2"></div>
                  <div className="h-16 bg-night-gray rounded w-3/4"></div>
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
      <div className="absolute inset-0 bg-gradient-to-b from-night-black/75 via-night-black/70 to-night-black/75 pointer-events-none" />

      {/* 主内容容器 */}
      <div className="relative z-10 container mx-auto px-4 py-24 flex-1">
        <h1 className="text-4xl font-bold text-sakura-white mb-8 drop-shadow-lg">
          <span className="bg-gradient-to-r from-sakura-pink to-pink-400 bg-clip-text text-transparent">
            互动问答
          </span>
        </h1>
        
        {/* 提问表单 */}
        <div className="glass-card bg-night-dark/70 backdrop-blur-md border-2 border-sakura-pink/40 p-6 mb-8 shadow-2xl shadow-sakura-pink/10">
          <h2 className="text-xl font-semibold text-sakura-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-sakura-pink" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            向我提问
          </h2>
          <form onSubmit={handleSubmitQuestion}>
            <div className="mb-4">
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="请输入你的问题..."
                className="w-full px-4 py-3 bg-night-dark/60 backdrop-blur-sm border-2 border-sakura-pink/40 rounded-lg focus:ring-2 focus:ring-sakura-pink focus:border-transparent resize-none text-sakura-white placeholder-sakura-white/50 transition-all"
                rows={4}
                disabled={submitting}
              />
            </div>

            {submitError && (
              <div className="mb-4 p-3 bg-red-500/20 backdrop-blur-sm border-2 border-red-500/50 text-red-400 rounded-lg">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="mb-4 p-3 bg-sakura-pink/20 backdrop-blur-sm border-2 border-sakura-pink/50 text-sakura-pink rounded-lg">
                ✨ 问题提交成功！我会尽快回复你的问题。
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !newQuestion.trim()}
              className="w-full px-6 py-3 bg-sakura-pink text-night-black rounded-lg hover:bg-pink-400 hover:shadow-lg hover:shadow-sakura-pink/30 focus:ring-2 focus:ring-sakura-pink disabled:bg-sakura-pink/50 disabled:cursor-not-allowed font-semibold transition-all duration-300"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-night-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  提交中...
                </span>
              ) : '提交问题'}
            </button>
          </form>
        </div>
        
        {/* 问答列表 */}
        <div className="space-y-6">
          {questions.length > 0 ? (
            questions.map((qa) => (
              <div key={qa.id} className="glass-card bg-night-dark/70 backdrop-blur-md border-2 border-sakura-pink/30 p-6 hover:border-sakura-pink/60 hover:shadow-2xl hover:shadow-sakura-pink/20 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-sakura-white flex-1">
                    {qa.question}
                  </h3>
                  <div className="text-sm text-sakura-white/70 ml-2">
                    {formatDate(qa.created_at || new Date().toISOString())}
                  </div>
                </div>

                {qa.answer ? (
                  <div className="bg-night-dark/50 backdrop-blur-sm rounded-lg p-4 border-2 border-sakura-pink/30">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-sakura-pink/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 border border-sakura-pink/30">
                        <svg className="w-4 h-4 text-sakura-pink" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-sakura-white/90 whitespace-pre-wrap">{qa.answer}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sakura-white/60 italic">
                    暂未回复，敬请期待...
                  </div>
                )}

                <div className="mt-4 flex items-center gap-4">
                  <motion.button
                    onClick={() => handleLikeQuestion(qa.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-sakura-pink/10 backdrop-blur-sm border-2 border-sakura-pink/30 rounded-lg hover:bg-sakura-pink hover:text-night-black hover:border-sakura-pink text-sakura-pink transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span className="font-medium">{qa.likes > 0 ? qa.likes : '赞'}</span>
                  </motion.button>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card p-8 text-center">
              <p className="text-sakura-white/70">暂无问答记录</p>
              <p className="text-sakura-white/50 mt-2">成为第一个提问的人吧！</p>
            </div>
          )}
        </div>
        
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
      </div>
    </motion.div>
  );
};

export default QA;