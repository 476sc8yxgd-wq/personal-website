@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo   开始构建前端项目
echo ========================================
echo.

cd /d "%~dp0frontend"

echo [1/2] 安装依赖...
call npm install

if errorlevel 1 (
    echo ✗ 依赖安装失败
    pause
    exit /b 1
)

echo ✓ 依赖安装成功
echo.

echo [2/2] 构建项目...
call npm run build

if errorlevel 1 (
    echo ✗ 项目构建失败
    pause
    exit /b 1
)

echo ✓ 项目构建成功
echo.

echo ========================================
echo   构建完成！
echo ========================================
echo.

echo 构建文件位置: %~dp0frontend\dist
echo.

echo 按任意键打开构建目录...
pause >nul
start "" "%~dp0frontend\dist"
