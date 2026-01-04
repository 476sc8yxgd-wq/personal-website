import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeOverlayProps {
  onComplete: () => void;
}

const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ onComplete }) => {
  const [videoError, setVideoError] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 确保视频自动播放
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // 尝试播放视频
      const playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('视频自动播放失败:', error);
          // 如果自动播放失败，设置静音后重试
          video.muted = true;
          video.play().catch(err => {
            console.log('静音后仍然无法播放:', err);
            setVideoError(true);
          });
        });
      }
    }
  }, []);

  // 动画变体定义
  const containerVariants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      }
    },
    hidden: {
      opacity: 0,
      y: '-100%',
      transition: {
        duration: 0.8,
      }
    }
  };

  const textVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.5,
        delay: 0.5,
      }
    }
  };

  const buttonVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.2,
        delay: 1.8,
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: '0 0 30px rgba(255, 255, 255, 0.5)',
      transition: {
        duration: 0.3,
      }
    }
  };

  const handleEnter = () => {
    setIsVisible(false);
    // 简化版：直接转场，不处理视频帧
    // 视频最后一帧 20% 高斯模糊会在 App.tsx 中通过 CSS filter 实现
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
          variants={containerVariants}
          initial="visible"
          animate={isVisible ? "visible" : "hidden"}
          exit="hidden"
        >
          {/* 视频背景 */}
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            {!videoError ? (
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onError={() => setVideoError(true)}
              >
                <source src="/sakura-video.mp4" type="video/mp4" />
              </video>
            ) : (
              <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1483909238329-3199b29e9791?w=1920&q=80")',
                }}
              />
            )}
          </div>

          {/* 半透明黑色遮罩层 */}
          <div className="absolute inset-0 bg-black opacity-30" />

          {/* 禁用右键下载 */}
          <div 
            className="absolute inset-0 z-[10000]"
            style={{ pointerEvents: 'none' }}
            onContextMenu={(e) => e.preventDefault()}
          />

          {/* 内容区域 */}
          <div className="relative z-10 text-center px-4">
            {/* 欢迎文字 */}
            <motion.div
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="mb-12"
            >
              <h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4"
                style={{
                  fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
                  textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                }}
              >
                你好，欢迎来到我的个人主页
              </h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.3, duration: 1 }}
                className="text-lg md:text-xl text-white/90"
                style={{
                  fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                }}
              >
                探索 · 思考 · 分享
              </motion.div>
            </motion.div>

            {/* 进入按钮 */}
            <motion.button
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
              onClick={handleEnter}
              className="btn-sakura text-xl md:text-2xl font-semibold"
              style={{
                fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
              }}
            >
              进入
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeOverlay;
