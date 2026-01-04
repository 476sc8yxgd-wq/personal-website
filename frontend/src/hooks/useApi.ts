import { useState, useEffect, useCallback } from 'react';
import { useCache } from './useCache';
import { cacheService } from '../services/cacheService';
import { useNetworkStatus } from './useNetworkStatus';

interface UseApiOptions<T> {
  immediate?: boolean; // 是否立即执行
  cacheKey?: string; // 缓存键，如果提供则启用缓存
  cacheExpiry?: number; // 缓存过期时间（毫秒）
  retryCount?: number; // 失败重试次数，默认3次
  offlineFallback?: T; // 离线时的备用数据
}

interface UseApiResult<T, P extends any[]> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...params: P) => Promise<T | null>;
  reset: () => void;
  isFromCache: boolean; // 数据是否来自缓存
}

export function useApi<T, P extends any[] = []>(
  apiFunc: (...params: P) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T, P> {
  const { immediate = false, cacheKey, cacheExpiry, retryCount = 3, offlineFallback } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  
  const cache = useCache<T>(cacheKey || '', { expiry: cacheExpiry });
  const { isOnline } = useNetworkStatus();
  
  // 带重试的 API 调用
  const callApiWithRetry = useCallback(async (...params: P): Promise<T> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < retryCount; attempt++) {
      try {
        const result = await apiFunc(...params);
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('未知错误');
        
        // 如果不是最后一次尝试，等待一段时间后重试
        if (attempt < retryCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    
    throw lastError;
  }, [apiFunc, retryCount]);
  
  const execute = useCallback(async (...params: P): Promise<T | null> => {
    setIsFromCache(false);
    
    // 离线模式：优先显示缓存数据
    if (!isOnline) {
      if (cacheKey) {
        // 先尝试从 IndexedDB 获取
        const persistentData = await cacheService.get<T>(cacheKey);
        if (persistentData) {
          console.log(`[离线模式] 使用持久化缓存 [${cacheKey}]`);
          setData(persistentData);
          setIsFromCache(true);
          return persistentData;
        }
        
        // 再尝试从内存缓存获取
        const memoryData = cache.get();
        if (memoryData) {
          console.log(`[离线模式] 使用内存缓存 [${cacheKey}]`);
          setData(memoryData);
          setIsFromCache(true);
          return memoryData;
        }
      }
      
      // 使用备用数据
      if (offlineFallback !== undefined) {
        console.log(`[离线模式] 使用备用数据 [${cacheKey}]`);
        setData(offlineFallback);
        setIsFromCache(true);
        return offlineFallback;
      }
      
      // 完全离线，返回 null
      console.log(`[离线模式] 无可用数据 [${cacheKey}]`);
      setError('当前离线，请检查网络连接');
      return null;
    }
    
    // 在线模式：尝试调用 API
    try {
      setLoading(true);
      setError(null);
      
      // 如果有缓存键，先尝试从缓存获取（快速响应）
      if (cacheKey) {
        const cachedData = cache.get();
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return cachedData;
        }
      }
      
      // 调用 API（带重试）
      const result = await callApiWithRetry(...params);
      setData(result);
      
      // 如果有缓存键，将结果存入内存缓存
      if (cacheKey) {
        cache.set(result);
        // 同时存入持久化缓存（用于离线时回退）
        await cacheService.set(cacheKey, result, cacheExpiry);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      console.error(`[API调用失败] ${cacheKey}:`, errorMessage);
      setError(errorMessage);
      
      // API 失败时，尝试使用缓存数据
      if (cacheKey) {
        // 先尝试从持久化缓存获取
        const persistentData = await cacheService.get<T>(cacheKey);
        if (persistentData) {
          console.log(`[API失败] 使用持久化缓存 [${cacheKey}]`);
          setData(persistentData);
          setIsFromCache(true);
          return persistentData;
        }
        
        // 再尝试从内存缓存获取
        const memoryData = cache.get();
        if (memoryData) {
          console.log(`[API失败] 使用内存缓存 [${cacheKey}]`);
          setData(memoryData);
          setIsFromCache(true);
          return memoryData;
        }
      }
      
      // 使用备用数据
      if (offlineFallback !== undefined) {
        setData(offlineFallback);
        setIsFromCache(true);
        return offlineFallback;
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFunc, cacheKey, cacheExpiry, retryCount, offlineFallback, isOnline, cache, callApiWithRetry]);
  
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setIsFromCache(false);
    if (cacheKey) {
      cache.invalidate();
      // 同时清除持久化缓存
      cacheService.delete(cacheKey);
    }
  }, [cacheKey, cache]);
  
  useEffect(() => {
    if (immediate) {
      (execute as () => Promise<T | null>)();
    }
  }, [immediate, execute]);
  
  return { data, loading, error, execute, reset, isFromCache };
}