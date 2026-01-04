#!/bin/bash

echo "========================================="
echo "  个人网站About页面修复脚本"
echo "========================================="
echo ""

# 进入项目目录
cd /root/个人网站重制版_20251226022228/frontend/src/pages

# 备份旧文件
if [ -f "About.tsx" ]; then
    echo "[1/4] 备份旧文件..."
    cp About.tsx About.tsx.backup.$(date +%Y%m%d_%H%M%S)
    echo "✓ 备份完成"
else
    echo "[1/4] 未找到旧文件，跳过备份"
fi

echo ""
echo "[2/4] 创建新的About.tsx文件..."
echo "注意：这个脚本需要你手动输入文件内容"

# 提示用户需要手动创建文件
cat << 'MANUAL_INSTRUCTIONS'
========================================
重要提示：
========================================

由于文件较大，本脚本无法自动创建About.tsx。

请手动执行以下步骤之一：

方法A：使用SCP从本地上传
----------------------------------------
在本地的PowerShell中执行：
cd C:\Users\28945\Desktop\个人网站重制版
scp frontend\src\pages\About.tsx root@43.138.3.207:/root/个人网站重制版_20251226022228/frontend/src/pages/About.tsx

方法B：使用vi/vim手动编辑
----------------------------------------
在服务器上执行：
vi /root/个人网站重制版_20251226022228/frontend/src/pages/About.tsx

然后将本地文件 C:\Users\28945\Desktop\个人网站重制版\frontend\src\pages\About.tsx 的内容复制粘贴进去。

保存方法：按ESC，输入 :wq，按回车

方法C：使用nano手动编辑
----------------------------------------
在服务器上执行：
nano /root/个人网站重制版_20251226022228/frontend/src/pages/About.tsx

然后粘贴文件内容。
保存方法：按Ctrl+O保存，按Enter确认，按Ctrl+X退出

MANUAL_INSTRUCTIONS

echo ""
echo "文件更新完成后，请按Enter继续执行后续步骤..."
read

# 检查文件是否已更新
echo ""
echo "[3/4] 检查文件..."
FILE_SIZE=$(stat -f%z About.tsx 2>/dev/null || stat -c%s About.tsx 2>/dev/null)
if [ "$FILE_SIZE" -gt 10000 ]; then
    echo "✓ 文件大小: $FILE_SIZE 字节"
else
    echo "✗ 警告：文件大小异常 ($FILE_SIZE 字节)，可能未正确更新"
    echo "请确认文件已正确更新后再继续"
    exit 1
fi

echo ""
echo "[4/4] 重新构建前端..."
cd /root/个人网站重制版_20251226022228/frontend

echo "执行 npm run build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✓ 构建成功"
else
    echo "✗ 构建失败"
    exit 1
fi

echo ""
echo "[5/5] 部署到后端容器..."
docker cp dist/. personal_website_backend:/app/public/

if [ $? -eq 0 ]; then
    echo "✓ 文件复制成功"
else
    echo "✗ 文件复制失败"
    exit 1
fi

echo ""
echo "[6/6] 重启后端服务..."
docker restart personal_website_backend

echo ""
echo "========================================="
echo "  部署完成！"
echo "========================================="
echo ""
echo "请访问 http://43.138.3.207 查看效果"
echo ""
echo "如果仍然看到旧页面，请："
echo "1. 清除浏览器缓存"
echo "2. 使用无痕模式访问"
echo "3. 按 Ctrl+F5 强制刷新"
echo ""
