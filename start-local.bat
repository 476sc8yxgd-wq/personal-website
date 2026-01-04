@echo off
chcp 65001 >nul
echo ======================================
echo 个人网站本地启动脚本
echo ======================================
echo.

echo 1. 检查Node.js环境...
node --version
if errorlevel 1 (
    echo ❌ 未安装Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo 2. 安装后端依赖...
cd backend
if not exist node_modules (
    npm install
) else (
    echo ✅ 后端依赖已存在
)

echo.
echo 3. 启动后端服务(端口:3001)...
start "后端服务" cmd /k "npm run dev"

echo.
echo 4. 安装前端依赖...
cd ..\frontend
if not exist node_modules (
    npm install
) else (
    echo ✅ 前端依赖已存在
)

echo.
echo 5. 启动前端服务(端口:5173)...
start "前端服务" cmd /k "npm run dev"

echo.
echo ======================================
echo ✅ 启动完成！
echo ======================================
echo 前端地址: http://localhost:5173
echo 后端API: http://localhost:3001/api
echo 健康检查: http://localhost:3001/health
echo.
echo 注意：请确保两个窗口都保持运行状态
echo.
pause