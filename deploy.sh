#!/bin/bash

echo "======================================"
echo "个人网站部署脚本"
echo "======================================"

# 检查是否存在 Docker 和 Docker Compose
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "错误: Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 设置环境变量
export NODE_ENV=production

# 停止并删除旧容器（如果存在）
echo "停止并删除旧容器..."
docker-compose down --volumes --remove-orphans

# 构建并启动新容器
echo "构建并启动新容器..."
docker-compose up --build -d

# 等待容器启动
echo "等待服务启动..."
sleep 30

# 检查服务状态
echo "检查服务状态..."
if curl -f http://localhost:3000/health; then
    echo "✅ 部署成功！网站已在 http://localhost:3000 上运行"
    echo ""
    echo "======================================"
    echo "部署信息"
    echo "======================================"
    echo "前端服务: http://localhost:3000"
    echo "后端API: http://localhost:3000/api"
    echo "健康检查: http://localhost:3000/health"
    echo "数据库服务: localhost:3306"
    echo ""
    echo "查看日志: docker-compose logs -f"
    echo "停止服务: docker-compose down"
else
    echo "❌ 部署失败，请检查日志:"
    docker-compose logs --tail=20
    exit 1
fi