@echo off
echo ========================================
echo 上传前端文件到服务器
echo ========================================
echo.
echo 请输入服务器密码（输入时不会显示）:
echo.

cd /d "%~dp0"
scp -o StrictHostKeyChecking=no -r dist root@43.138.3.207:/tmp/frontend-update/

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo 上传成功！
    echo ========================================
    echo.
    echo 请回复 AI "文件已上传"，AI 将完成部署
    echo.
) else (
    echo.
    echo ========================================
    echo 上传失败！请检查：
    echo 1. 网络连接是否正常
    echo 2. 服务器密码是否正确
    echo 3. SSH服务是否运行
    echo ========================================
)

pause
