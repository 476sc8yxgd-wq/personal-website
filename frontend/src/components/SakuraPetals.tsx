import React, { useState, useEffect } from 'react';

interface SakuraPetalProps {
  id: number;
  style: React.CSSProperties;
}

const SakuraPetals: React.FC = () => {
  const [petals, setPetals] = useState<SakuraPetalProps[]>([]);

  useEffect(() => {
    // 生成 5-7 片花瓣
    const petalCount = window.innerWidth < 768 ? 3 : 7; // 移动端减少花瓣
    const newPetals: SakuraPetalProps[] = [];

    for (let i = 0; i < petalCount; i++) {
      const size = 10 + Math.random() * 15; // 10-25px
      const left = Math.random() * 100; // 0-100% 宽度
      const delay = Math.random() * 15; // 0-15秒延迟
      const duration = 8 + Math.random() * 7; // 8-15秒下落时长

      newPetals.push({
        id: i,
        style: {
          left: `${left}%`,
          width: `${size}px`,
          height: `${size}px`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        },
      });
    }

    setPetals(newPetals);
  }, []);

  return (
    <>
      {petals.map((petal) => (
        <div key={petal.id} className="sakura-petal" style={petal.style} />
      ))}
    </>
  );
};

export default SakuraPetals;
