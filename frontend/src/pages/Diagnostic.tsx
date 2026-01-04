import React, { useState } from 'react';
import { supabase } from '../config/supabase';

const Diagnostic: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string, type: 'info' | 'success' | 'error') => {
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    setResults(prev => [...prev, `${icon} ${message}`]);
  };

  const runDiagnostics = async () => {
    setResults([]);
    setLoading(true);

    // 1. 检查Supabase客户端配置
    addResult('开始诊断...', 'info');
    addResult('Supabase URL: https://assfhuxuglbootvpigeu.supabase.co', 'info');
    addResult('Supabase Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzc2ZodXh1Z2xib290dnBpZ2V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzOTIzNjUsImV4cCI6MjA4MTk2ODM2NX0...', 'info');

    // 2. 测试profile表查询
    try {
      addResult('测试查询profile表...', 'info');
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .single();

      if (error) {
        addResult(`查询失败: ${error.message}`, 'error');
        addResult(`错误详情: ${JSON.stringify(error)}`, 'error');
      } else {
        addResult(`查询成功! 获取到数据: ${data?.name}`, 'success');
      }
    } catch (e: any) {
      addResult(`异常: ${e.message}`, 'error');
    }

    // 3. 测试blogs表查询
    try {
      addResult('测试查询blogs表...', 'info');
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title')
        .limit(1);

      if (error) {
        addResult(`查询失败: ${error.message}`, 'error');
      } else {
        addResult(`查询成功! 找到 ${data?.length || 0} 篇博客`, 'success');
      }
    } catch (e: any) {
      addResult(`异常: ${e.message}`, 'error');
    }

    // 4. 测试qa表查询
    try {
      addResult('测试查询qa表...', 'info');
      const { data, error } = await supabase
        .from('qa')
        .select('id, question')
        .limit(1);

      if (error) {
        addResult(`查询失败: ${error.message}`, 'error');
      } else {
        addResult(`查询成功! 找到 ${data?.length || 0} 个问题`, 'success');
      }
    } catch (e: any) {
      addResult(`异常: ${e.message}`, 'error');
    }

    setLoading(false);
    addResult('诊断完成!', 'info');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Supabase连接诊断工具
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">操作</h2>
          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '诊断中...' : '运行诊断'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">诊断结果</h2>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div key={index} className="font-mono text-sm p-2 bg-gray-50 rounded border">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">常见错误说明</h2>
          <div className="space-y-4 text-sm">
            <div>
              <strong>Invalid API key</strong>
              <p className="text-gray-600">API Key无效或已过期，需要从Supabase控制台获取新的Key</p>
            </div>
            <div>
              <strong>Table not found</strong>
              <p className="text-gray-600">数据库表不存在，需要在Supabase控制台创建表结构</p>
            </div>
            <div>
              <strong>Permission denied</strong>
              <p className="text-gray-600">RLS策略阻止访问，需要配置允许anon用户访问的策略</p>
            </div>
            <div>
              <strong>Network error</strong>
              <p className="text-gray-600">网络连接问题，检查防火墙和代理设置</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnostic;
