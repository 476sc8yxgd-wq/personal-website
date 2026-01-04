import React, { useEffect, useState } from 'react';
import { blogApi } from '../services/supabase';

const DebugCoverImage: React.FC = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await blogApi.getBlogs(0, 10);
        console.log('[Debug] 博客数据:', result);
        setBlogs(result.blogs);
      } catch (error) {
        console.error('[Debug] 获取博客失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-8">封面图调试页面</h1>

      {loading ? (
        <p>加载中...</p>
      ) : (
        <div className="space-y-8">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">博客数据详情</h2>
            <pre className="bg-white p-4 rounded border overflow-auto max-h-96">
              {JSON.stringify(blogs, null, 2)}
            </pre>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">博客卡片</h2>
            {blogs.map((blog, index) => {
              const coverImage = blog.cover_image;
              return (
                <div key={blog.id} className="border-2 border-blue-500 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">{blog.title}</h3>
                  <div className="space-y-2 text-sm">
                    <p>ID: {blog.id}</p>
                    <p>封面图存在: {!!coverImage ? '✅' : '❌'}</p>
                    <p>封面图为空字符串: {coverImage === '' ? '✅' : '❌'}</p>
                    <p>封面图类型: {typeof coverImage}</p>
                    <p>封面图值: {coverImage || '无'}</p>
                  </div>

                  <div className="mt-4 border border-green-500 p-4 rounded">
                    <h4 className="font-semibold mb-2">图片测试</h4>
                    {coverImage && coverImage.trim() !== '' ? (
                      <div className="space-y-4">
                        <div>
                          <p className="mb-2">直接显示：</p>
                          <img
                            src={coverImage}
                            alt={blog.title}
                            className="max-w-full h-48 object-cover"
                            onLoad={() => console.log(`[Debug] 图片 ${index + 1} 加载成功`)}
                            onError={() => console.log(`[Debug] 图片 ${index + 1} 加载失败`)}
                          />
                        </div>
                        <div>
                          <p className="mb-2">在新标签页打开：</p>
                          <a
                            href={coverImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {coverImage}
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">无封面图</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugCoverImage;
