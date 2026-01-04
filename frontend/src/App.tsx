import React, { useState, Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { NetworkStatusProvider } from './hooks/useNetworkStatus';
import WelcomeOverlay from './components/WelcomeOverlay';
import SideNavigation from './components/SideNavigation';
import NetworkStatus from './components/NetworkStatus';
import ProtectedRoute from './components/ProtectedRoute';
import SakuraPetals from './components/SakuraPetals';
import { SimpleLoader } from './utils/loaders';

// 懒加载页面组件
const Login = lazy(() => import('./components/Login'));
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const QA = lazy(() => import('./pages/QA'));
const Admin = lazy(() => import('./pages/Admin'));
const Diagnostic = lazy(() => import('./pages/Diagnostic'));
const DebugCoverImage = lazy(() => import('./pages/DebugCoverImage'));

// 根据路径自动滚动到对应 section 的包装组件
const LandingPageWrapper = () => {
  const location = useLocation();

  useEffect(() => {
    // 延迟一小段时间，确保 DOM 已渲染
    setTimeout(() => {
      // 根据路径确定要滚动的 section
      let targetSection: string | null = null;

      if (location.pathname === '/blog') {
        targetSection = 'blog';
      } else if (location.pathname === '/qa') {
        targetSection = 'qa';
      }

      if (targetSection) {
        const section = document.getElementById(targetSection);
        if (section) {
          const sectionTop = section.offsetTop;
          window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
          });
          console.log(`[LandingPageWrapper] 滚动到 section: ${targetSection}`);
        }
      }
    }, 100);
  }, [location.pathname]);

  return <MainLandingPage />;
};

// 主页组件（单页滚动）
const MainLandingPage = () => {
  return (
    <>
      <SideNavigation />
      <main className="relative">
        {/* #about: 深灰黑底 + 左侧1/3区域樱花散点纹理 */}
        <motion.section
          id="about"
          className="section-divider min-h-screen bg-night-dark relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } }
          }}
        >
          <div className="absolute inset-0 overflow-hidden opacity-3 pointer-events-none">
            <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-sakura-pink/3 to-transparent"
                 style={{ opacity: 0.03 }} />
          </div>
          <About />
        </motion.section>

        {/* #blog: 纯黑底 + 背景中央极淡的樱花漩涡图案 */}
        <motion.section
          id="blog"
          className="section-divider min-h-screen bg-night-black relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0, y: 80, scale: 0.95 },
            visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] } }
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none">
            <svg width="400" height="400" viewBox="0 0 400 400" className="opacity-5">
              <defs>
                <pattern id="spiral" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M10,10 Q15,5 10,0 Q5,5 10,10"
                        fill="none"
                        stroke="rgba(255,183,197,1)"
                        strokeWidth="0.2"/>
                </pattern>
              </defs>
              <circle cx="200" cy="200" r="150"
                      fill="url(#spiral)"
                      opacity="0.04"
                      stroke="rgba(255,183,197,0.1)"
                      strokeWidth="0.5"/>
            </svg>
          </div>
          <Blog />
        </motion.section>

        {/* #qa: 深黑底 + 底部樱花落英阵列 */}
        <motion.section
          id="qa"
          className="section-divider min-h-screen bg-night-darker relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0, x: -50 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] } }
          }}
        >
          <div className="absolute inset-0 overflow-hidden opacity-2 pointer-events-none">
            <div className="absolute bottom-0 left-0 right-0 h-1/3
                  bg-gradient-to-t from-sakura-pink/2 to-transparent"
                  style={{ opacity: 0.02 }} />
          </div>
          <QA />
        </motion.section>
      </main>
    </>
  );
};

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  return (
    <NetworkStatusProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-night-black relative overflow-hidden">
            {/* 网络状态提示 */}
            <NetworkStatus />

            {/* 欢迎页覆盖层 */}
            {showWelcome && (
              <WelcomeOverlay onComplete={handleWelcomeComplete} />
            )}

            {/* 樱花瓣动画 */}
            {!showWelcome && <SakuraPetals />}

            <Suspense fallback={<SimpleLoader />}>
            <Routes>
              {/* 单页滚动主页 */}
              <Route path="/" element={<MainLandingPage />} />
              <Route path="/blog" element={<LandingPageWrapper />} />
              <Route path="/qa" element={<LandingPageWrapper />} />

              {/* 其他路由页面 */}
              <Route path="/login" element={<Login />} />
              <Route path="/blog/:id" element={<BlogDetail />} />
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="/diagnostic" element={<Diagnostic />} />
              <Route path="/debug-cover" element={<DebugCoverImage />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
    </NetworkStatusProvider>
  );
}

export default App;
