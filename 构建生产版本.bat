@echo off
chcp 65001 >nul
cd /d "%~dp0frontend"

echo ========================================
echo   构建前端生产版本
echo ========================================
echo.

echo [1/2] 清理缓存...
if exist dist rmdir /s /q dist
if exist node_modules\.vite rmdir /s /q node_modules\.vite
echo ✓ 缓存清理完成
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
echo 下一步：使用宝塔面板上传 dist 目录
pause
