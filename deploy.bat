@echo off
echo ======================================
echo 个人网站部署脚本
echo ======================================

REM 检查是否存在 Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo 错误: Docker 未安装，请先安装 Docker
    pause
    exit /b 1
)

REM 检查是否存在 Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo 错误: Docker Compose 未安装，请先安装 Docker Compose
    pause
    exit /b 1
)

REM 设置环境变量
set NODE_ENV=production

REM 停止并删除旧容器（如果存在）
echo 停止并删除旧容器...
docker-compose down --volumes --remove-orphans

REM 构建并启动新容器
echo 构建并启动新容器...
docker-compose up --build -d

REM 等待容器启动
echo 等待服务启动...
timeout /t 30 /nobreak >nul

REM 检查服务状态
echo 检查服务状态...
curl -f http://localhost:3000/health
if errorlevel 1 (
    echo ❌ 部署失败，请检查日志:
    docker-compose logs --tail=20
    pause
    exit /b 1
)

echo.
echo ✅ 部署成功！网站已在 http://localhost:3000 上运行
echo.
echo ======================================
echo 部署信息
echo ======================================
echo 前端服务: http://localhost:3000
echo 后端API: http://localhost:3000/api
echo 健康检查: http://localhost:3000/health
echo 数据库服务: localhost:3306
echo.
echo 查看日志: docker-compose logs -f
echo 停止服务: docker-compose down
pause