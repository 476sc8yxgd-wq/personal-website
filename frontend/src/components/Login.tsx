import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, register, user, isAdmin } = useAuth();

  // 登录成功后自动跳转
  useEffect(() => {
    if (user) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const result = isRegistering
      ? await register(username, password)
      : await login(username, password);

    if (result.success) {
      setSuccess(isRegistering ? '注册成功！已自动登录。' : '登录成功！');
      // 登录成功后，useEffect 会自动跳转
    } else {
      setError(result.error || '操作失败');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen relative flex items-center justify-center"
      style={{
        backgroundImage: `url('/anime-girl.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* 半透明遮罩层 */}
      <div className="absolute inset-0 bg-gradient-to-br from-night-black/80 via-night-black/75 to-night-black/80 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-12">
        {/* 登录卡片 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card border border-sakura-pink/30 rounded-2xl p-8 space-y-8 shadow-2xl"
        >
          {/* 标题 */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-2 text-center text-3xl font-bold text-sakura-white"
            >
              {isRegistering ? '注册账号' : '登录到个人网站'}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-3 text-center text-sm text-sakura-gray"
            >
              {isRegistering ? '已有账号？' : '还没有账号？'}
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="ml-1 font-medium text-sakura-pink hover:text-sakura-pink/80 focus:outline-none transition-colors"
              >
                {isRegistering ? '立即登录' : '立即注册'}
              </button>
            </motion.p>
          </div>

          {/* 显示当前登录状态 - 用于调试 */}
          {user && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-sakura-pink/20 border border-sakura-pink/50 rounded-lg px-4 py-3 mb-4 backdrop-blur-sm"
            >
              <p className="text-sm text-sakura-white">
                <strong>当前登录用户：</strong> {username}
                {isAdmin && (
                  <span className="ml-2 bg-sakura-pink/80 text-white px-2 py-1 rounded text-xs font-medium">
                    管理员
                  </span>
                )}
              </p>
              <p className="text-sm text-sakura-gray mt-1">
                {isAdmin ? '正在跳转到管理后台...' : '正在跳转到首页...'}
              </p>
            </motion.div>
          )}

          {/* 错误提示 */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm"
            >
              {error}
            </motion.div>
          )}

          {/* 成功提示 */}
          {success && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg backdrop-blur-sm"
            >
              {success}
            </motion.div>
          )}

          {/* 表单 */}
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            {/* 用户名输入 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <label htmlFor="username" className="block text-sm font-medium text-sakura-white mb-2">
                用户名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none block w-full px-4 py-3 bg-night-dark/50 border border-sakura-pink/30 rounded-lg placeholder-sakura-gray text-sakura-white focus:outline-none focus:ring-2 focus:ring-sakura-pink/50 focus:border-sakura-pink/50 sm:text-sm transition-all"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </motion.div>

            {/* 密码输入 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-sakura-white mb-2">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none block w-full px-4 py-3 bg-night-dark/50 border border-sakura-pink/30 rounded-lg placeholder-sakura-gray text-sakura-white focus:outline-none focus:ring-2 focus:ring-sakura-pink/50 focus:border-sakura-pink/50 sm:text-sm transition-all"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </motion.div>

            {/* 提交按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-sakura-pink/90 to-sakura-pink/80 hover:from-sakura-pink/80 hover:to-sakura-pink/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-night-dark focus:ring-sakura-pink/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12c0 2.209-.84 4.208-2.218 5.708V12h-4v4.291a7.962 7.962 0 01-2.218-5.708z"></path>
                    </svg>
                    处理中...
                  </span>
                ) : (
                  <span className="flex items-center">
                    {isRegistering ? '注册' : '登录'}
                    <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                )}
              </button>
            </motion.div>
          </form>

          {/* 注册提示 */}
          {isRegistering && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-center text-sm text-sakura-gray"
            >
              <p>💡 注册后无需邮箱验证，可直接登录</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;