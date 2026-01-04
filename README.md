# 个人网站

这是一个基于React + Node.js + Supabase的个人网站，包含个人介绍、博客和互动问答三大功能模块。项目已从MySQL迁移到Supabase，提供更好的性能和可扩展性。

## 技术栈

- **前端**: React, Vite, TypeScript, Tailwind CSS
- **后端**: Node.js, Express, TypeScript
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **部署**: Docker, Docker Compose

## 功能特性

- **个人介绍**: 展示个人基本信息、教育背景和职业经历
- **博客系统**: 发布和管理博客文章，支持分类浏览和标签
- **互动问答**: 用户可以提问、点赞和博主回答
- **用户认证**: 基于Supabase的用户登录系统
- **管理后台**: 管理员可以管理博客、分类和问答
- **性能优化**: 代码分割、懒加载、缓存策略

## 快速开始

### 前置要求

- Node.js 18+
- Docker 和 Docker Compose
- Git

### 本地开发环境

1. 克隆项目
```bash
git clone <your-repo-url>
cd 个人网站重制版
```

2. 安装前端依赖
```bash
cd frontend
npm install
```

3. 安装后端依赖
```bash
cd ../backend
npm install
```

4. 设置环境变量
```bash
cd backend
cp .env.example .env
# 编辑 .env 文件，设置数据库连接信息
```

5. 启动本地开发服务器
```bash
# 启动后端（在backend目录下）
npm run dev

# 启动前端（在frontend目录下，新终端）
npm run dev
```

### 使用Docker部署（推荐）

1. 确保已安装Docker和Docker Compose

2. 运行部署脚本
- Windows:
```bash
deploy.bat
```
- Linux/macOS:
```bash
chmod +x deploy.sh
./deploy.sh
```

3. 访问网站
- 前端地址: http://localhost:3000
- 后端API: http://localhost:3000/api
- 健康检查: http://localhost:3000/health

### 手动Docker部署

1. 构建并启动服务
```bash
docker-compose up --build -d
```

2. 查看服务状态
```bash
docker-compose ps
```

3. 查看日志
```bash
docker-compose logs -f
```

4. 停止服务
```bash
docker-compose down
```

## 环境变量配置

### 后端环境变量 (.env)

```env
# 服务器配置
PORT=3000
NODE_ENV=production

# 数据库配置
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=rootpassword
MYSQL_DATABASE=personal_website
```

## 项目结构

```
个人网站重制版/
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/       # 可复用组件
│   │   ├── pages/           # 页面组件
│   │   ├── services/        # API服务
│   │   └── types/           # TypeScript类型定义
│   ├── public/              # 静态资源
│   └── package.json
├── backend/                  # 后端应用
│   ├── src/
│   │   ├── config/          # 配置文件
│   │   ├── controllers/     # 控制器
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由定义
│   │   └── server.ts        # 服务器入口
│   └── package.json
├── docker-compose.yml        # Docker Compose配置
├── Dockerfile               # Docker构建配置
├── deploy.sh                # Linux/macOS部署脚本
└── deploy.bat               # Windows部署脚本
```

## 数据库结构

项目使用MySQL作为数据库，包含以下表:

- `profile`: 个人信息表
- `blogs`: 博客文章表
- `categories`: 博客分类表
- `qa`: 问答表

数据库结构文件位于 `backend/src/config/schema.sql`。

## 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 进入后端容器
docker-compose exec app sh

# 进入数据库容器
docker-compose exec mysql mysql -u root -p
```

## 腾讯云Lighthouse部署

本项目支持部署到腾讯云轻量应用服务器，请确保服务器已安装Docker环境。

1. 上传项目文件到服务器
2. 运行部署脚本
3. 配置防火墙规则，开放3000端口

## 许可证

MIT License