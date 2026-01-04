# 上传后端源代码文件

## 说明

backend 目录结构已创建，现在只需上传源代码文件。

## 自动化上传（推荐）

### 运行 PowerShell 脚本：

```powershell
cd "C:\Users\28945\Desktop\个人网站重制版"
.\upload-backend-files.ps1
```

然后输入服务器密码。

### 脚本会自动上传以下文件：

```
backend/src/server.ts
backend/src/config/supabase.ts
backend/src/config/database.ts
backend/src/config/schema.sql
backend/src/controllers/blogController.ts
backend/src/controllers/profileController.ts
backend/src/controllers/qaController.ts
backend/src/models/Blog.ts
backend/src/models/Profile.ts
backend/src/models/QA.ts
backend/src/routes/blog.ts
backend/src/routes/profile.ts
backend/src/routes/qa.ts
backend/src/types/index.ts
backend/src/utils/initDatabase.ts
```

## 手动上传（如果脚本失败）

### 使用宝塔面板：

1. 登录：https://43.138.3.207:20794/8ff1df99

2. 导航到：`/var/www/personal-website/backend/src/`

3. 逐个上传以下文件到对应目录：

#### config/ 目录：
- ✅ `supabase.ts`
- ✅ `database.ts`
- ✅ `schema.sql`

#### controllers/ 目录：
- ✅ `blogController.ts`
- ✅ `profileController.ts`
- ✅ `qaController.ts`

#### models/ 目录：
- ✅ `Blog.ts`
- ✅ `Profile.ts`
- ✅ `QA.ts`

#### routes/ 目录：
- ✅ `blog.ts`
- ✅ `profile.ts`
- ✅ `qa.ts`

#### types/ 目录：
- ✅ `index.ts`

#### utils/ 目录：
- ✅ `initDatabase.ts`

#### src/ 根目录：
- ✅ `server.ts`

## 上传完成后的部署命令

在宝塔终端执行：

```bash
cd /var/www/personal-website

# 构建并启动
docker-compose build --no-cache
docker-compose up -d

# 查看日志
docker-compose logs -f
```

---

**预计完成时间：** 3-5 分钟
