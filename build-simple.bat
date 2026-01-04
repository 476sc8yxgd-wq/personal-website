@echo off
REM 切换到前端目录
cd frontend

REM 安装依赖
echo 正在安装依赖...
npm install

REM 构建项目
echo 正在构建项目...
npm run build

echo.
echo 构建完成！
echo 文件位置: frontend\dist
pause
