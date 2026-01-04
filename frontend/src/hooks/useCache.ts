import { useState, useCallback, useRef } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface UseCacheOptions {
  expiry?: number; // 缓存过期时间（毫秒），默认5分钟
}

export function useCache<T>(key: string, options: UseCacheOptions = {}) {
  const { expiry = 5 * 60 * 1000 } = options; // 默认5分钟
  const [cache, setCache] = useState<Map<string, CacheItem<T>>>(new Map());
  const cacheRef = useRef(cache);
  cacheRef.current = cache;

  const set = useCallback((data: T) => {
    const newCache = new Map(cacheRef.current);
    newCache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + expiry
    });
    setCache(newCache);
  }, [key, expiry]);

  const get = useCallback((): T | null => {
    const item = cacheRef.current.get(key);
    if (!item) return null;
    
    // 检查是否过期
    if (Date.now() > item.expiry) {
      const newCache = new Map(cacheRef.current);
      newCache.delete(key);
      setCache(newCache);
      return null;
    }
    
    return item.data;
  }, [key]);

  const invalidate = useCallback(() => {
    const newCache = new Map(cacheRef.current);
    newCache.delete(key);
    setCache(newCache);
  }, [key]);

  const clear = useCallback(() => {
    setCache(new Map());
  }, []);

  return { set, get, invalidate, clear };
}