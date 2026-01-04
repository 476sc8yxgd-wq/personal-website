/**
 * 网络状态提示组件
 * 显示当前在线/离线状态，提供优雅的用户反馈
 */

import React, { useState } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { X, Wifi, WifiOff, RefreshCw } from 'lucide-react';

const NetworkStatus: React.FC = () => {
  const { isOnline, lastOfflineTime, retryConnection } = useNetworkStatus();
  const [dismissed, setDismissed] = useState(false);

  // 在线状态时不显示，或者已手动关闭
  if (isOnline || dismissed) {
    return null;
  }

  // 计算离线时长
  const getOfflineDuration = () => {
    if (lastOfflineTime === 0) return '刚刚';
    const minutes = Math.floor((Date.now() - lastOfflineTime) / 60000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    return '更早';
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* 离线状态横幅 */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* 左侧：图标和提示信息 */}
            <div className="flex items-center gap-3">
              {/* 离线图标（带动画） */}
              <div className="relative">
                <WifiOff className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>

              {/* 提示信息 */}
              <div className="flex flex-col">
                <span className="font-semibold text-base">
                  网络连接已断开
                </span>
                <span className="text-sm text-amber-100">
                  正在显示缓存数据 · {getOfflineDuration()}断开
                </span>
              </div>
            </div>

            {/* 右侧：操作按钮 */}
            <div className="flex items-center gap-2">
              {/* 重试按钮 */}
              <button
                onClick={retryConnection}
                className="flex items-center gap-2 px-4 py-2 bg-white text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-colors active:scale-95 transform"
              >
                <RefreshCw className="w-4 h-4" />
                <span>重新连接</span>
              </button>

              {/* 关闭按钮 */}
              <button
                onClick={() => setDismissed(true)}
                className="p-2 hover:bg-amber-700/30 rounded-lg transition-colors active:scale-95 transform"
                aria-label="关闭提示"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 离线状态指示器（页面右上角小圆点） */}
      <div className="absolute top-4 right-4">
        <div className="relative">
          <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center shadow-lg">
            <WifiOff className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 在线状态提示组件（可选，用于调试或明确显示连接状态）
 */
export const OnlineStatus: React.FC = () => {
  const { isOnline } = useNetworkStatus();

  if (!isOnline) {
    return <NetworkStatus />;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* 在线状态横幅（半透明） */}
      <div className="bg-gradient-to-r from-green-500/95 to-emerald-600/95 text-white shadow-sm backdrop-blur-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            <span className="text-sm font-medium">
              网络连接正常
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatus;
