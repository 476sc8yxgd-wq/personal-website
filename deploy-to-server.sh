#!/bin/bash

# 管理后台功能部署脚本
# 在宝塔面板终端中执行此脚本

echo "========================================"
echo "开始部署管理后台功能..."
echo "========================================"
echo ""

# 检查项目目录
if [ ! -d "/var/www/personal-website" ]; then
    echo "错误：项目目录不存在"
    exit 1
fi

# 进入项目目录
cd /var/www/personal-website

echo "步骤 1/3: 备份当前文件..."
if [ -d "public_backup" ]; then
    rm -rf public_backup
fi
cp -r public public_backup
echo "✓ 备份完成"
echo ""

echo "步骤 2/3: 清空 public 目录..."
rm -rf public/*
echo "✓ 清空完成"
echo ""

echo "步骤 3/3: 重启 Docker 服务..."
docker-compose restart
echo "✓ 服务重启完成"
echo ""

echo "========================================"
echo "部署准备完成！"
echo "========================================"
echo ""
echo "⚠️  重要提示："
echo "1. 请手动将 frontend/dist 目录下的所有文件上传到 /var/www/personal-website/public"
echo "2. 上传完成后，Docker 服务已自动重启"
echo "3. 访问网站测试：http://43.138.3.207:8008"
echo ""
echo "如需恢复备份："
echo "cp -r public_backup/* public/"
echo ""
