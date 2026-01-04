import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { profileApi } from '../services/supabase';
import { Profile } from '../types';
import { useApi } from '../hooks/useApi';

// 音乐列表
const musicList = [
  { id: 1, title: "It's OK", artist: 'Corook', duration: '3:25', url: '/music/corook_its_ok.mp3' },
  { id: 2, title: 'One Last Kiss', artist: '西野加奈', duration: '4:23', url: '' },
  { id: 3, title: 'Lemon', artist: '米津玄師', duration: '3:51', url: '' },
  { id: 4, title: '夜に駆ける', artist: 'YOASOBI', duration: '4:10', url: '' },
];

const About: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  // 侧边栏状态
  const [activeTab, setActiveTab] = useState<string>('education');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentMusic, setCurrentMusic] = useState(musicList[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isLoadingRef = useRef(false);

  // 使用增强的 useApi 获取个人信息（缓存60分钟，因为信息不常变化）
  const { data: profile, loading } = useApi(
    profileApi.getProfile,
    {
      immediate: true,
      cacheKey: 'about-profile',
      cacheExpiry: 60 * 60 * 1000,
      retryCount: 3
    }
  );

  // 侧边栏标签
  const tabs = [
    { id: 'education', label: '教育背景', icon: '📚' },
    { id: 'experience', label: '学生工作', icon: '💼' },
    { id: 'skills', label: '技能专长', icon: '✨' },
    { id: 'music', label: '爱听的音乐', icon: '🎵' },
  ];

  // 监听 currentMusic 和 isPlaying 变化
  useEffect(() => {
    if (!audioRef.current || !currentMusic.url) {
      return;
    }

    const audio = audioRef.current;
    isLoadingRef.current = true;

    // 停止当前播放
    audio.pause();
    audio.currentTime = 0;

    // 如果需要播放
    if (isPlaying) {
      // 加载新歌曲
      audio.src = currentMusic.url;
      audio.load();

      // 等待可以播放
      const handleCanPlay = () => {
        audio.play()
          .then(() => {
            isLoadingRef.current = false;
          })
          .catch(err => {
            console.error('播放失败:', err);
            setIsPlaying(false);
            isLoadingRef.current = false;
          });
      };

      audio.addEventListener('canplay', handleCanPlay, { once: true });

      return () => {
        audio.removeEventListener('canplay', handleCanPlay);
        isLoadingRef.current = false;
      };
    } else {
      // 不需要播放，只加载
      audio.src = currentMusic.url;
      audio.load();
      isLoadingRef.current = false;
    }
  }, [currentMusic.id, isPlaying]);

  // 音乐播放控制
  const handlePlayPause = (music: typeof musicList[0]) => {
    if (!music.url || isLoadingRef.current) {
      return;
    }

    // 如果点击的是当前歌曲
    if (currentMusic.id === music.id) {
      // 切换播放/暂停状态
      setIsPlaying(prev => !prev);
    } else {
      // 切换到新歌曲
      setCurrentMusic(music);
      setIsPlaying(true);
    }
  };

  // 音乐播放进度
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const { currentTime, duration } = audioRef.current;
      const progressPercent = duration ? (currentTime / duration) * 100 : 0;
      setProgress(progressPercent);
    }
  };

  // 音乐结束
  const handleMusicEnd = () => {
    // 找到下一首
    const currentIndex = musicList.findIndex(m => m.id === currentMusic.id);
    let nextIndex = (currentIndex + 1) % musicList.length;
    let nextMusic = musicList[nextIndex];

    // 如果下一首没有URL，继续找
    while (!nextMusic.url && nextIndex !== currentIndex) {
      nextIndex = (nextIndex + 1) % musicList.length;
      nextMusic = musicList[nextIndex];
    }

    if (nextMusic.url && nextIndex !== currentIndex) {
      // 播放下一首
      setCurrentMusic(nextMusic);
      setIsPlaying(true);
    } else {
      // 没有可播放的下一首
      setIsPlaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-night-dark via-night-gray to-night-dark">
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-night-gray/50 rounded-lg w-1/3"></div>
            <div className="h-6 bg-night-gray/30 rounded w-1/2"></div>
            <div className="h-6 bg-night-gray/30 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-night-dark via-night-gray to-night-dark">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-6 text-sakura-white">关于我</h1>
          <p className="text-sakura-pink text-lg">无法加载个人信息</p>
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
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
        <div className="flex gap-6">
          {/* 左侧：可收缩的侧边栏 */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`${isCollapsed ? 'w-16' : 'w-64'} shrink-0 transition-all duration-300`}
          >
            <div className="glass-card border border-sakura-pink/30 rounded-2xl p-4 sticky top-24">
              {/* 侧边栏标题 */}
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-bold text-sakura-white ${isCollapsed ? 'hidden' : ''}`}>
                  个人档案
                </h2>
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-2 rounded-lg hover:bg-sakura-pink/20 transition-colors"
                >
                  <svg className={`w-5 h-5 text-sakura-pink ${isCollapsed ? 'hidden' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7 7" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7-7" />
                  </svg>
                  {isCollapsed && (
                    <svg className="w-5 h-5 text-sakura-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7-7" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 19l-7-7 7 7" />
                    </svg>
                  )}
                </button>
              </div>

              {/* 侧边栏标签 */}
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${activeTab === tab.id
                        ? 'bg-sakura-pink/30 border border-sakura-pink text-sakura-white'
                        : 'bg-night-dark/40 border border-sakura-pink/20 text-sakura-gray hover:bg-sakura-pink/10 hover:border-sakura-pink/50'
                      }
                      ${isCollapsed ? 'justify-center px-3' : 'justify-start'}
                    `}
                  >
                    <span className={`flex-shrink-0 ${isCollapsed ? 'text-xl' : 'text-lg'}`}>{tab.icon}</span>
                    <span className={`flex-shrink-0 ${isCollapsed ? 'hidden' : 'text-sm font-medium'}`}>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 右侧：内容展示区域 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 relative z-10"
          >
            {/* 个人信息卡片 */}
            <div className="mb-6">
              <div
                className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-sakura-pink/30"
                style={{
                  backgroundImage: `url('/profile-bg.png.png')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center top',
                  backgroundRepeat: 'no-repeat',
                  minHeight: '480px'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-night-dark/50 via-night-dark/30 to-night-dark/70"></div>
                <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-between">
                  <div className="flex flex-col md:flex-row gap-6 items-end md:items-center justify-between">
                    <div className="flex-1 space-y-4">
                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg"
                      >
                        {profile.name}
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-xl md:text-2xl text-sakura-pink drop-shadow-md"
                      >
                        很高兴认识你！
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        className="pt-2 border-t border-white/20"
                      >
                        <p className="text-sm md:text-base text-white/90 leading-relaxed italic font-light">
                          "{profile.motto}"
                        </p>
                      </motion.div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 md:gap-4 w-full md:w-auto">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="glass-card bg-night-dark/60 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center min-w-[70px]"
                      >
                        <svg className="w-5 h-5 md:w-6 md:h-6 text-sakura-pink mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">{profile.age}</span>
                        <span className="text-xs md:text-sm text-sakura-pink/90 font-medium">岁</span>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="glass-card bg-night-dark/60 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center min-w-[70px]"
                      >
                        <svg className="w-5 h-5 md:w-6 md:h-6 text-sakura-pink mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-base md:text-lg font-bold text-white drop-shadow-lg leading-tight text-center">{profile.location}</span>
                        <span className="text-xs md:text-sm text-sakura-pink/90 font-medium">所在地</span>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="glass-card bg-night-dark/60 backdrop-blur-sm border border-white/20 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center min-w-[70px]"
                      >
                        <svg className="w-5 h-5 md:w-6 md:h-6 text-sakura-pink mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-sm md:text-base font-bold text-white drop-shadow-lg leading-tight text-center">{profile.qq}</span>
                        <span className="text-xs md:text-sm text-sakura-pink/90 font-medium">QQ</span>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 内容卡片区域 */}
            <AnimatePresence mode="wait">
              {activeTab === 'education' && (
                <motion.div
                  key="education"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="glass-card border-2 border-sakura-pink/30 shadow-2xl hover:shadow-sakura-pink/20 transition-shadow mb-6"
                >
                  <div className="bg-gradient-to-r from-sakura-pink to-pink-500 text-night-dark px-6 py-4">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332-.477-4.5-1.253" />
                      </svg>
                      教育背景
                    </h3>
                    <p className="text-night-dark/80 text-sm mt-1">我的求学之路</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="bg-night-dark/50 rounded-lg p-4 border-l-4 border-sakura-pink"
                      >
                        <h3 className="text-xl font-bold text-sakura-white mb-2">武汉理工大学</h3>
                        <p className="text-sakura-gray font-medium">经济学院 · 在读本科生</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-sakura-pink text-night-dark rounded text-xs font-medium">在读</span>
                          <span className="text-sm text-sakura-pink">2024.09 - 至今</span>
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="bg-night-dark/50 rounded-lg p-4 border-l-4 border-pink-400"
                      >
                        <h3 className="text-xl font-bold text-sakura-white mb-2">湖北襄阳四中</h3>
                        <p className="text-sakura-gray font-medium">高中</p>
                        <div className="mt-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-sakura-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-sakura-pink font-medium">2021.09 - 2024.06</span>
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="bg-night-dark/50 rounded-lg p-4 border-l-4 border-purple-400"
                      >
                        <h3 className="text-xl font-bold text-sakura-white mb-2">襄阳市第23中学</h3>
                        <p className="text-sakura-gray font-medium">初中</p>
                        <div className="mt-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-sakura-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-sakura-pink font-medium">2020.09 - 2021.06</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'experience' && (
                <motion.div
                  key="experience"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="glass-card border-2 border-sakura-pink/30 shadow-2xl hover:shadow-sakura-pink/20 transition-shadow mb-6"
                >
                  <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-night-dark px-6 py-4">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-9 8h10M9 7h1m-1 4h1m4-4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" />
                      </svg>
                      学生工作经历
                    </h3>
                    <p className="text-night-dark/80 text-sm mt-1">我的工作履历</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="bg-night-dark/50 rounded-lg p-4 border-l-4 border-sakura-pink"
                      >
                        <div className="mb-2">
                          <h3 className="text-lg font-bold text-sakura-white">智能经济2403班长</h3>
                          <h3 className="text-lg font-bold text-sakura-white">青年志愿者协会项管部部长</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-sakura-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-sakura-pink font-medium">2025.06 - 至今</span>
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="bg-night-dark/50 rounded-lg p-4 border-l-4 border-pink-400"
                      >
                        <div className="mb-2">
                          <h3 className="text-lg font-bold text-sakura-white">经济学类2401学习委员</h3>
                          <h3 className="text-lg font-bold text-sakura-white">青年志愿者协会项管部干事</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-sakura-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-sakura-pink font-medium">2024.09 - 2025.06</span>
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="bg-night-dark/50 rounded-lg p-4 border-l-4 border-purple-400"
                      >
                        <h3 className="text-lg font-bold text-sakura-white mb-2">政治课代表</h3>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-sakura-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-sakura-pink font-medium">2023.09 - 2024.06</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'skills' && (
                <motion.div
                  key="skills"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="glass-card border-2 border-sakura-pink/30 shadow-2xl hover:shadow-sakura-pink/20 transition-shadow mb-6"
                >
                  <div className="bg-gradient-to-r from-pink-400 to-purple-400 text-night-dark px-6 py-4">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      技能专长
                    </h3>
                    <p className="text-night-dark/80 text-sm mt-1">我的专业能力</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="flex items-start gap-3"
                      >
                        <div className="mt-1 w-8 h-8 rounded-full bg-sakura-pink/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-sakura-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sakura-white">Microsoft Office办公软件</h4>
                          <p className="text-sm text-sakura-gray">熟练使用Word、Excel、PowerPoint等办公软件</p>
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex items-start gap-3"
                      >
                        <div className="mt-1 w-8 h-8 rounded-full bg-sakura-pink/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-sakura-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sakura-white">文献检索</h4>
                          <p className="text-sm text-sakura-gray">熟练使用各类学术数据库进行文献检索</p>
                        </div>
                      </motion.div>
                      <div className="h-px bg-sakura-pink/20"></div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="flex items-start gap-3"
                      >
                        <div className="mt-1 w-8 h-8 rounded-full bg-sakura-pink/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-sakura-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sakura-white">写作能力</h4>
                          <p className="text-sm text-sakura-gray">擅长学术论文写作与内容创作</p>
                        </div>
                      </motion.div>
                      <div className="h-px bg-sakura-pink/20"></div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="flex items-start gap-3"
                      >
                        <div className="mt-1 w-8 h-8 rounded-full bg-sakura-pink/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-sakura-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sakura-white">AI编程技术开发</h4>
                          <p className="text-sm text-sakura-gray">前端开发、后端开发、系统架构设计</p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'music' && (
                <motion.div
                  key="music"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="glass-card border-2 border-sakura-pink/30 shadow-2xl hover:shadow-sakura-pink/20 transition-shadow"
                >
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-night-dark px-6 py-4">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l3-3 3 3h6l3 3 3 3 011-9 9 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      爱听的音乐
                    </h3>
                    <p className="text-night-dark/80 text-sm mt-1">音乐播放列表</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {/* 当前播放的音乐 */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="glass-card bg-night-dark/60 backdrop-blur-md border border-sakura-pink/40 rounded-2xl p-6"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-sakura-white mb-1">正在播放</h4>
                            <p className="text-sakura-pink text-sm">{currentMusic.title}</p>
                            <p className="text-sakura-gray text-xs mt-1">{currentMusic.artist}</p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePlayPause(currentMusic)}
                            className="w-14 h-14 rounded-full bg-sakura-pink hover:bg-pink-400 flex items-center justify-center transition-colors shadow-lg shadow-sakura-pink/20"
                          >
                            {isPlaying ? (
                              <svg className="w-7 h-7 text-night-dark" fill="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6h4V7m-4 4H6l-4 4H4v14a2 2 0 012 2z" />
                              </svg>
                            ) : (
                              <svg className="w-7 h-7 text-night-dark" fill="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5v14l4 4H4v-14a2 2 0 00-2 2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                          </motion.button>
                        </div>

                        {/* 播放进度条 */}
                        <div className="relative h-1 bg-night-dark/40 rounded-full overflow-hidden">
                          <motion.div
                            className="absolute top-0 left-0 h-full bg-sakura-pink rounded-full"
                            style={{ width: `${progress}%` }}
                            initial={false}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </motion.div>

                      {/* 播放时间 */}
                      <div className="flex items-center justify-between text-sm text-sakura-gray">
                        <span>{currentMusic.duration}</span>
                        <span>0:00 / {currentMusic.duration}</span>
                      </div>

                      {/* 音乐列表 */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-sakura-white mb-3">播放列表</p>
                        {musicList.map((music, index) => (
                          <motion.button
                            key={music.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                            onClick={() => music.url && handlePlayPause(music)}
                            disabled={!music.url}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                              !music.url
                                ? 'bg-night-dark/20 border-sakura-pink/10 opacity-50 cursor-not-allowed'
                                : currentMusic.id === music.id
                                ? 'bg-sakura-pink/30 border-sakura-pink'
                                : 'bg-night-dark/40 border-sakura-pink/20 hover:bg-sakura-pink/10 hover:border-sakura-pink/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {!music.url ? (
                                  <span className="text-xs text-sakura-gray">🔒</span>
                                ) : currentMusic.id === music.id && isPlaying ? (
                                  <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    className="w-1 h-1 bg-sakura-pink rounded-full"
                                  />
                                ) : null}
                                <span className="text-sm font-medium text-sakura-white">{music.title}</span>
                              </div>
                              <span className="text-xs text-sakura-gray">{music.artist}</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* 隐藏的音频元素 */}
      <div className="relative z-10">
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleMusicEnd}
        />
      </div>
    </motion.div>
  );
};

export default About;
