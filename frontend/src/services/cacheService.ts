/**
 * IndexedDB 持久化缓存服务
 * 提供类型安全的数据持久化存储，支持 TTL 过期管理
 */

interface CacheItem<T> {
  key: string;
  data: T;
  timestamp: number;
  expiry: number;
}

class CacheService {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'OfflineCacheDB';
  private readonly STORE_NAME = 'cache';
  private readonly DB_VERSION = 1;
  private initPromise: Promise<void> | null = null;

  /**
   * 初始化 IndexedDB 数据库
   */
  private async initDB(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB 打开失败:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'key' });
          store.createIndex('expiry', 'expiry', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * 获取缓存数据
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      await this.initDB();
      
      return new Promise((resolve, reject) => {
        if (!this.db) {
          resolve(null);
          return;
        }

        const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          const result = request.result as CacheItem<T> | undefined;
          
          if (!result) {
            resolve(null);
            return;
          }

          // 检查是否过期
          if (Date.now() > result.expiry) {
            this.delete(key);
            resolve(null);
            return;
          }

          resolve(result.data);
        };

        request.onerror = () => {
          console.error(`获取缓存失败 [${key}]:`, request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('获取缓存时发生错误:', error);
      return null;
    }
  }

  /**
   * 设置缓存数据
   * @param key 缓存键
   * @param data 缓存数据
   * @param ttl 过期时间（毫秒），默认1小时
   */
  async set<T>(key: string, data: T, ttl: number = 60 * 60 * 1000): Promise<void> {
    try {
      await this.initDB();
      
      const item: CacheItem<T> = {
        key,
        data,
        timestamp: Date.now(),
        expiry: Date.now() + ttl
      };

      return new Promise((resolve, reject) => {
        if (!this.db) {
          reject(new Error('Database not initialized'));
          return;
        }

        const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.put(item);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          console.error(`设置缓存失败 [${key}]:`, request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('设置缓存时发生错误:', error);
      throw error;
    }
  }

  /**
   * 检查缓存是否存在且未过期
   */
  async has(key: string): Promise<boolean> {
    const data = await this.get(key);
    return data !== null;
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<void> {
    try {
      await this.initDB();
      
      return new Promise((resolve, reject) => {
        if (!this.db) {
          resolve();
          return;
        }

        const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.delete(key);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          console.error(`删除缓存失败 [${key}]:`, request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('删除缓存时发生错误:', error);
    }
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    try {
      await this.initDB();
      
      return new Promise((resolve, reject) => {
        if (!this.db) {
          resolve();
          return;
        }

        const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          console.error('清空缓存失败:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('清空缓存时发生错误:', error);
    }
  }

  /**
   * 清理过期缓存
   */
  async cleanExpired(): Promise<void> {
    try {
      await this.initDB();
      
      return new Promise((resolve, reject) => {
        if (!this.db) {
          resolve();
          return;
        }

        const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const index = store.index('expiry');
        const now = Date.now();
        const request = index.openCursor(IDBKeyRange.upperBound(now));

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };

        request.onerror = () => {
          console.error('清理过期缓存失败:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('清理过期缓存时发生错误:', error);
    }
  }

  /**
   * 获取所有缓存键
   */
  async keys(): Promise<string[]> {
    try {
      await this.initDB();
      
      return new Promise((resolve, reject) => {
        if (!this.db) {
          resolve([]);
          return;
        }

        const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.getAllKeys();

        request.onsuccess = () => {
          resolve(request.result as string[]);
        };

        request.onerror = () => {
          console.error('获取缓存键失败:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('获取缓存键时发生错误:', error);
      return [];
    }
  }
}

// 导出单例实例
export const cacheService = new CacheService();
