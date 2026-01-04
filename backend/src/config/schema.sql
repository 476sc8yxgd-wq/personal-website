-- 个人网站数据库结构设计
-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS personal_website;
USE personal_website;

-- 创建应用数据库用户并授权
CREATE USER IF NOT EXISTS 'website_user'@'%' IDENTIFIED BY 'website_password';
GRANT ALL PRIVILEGES ON personal_website.* TO 'website_user'@'%';
FLUSH PRIVILEGES;

-- 个人信息表
CREATE TABLE IF NOT EXISTS profile (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INT NOT NULL,
  location VARCHAR(100) NOT NULL,
  qq VARCHAR(20) NOT NULL,
  motto TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 博客分类表
CREATE TABLE IF NOT EXISTS blog_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 博客文章表
CREATE TABLE IF NOT EXISTS blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content LONGTEXT NOT NULL,
  category_id INT,
  author VARCHAR(50) DEFAULT '博主',
  view_count INT DEFAULT 0,
  status ENUM('draft', 'published') DEFAULT 'published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL
);

-- 博客标签表
CREATE TABLE IF NOT EXISTS blog_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 博客标签关联表
CREATE TABLE IF NOT EXISTS blog_tag_relations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  blog_id INT NOT NULL,
  tag_id INT NOT NULL,
  FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES blog_tags(id) ON DELETE CASCADE,
  UNIQUE KEY unique_blog_tag (blog_id, tag_id)
);

-- 问答表
CREATE TABLE IF NOT EXISTS qa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT,
  questioner_ip VARCHAR(45),
  question_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  answer_time TIMESTAMP NULL,
  likes INT DEFAULT 0,
  status ENUM('pending', 'answered') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  blog_id INT NOT NULL,
  content TEXT NOT NULL,
  author_name VARCHAR(50) NOT NULL DEFAULT '匿名',
  author_ip VARCHAR(45),
  parent_id INT NULL,
  status ENUM('pending', 'approved') DEFAULT 'approved',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- 初始化数据
-- 插入默认管理员账号（密码：admin123，已加密）
INSERT INTO admins (username, password, email) VALUES 
('admin', '$2a$10$K2XjZP2YdYdYdYdYdYdYdeXQGvQ5wLZmW8M6lP6R9cXzYvF3H2Qe', 'admin@example.com')
ON DUPLICATE KEY UPDATE username = username;

-- 插入默认个人简介
INSERT INTO profile (name, age, location, qq, motto) VALUES 
('尹博一', 20, '武汉', '2894580779', '自己满溢，自己降露，自己做焦枯荒野上的雨')
ON DUPLICATE KEY UPDATE name = name;

-- 插入默认博客分类
INSERT INTO blog_categories (name, description) VALUES 
('生活感悟', '生活中的所思所感'),
('技术分享', '技术相关的学习和分享'),
('读书笔记', '阅读后的思考和总结'),
('其他', '其他内容')
ON DUPLICATE KEY UPDATE name = name;

-- 插入默认标签
INSERT INTO blog_tags (name) VALUES 
('生活'), ('学习'), ('技术'), ('读书'), ('思考'), ('成长')
ON DUPLICATE KEY UPDATE name = name;