import { useState, useEffect, RefObject } from 'react';

interface UseSectionAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

interface AnimationState {
  isVisible: boolean;
  hasAnimated: boolean;
}

export const useSectionAnimation = (
  ref: RefObject<HTMLElement>,
  options: UseSectionAnimationOptions = {}
): AnimationState => {
  const { threshold = 0.2, rootMargin = '0px', once = false } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasAnimated(true);

          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [ref, threshold, rootMargin, once]);

  return { isVisible, hasAnimated };
};
