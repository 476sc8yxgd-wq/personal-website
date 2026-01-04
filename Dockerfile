# 多阶段构建 - 先构建前端
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# 复制前端package文件
COPY frontend/package*.json ./
RUN npm install

# 复制前端源代码
COPY frontend/ ./

# 添加构建时间戳强制重新构建
ARG BUILD_DATE=unknown
RUN echo "Build date: $BUILD_DATE" > /tmp/build-info.txt

# 构建前端
RUN npm run build

# 后端构建阶段
FROM node:18-alpine AS backend

WORKDIR /app

# 安装必要的系统工具
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/cache/apk/*

# 复制后端package文件
COPY backend/package*.json ./
RUN npm install

# 复制后端源代码
COPY backend/ ./

# 构建后端（编译TypeScript）
RUN npm run build

# 安装生产依赖
RUN npm install --omit=dev

# 从前端构建阶段复制构建产物
COPY --from=frontend-build /app/frontend/dist ./public

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# 启动应用
CMD ["npm", "start"]