# API 错误修复报告

## 修复日期
2025-12-25

## 问题描述

### 问题 1：Supabase 查询 400 错误
**错误信息：**
```
HEAD https://assfhuxuglbootvpigeu.supabase.co/rest/v1/blogs?select=*&status=eq.published&category_id=eq.null 400 (Bad Request)
```

**根本原因：**
在 `frontend/src/services/supabase.ts` 中，当参数为 `undefined` 时，代码使用了错误的 null 查询语法：
- ❌ 错误: `category_id=eq.null`
- ❌ 错误: `status=eq.null`

**问题位置：**
- 第82行：`.eq('category_id', categoryId || null);`
- 第215行：`.eq('status', status || null);`

**修复方案：**
改为使用条件判断，只在有值时才添加 `.eq()` 过滤条件：

```typescript
// 修复后的代码
let countQuery = supabase
  .from('blogs')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'published');

if (categoryId) {
  countQuery = countQuery.eq('category_id', categoryId);
}

const { count: totalCount } = await countQuery;
```

### 问题 2：后端 API 502 错误
**错误信息：**
```
GET http://43.138.3.207/api/profile 502 (Bad Gateway)
```

**根本原因：**
1. `server.js` 中配置了 `/api` 路由代理到 `http://localhost:3000`
2. 生产环境中 `localhost:3000` 不可用（前端是静态文件）
3. 前端已改为直接使用 Supabase SDK，不需要后端 API 代理

**修复方案：**
1. 删除不再使用的 `frontend/src/services/api.ts` 文件
2. 移除 `server.js` 中的 API 代理配置
3. 确保所有前端代码都使用 Supabase SDK (`supabase.ts`)

## 修复内容

### 文件修改列表

1. **frontend/src/services/supabase.ts**
   - 修复 `blogApi.getBlogs` 函数中的 null 查询（第77-82行）
   - 修复 `qaApi.getQuestions` 函数中的 null 查询（第211-215行）

2. **frontend/src/services/api.ts**
   - 已删除（不再使用）

3. **server.js**
   - 移除了 `/api` 代理配置
   - 移除了 `http-proxy-middleware` 依赖

4. **frontend/vite.config.ts**
   - 移除了 `root: process.cwd()` 配置（可能导致构建问题）

## 验证步骤

### 1. 本地测试
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 构建前端
npm run build

# 启动本地服务器
cd ..
npm start
```

### 2. 浏览器测试
1. 打开 http://localhost:8008
2. 检查控制台是否有 400 或 502 错误
3. 测试博客列表加载
4. 测试问答功能

### 3. Supabase 查询验证
确保生成的 Supabase 查询语句正确：
- 有分类 ID 时: `category_id=eq.1`
- 无分类 ID 时: 不包含 `category_id` 参数
- 不应该出现 `category_id=eq.null`

## 技术说明

### Supabase 查询 null 的正确语法

| 场景 | 正确语法 | 错误语法 |
|------|----------|----------|
| 查询 null 值 | `.is('field', null)` | `.eq('field', null)` |
| 查询非 null | `.is('field', 'not.null')` | `.neq('field', null)` |
| 可选过滤 | 有值时才 `.eq()` | `.eq('field', value \|\| null)` |

### 架构变更

**之前的架构：**
```
前端 → /api/* → 服务器代理 → http://localhost:3000 → Supabase
```

**修复后的架构：**
```
前端 → Supabase SDK → Supabase (直连)
```

## 后续建议

1. **移除代理依赖**
   ```bash
   npm uninstall http-proxy-middleware
   ```

2. **更新部署文档**
   - 说明前端使用 Supabase 直连
   - 不需要后端 API 路由

3. **监控 Supabase 查询**
   - 检查是否有其他类似的 null 查询问题
   - 使用 Supabase Dashboard 监控查询性能

## 影响范围

- ✅ 前端代码：已修复，使用 Supabase SDK
- ✅ 后端代码：已简化，移除不必要的代理
- ✅ 数据库查询：已修复 null 值查询语法
- ⚠️ 需要重新构建并部署前端

## 部署前检查清单

- [ ] 前端构建成功 (`npm run build`)
- [ ] 没有编译错误或警告
- [ ] 本地测试通过
- [ ] Supabase 查询正常
- [ ] 浏览器控制台无错误

## 预期结果

修复后，网站应该：
- ✅ 不再出现 400 Bad Request 错误
- ✅ 不再出现 502 Bad Gateway 错误
- ✅ 博客列表正常加载
- ✅ 问答功能正常工作
- ✅ 所有 Supabase 查询使用正确语法

---

**修复完成时间：** 2025-12-25
**修复人员：** AI Coding Assistant
