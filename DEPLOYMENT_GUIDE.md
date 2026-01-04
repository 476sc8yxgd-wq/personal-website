# 个人网站部署指南

## 概述

本指南详细说明如何将个人网站项目部署到腾讯云服务器。项目已迁移到使用Supabase作为数据库，无需自建MySQL数据库。

## 部署环境要求

- Docker 20.0+
- Docker Compose 2.0+
- 腾讯云服务器（CVM）
- Supabase项目（用于数据库和认证）

## 部署步骤

### 1. 准备Supabase项目

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 创建新项目或选择现有项目 "gerenzhuye"
3. 在项目的 Settings > API 中获取以下信息：
   - Project URL
   - anon public key
   - service_role key

### 2. 配置环境变量

1. 复制 `.env.example` 到 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填入Supabase配置：
   ```env
   # Supabase配置
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_key
   ```

3. 编辑 `frontend/.env` 文件：
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

### 3. 构建和部署

使用Docker Compose进行部署：

```bash
# 构建并启动服务
docker-compose up -d --build

# 查看日志
docker-compose logs -f app
```

### 4. 验证部署

1. 访问 http://your-server-ip:3000
2. 检查前端页面是否正常加载
3. 测试各项功能：
   - 浏览博客列表
   - 查看博客详情
   - 提交问答
   - 管理员登录功能

## 数据库迁移

如需从现有MySQL数据库迁移数据：

1. 导出现有MySQL数据：
   ```bash
   mysqldump -u root -p personal_website > data.sql
   ```

2. 手动将数据导入到Supabase：
   - 使用Supabase Dashboard的SQL编辑器
   - 逐表导入数据（注意ID和自增列的处理）

3. 或使用Supabase CLI进行数据导入（需要额外配置）

## 常见问题解决

### 1. 前端无法访问Supabase

检查 `frontend/.env` 中的Supabase配置是否正确。

### 2. 后端API请求失败

检查以下配置：
- `.env` 文件中的Supabase URL和密钥
- Supabase项目的RLS（行级安全）策略是否正确配置
- 网络防火墙是否阻止了出站连接

### 3. 管理员无法登录

确认以下事项：
- Supabase Auth中是否启用了邮箱登录
- 管理员账号是否已在 `admins` 表中创建
- 前端是否正确处理了认证流程

### 4. 构建失败

检查以下几点：
- Node.js版本是否为18.x或更高
- 所有依赖是否已正确安装
- TypeScript代码是否有类型错误

## 性能优化

本部署已包含以下性能优化：

1. **代码分割**：使用React.lazy()实现路由级别的代码分割
2. **缓存策略**：实现API响应缓存，减少重复请求
3. **图片懒加载**：仅在需要时加载图片资源
4. **构建优化**：使用Terser压缩，移除console.log
5. **CDN配置**：Supabase自带CDN加速

## 监控和维护

### 查看日志

```bash
# 查看应用日志
docker-compose logs app

# 查看实时日志
docker-compose logs -f app
```

### 更新部署

```bash
# 停止服务
docker-compose down

# 更新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

### 备份数据

Supabase提供自动备份，也可手动创建备份：
1. 登录Supabase Dashboard
2. 进入 Settings > Database
3. 创建新的备份

## 安全建议

1. 定期更换Supabase API密钥
2. 配置适当的RLS策略限制数据访问
3. 启用Supabase的两因素认证
4. 定期更新Docker镜像和依赖
5. 使用HTTPS（建议配置Nginx反向代理）