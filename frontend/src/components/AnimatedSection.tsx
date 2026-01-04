import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  duration?: number;
  once?: boolean;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.6,
  once = true,
}) => {
  // 根据方向设置初始和可见状态
  const getVariants = () => {
    const variants = {
      hidden: {
        opacity: 0,
        ...(direction === 'up' && { y: 50 }),
        ...(direction === 'down' && { y: -50 }),
        ...(direction === 'left' && { x: -50 }),
        ...(direction === 'right' && { x: 50 }),
      },
      visible: {
        opacity: 1,
        ...(direction === 'up' && { y: 0 }),
        ...(direction === 'down' && { y: 0 }),
        ...(direction === 'left' && { x: 0 }),
        ...(direction === 'right' && { x: 0 }),
      },
    };

    return variants;
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.2 }}
      variants={getVariants()}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94], // 自定义缓动函数，使动画更流畅
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
