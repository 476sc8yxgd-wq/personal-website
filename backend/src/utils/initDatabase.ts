import fs from 'fs';
import path from 'path';
import pool from '../config/database';

// 初始化数据库
export const initDatabase = async (): Promise<void> => {
  try {
    console.log('开始初始化数据库...');
    
    // 读取SQL文件
    const sqlPath = path.join(__dirname, '../config/schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // 执行SQL语句
    await pool.query(sql);
    
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
};

// 如果直接运行此文件，则执行初始化
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('数据库初始化成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('数据库初始化失败:', error);
      process.exit(1);
    });
}

export default initDatabase;