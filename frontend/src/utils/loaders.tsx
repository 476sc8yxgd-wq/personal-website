import React, { Suspense } from 'react';

// 简单的加载组件
export const SimpleLoader: React.FC = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

// 页面加载组件
export const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-white">
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded w-full mb-4"></div>
        <div className="h-32 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  </div>
);

// 通用懒加载高阶组件
export const withLazyLoading = <T extends React.ComponentType<any>>(
  Component: T,
  Loader: React.ComponentType = SimpleLoader
): React.FC<any> => {
  return (props: any) => (
    <Suspense fallback={<Loader />}>
      <Component {...props} />
    </Suspense>
  );
};