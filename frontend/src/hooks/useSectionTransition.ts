import { useState, useEffect, useRef } from 'react';

interface UseSectionTransitionOptions {
  threshold?: number;
  rootMargin?: string;
}

export const useSectionTransition = (options: UseSectionTransitionOptions = {}) => {
  const { threshold = 0.1, rootMargin = '-10% 0px -10% 0px' } = options;
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold, rootMargin }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [threshold, rootMargin]);

  return { ref: sectionRef, isInView };
};
