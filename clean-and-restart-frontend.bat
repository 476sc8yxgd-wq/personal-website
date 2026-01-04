@echo off
chcp 65001 >nul
echo ======================================
echo 前端完整清理和重启脚本
echo ======================================
echo.

echo 1. 停止所有运行的Vite进程...
taskkill /F /IM node.exe 2>nul
if errorlevel 1 (
    echo ✅ 没有运行中的Vite进程
) else (
    echo ✅ 已停止Vite进程
)

echo.
echo 2. 清理构建缓存...
if exist "frontend\dist" (
    rmdir /s /q "frontend\dist"
    echo ✅ 已删除 dist 目录
) else (
    echo ✅ dist 目录不存在
)

echo.
echo 3. 清理Vite缓存...
if exist "frontend\node_modules\.vite" (
    rmdir /s /q "frontend\node_modules\.vite"
    echo ✅ 已删除 Vite 缓存
) else (
    echo ✅ Vite 缓存不存在
)

echo.
echo 4. 验证文件扩展名...
dir "frontend\src\hooks\useNetworkStatus.*" /B
echo.

echo 5. 启动前端开发服务器...
cd frontend
start "前端服务" cmd /k "npm run dev"

echo.
echo ======================================
echo ✅ 清理完成并启动服务器
echo ======================================
echo 前端地址: http://localhost:3000
echo.
echo 重要：请在浏览器中按 Ctrl+Shift+R 硬刷新页面
echo.
pause
