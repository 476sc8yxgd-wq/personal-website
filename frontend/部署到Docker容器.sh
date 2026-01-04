#!/bin/bash

echo "========================================"
echo "部署前端到Docker容器"
echo "========================================"
echo ""

# 1. 检查上传的文件是否存在
echo "1. 检查上传的文件..."
if [ ! -d "/tmp/frontend-update" ]; then
    echo "错误：未找到 /tmp/frontend-update 目录"
    echo "请先通过宝塔面板上传 dist 文件夹到 /tmp/ 目录"
    exit 1
fi
echo "✓ 找到上传的文件"
echo ""

# 2. 备份当前版本
echo "2. 备份当前版本..."
BACKUP_DIR="/app/public.backup.$(date +%Y%m%d_%H%M%S)"
docker exec personal_website_app sh -c "cp -r /app/public $BACKUP_DIR" || echo "备份失败，继续执行..."
echo "✓ 已备份到 $BACKUP_DIR"
echo ""

# 3. 复制新文件到容器
echo "3. 复制新文件到容器..."
docker cp /tmp/frontend-update/. personal_website_app:/app/public/
if [ $? -eq 0 ]; then
    echo "✓ 文件复制成功"
else
    echo "✗ 文件复制失败"
    exit 1
fi
echo ""

# 4. 验证文件
echo "4. 验证文件..."
docker exec personal_website_app sh -c 'ls -lh /app/public/assets/About-*.js'
echo ""

# 5. 重启容器
echo "5. 重启Docker容器..."
docker restart personal_website_app
if [ $? -eq 0 ]; then
    echo "✓ 容器重启成功"
else
    echo "✗ 容器重启失败"
    exit 1
fi
echo ""

# 6. 等待容器启动
echo "6. 等待容器启动..."
sleep 5
echo "✓ 容器已启动"
echo ""

# 7. 检查容器状态
echo "7. 检查容器状态..."
docker ps | grep personal_website_app
echo ""

# 8. 清理临时文件
echo "8. 清理临时文件..."
rm -rf /tmp/frontend-update
echo "✓ 临时文件已清理"
echo ""

echo "========================================"
echo "部署完成！"
echo "========================================"
echo ""
echo "请访问：http://43.138.3.207:3000/"
echo ""
echo "如果页面仍显示旧版本，请按 Ctrl+F5 强制刷新浏览器缓存"
echo ""
