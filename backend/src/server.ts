import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import supabase from './config/supabase';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase连接测试
const initializeDatabase = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // 测试Supabase连接，通过查询profile表
    const { data, error } = await supabase
      .from('profile')
      .select('count')
      .limit(1);
      
    if (error) {
      console.error('Failed to connect to Supabase:', error);
      return false;
    }
    
    console.log('Successfully connected to Supabase');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// 启动时初始化数据库
initializeDatabase();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 基本路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// 健康检查端点（用于Docker）
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 导入路由
import profileRoutes from './routes/profile';
import blogRoutes from './routes/blog';
import qaRoutes from './routes/qa';

// 使用路由
app.use('/api/profile', profileRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/qa', qaRoutes);

// 在生产环境中，提供静态文件服务
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public', { index: false }));

  // 处理React Router的客户端路由（只处理非API路径）
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile('index.html', { root: 'public' });
  });
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;