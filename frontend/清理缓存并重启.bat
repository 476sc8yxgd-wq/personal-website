@echo off
chcp 65001 > nul
echo =========================================
echo  清理缓存并重启开发服务器
echo =========================================
echo.

echo [1/5] 清理 Vite 缓存...
echo.
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo     ✓ Vite 缓存已清理
) else (
    echo     ✗ Vite 缓存不存在
)
echo.

echo [2/5] 清理构建产物...
echo.
if exist "dist" (
    rmdir /s /q "dist"
    echo     ✓ 构建产物已清理
) else (
    echo     ✗ 构建产物不存在
)
echo.

echo [3/5] 清理浏览器本地存储...
echo.
echo     注意: 请手动在浏览器中按 Ctrl+Shift+Delete 清除缓存
echo.

echo =========================================
echo  清理完成！
echo =========================================
echo.
echo 现在启动开发服务器...
echo.
npm run dev

pause
