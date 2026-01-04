import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { id: 'about', label: '关于我', icon: '👤' },
  { id: 'blog', label: '博客', icon: '📝' },
  { id: 'qa', label: '问答', icon: '💬' },
];

interface SideNavigationProps {
  className?: string;
}

const SideNavigation: React.FC<SideNavigationProps> = ({ className = '' }) => {
  const [activeSection, setActiveSection] = useState('about');
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 检测是否为移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 滚动监听 - 实现章节吸附效果
  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => document.getElementById(item.id));
      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      let currentSection = 'about';
      let maxVisibility = 0;

      // 检查每个section的位置，找到可见面积最大的section
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (!section) continue;

        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top;
        const sectionBottom = rect.bottom;
        const sectionHeight = rect.height;

        // 计算section在视口中的可见程度
        let visibility = 0;
        if (sectionBottom > 0 && sectionTop < windowHeight) {
          const visibleTop = Math.max(0, sectionTop);
          const visibleBottom = Math.min(windowHeight, sectionBottom);
          const visibleHeight = visibleBottom - visibleTop;
          visibility = visibleHeight / sectionHeight;
        }

        // 记录可见面积最大的section
        if (visibility > maxVisibility) {
          maxVisibility = visibility;
          currentSection = navItems[i].id;
        }
      }

      setActiveSection(currentSection);
    };

    // 使用 requestAnimationFrame 优化性能
    let ticking = false;
    const optimizedScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', optimizedScroll, { passive: true });
    handleScroll(); // 初始化

    return () => {
      window.removeEventListener('scroll', optimizedScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isScrolling]);

  // 平滑滚动到对应section（点击导航时使用）
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      setIsScrolling(true);

      // 清除之前的定时器
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      const sectionTop = section.offsetTop;
      window.scrollTo({
        top: sectionTop,
        behavior: 'smooth'
      });

      // 滚动完成后重置状态
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 800);
    }
  };

  // 桌面端导航
  const DesktopNav = () => {
    // 计算激活指示器的位置
    const activeIndex = navItems.findIndex(item => item.id === activeSection);

    return (
      <motion.div
        className="fixed right-4 top-1/2 -translate-y-1/2 z-50"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <div className="flex flex-col gap-3 items-center">
          {navItems.map((item) => (
            <div key={item.id} className="relative group">
              <motion.button
                onClick={() => scrollToSection(item.id)}
                className={`
                  glass-card w-14 h-14 rounded-2xl flex items-center justify-center
                  transition-all duration-300 relative
                  ${activeSection === item.id
                    ? 'bg-sakura-pink/20 border-sakura-pink shadow-lg shadow-sakura-pink/20 scale-110'
                    : 'bg-night-dark/40 border-sakura-pink/30 hover:bg-sakura-pink/10 hover:border-sakura-pink/60 hover:scale-105'
                  }
                `}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* 图标 */}
                <span className="text-2xl">{item.icon}</span>

                {/* 激活状态指示器 */}
                {activeSection === item.id && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sakura-pink rounded-r-full"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  />
                )}
              </motion.button>

              {/* 悬停提示 */}
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 glass-card border border-sakura-pink/40 rounded-full text-sakura-white text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  // 移动端底部导航
  const MobileNav = () => (
    <motion.div
      className="fixed bottom-4 left-4 right-4 z-50"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
    >
      <div className="glass-card border border-sakura-pink/30 rounded-2xl p-2 shadow-2xl shadow-sakura-pink/10">
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-300 ${
                activeSection === item.id
                  ? 'bg-sakura-pink/20 border border-sakura-pink/50'
                  : 'hover:bg-sakura-pink/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs text-sakura-white">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return isMobile ? <MobileNav /> : <DesktopNav />;
};

export default SideNavigation;
