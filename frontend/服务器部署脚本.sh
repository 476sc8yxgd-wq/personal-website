#!/bin/bash

echo "========================================"
echo "开始部署前端到Docker容器"
echo "========================================"
echo ""

# 检查上传的文件是否存在
if [ ! -d "/tmp/frontend-update" ]; then
    echo "错误：未找到上传的文件 /tmp/frontend-update"
    echo "请先在本地执行 上传到服务器.bat"
    exit 1
fi

# 备份当前版本
echo "1. 备份当前版本..."
docker exec personal_website_app sh -c 'cp -r /app/public /app/public.backup.$(date +%Y%m%d_%H%M%S)'

# 复制新文件到容器
echo "2. 复制新文件到容器..."
docker cp /tmp/frontend-update/. personal_website_app:/app/public/

# 验证文件复制
echo "3. 验证文件..."
docker exec personal_website_app sh -c 'ls -la /app/public/assets/About-*.js | head -5'

# 重启容器
echo "4. 重启Docker容器..."
docker restart personal_website_app

# 等待容器启动
echo "5. 等待容器启动..."
sleep 5

# 检查容器状态
echo "6. 检查容器状态..."
docker ps | grep personal_website_app

# 清理临时文件
echo "7. 清理临时文件..."
rm -rf /tmp/frontend-update

echo ""
echo "========================================"
echo "部署完成！"
echo "========================================"
echo ""
echo "请访问：http://43.138.3.207:3000/"
echo ""
echo "如果页面仍显示旧版本，请按 Ctrl+F5 强制刷新浏览器缓存"
echo ""
