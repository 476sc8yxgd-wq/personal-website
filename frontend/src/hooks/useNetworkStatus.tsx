/**
 * 网络状态监听 Hook
 * 实时检测在线/离线状态，提供全局网络状态管理
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  lastOnlineTime: number;
  lastOfflineTime: number;
}

interface NetworkStatusContextType extends NetworkStatus {
  retryConnection: () => void;
}

const NetworkStatusContext = createContext<NetworkStatusContextType | null>(null);

export const NetworkStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });
  
  const [lastOnlineTime, setLastOnlineTime] = useState<number>(Date.now());
  const [lastOfflineTime, setLastOfflineTime] = useState<number>(0);

  useEffect(() => {
    // 初始化网络状态
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        setLastOnlineTime(Date.now());
      }
    }

    const handleOnline = () => {
      console.log('网络已连接');
      setIsOnline(true);
      setLastOnlineTime(Date.now());
    };

    const handleOffline = () => {
      console.log('网络已断开');
      setIsOnline(false);
      setLastOfflineTime(Date.now());
    };

    // 添加事件监听
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 清理事件监听
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const retryConnection = useCallback(() => {
    // 手动重试连接
    if (!navigator.onLine) {
      console.log('当前网络不可用，无法重试');
      return;
    }

    // 刷新页面或重新初始化网络连接
    setIsOnline(navigator.onLine);
  }, []);

  const value: NetworkStatusContextType = {
    isOnline,
    lastOnlineTime,
    lastOfflineTime,
    retryConnection
  };

  return (
    <NetworkStatusContext.Provider value={value}>
      {children}
    </NetworkStatusContext.Provider>
  );
};

export const useNetworkStatus = (): NetworkStatusContextType => {
  const context = useContext(NetworkStatusContext);
  
  if (context === null) {
    // 如果没有 Provider，返回默认值
    return {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      lastOnlineTime: Date.now(),
      lastOfflineTime: 0,
      retryConnection: () => {
        window.location.reload();
      }
    };
  }
  
  return context;
};

export default useNetworkStatus;
