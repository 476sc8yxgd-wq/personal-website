@echo off
chcp 65001 >nul
cls
echo ========================================
echo   一键修复前端页面
echo ========================================
echo.
echo 本脚本将自动完成以下操作：
echo 1. 上传 About.tsx 到服务器
echo 2. 在服务器上重新构建前端
echo 3. 部署并重启服务
echo.
echo 按任意键继续...
pause >nul

set "serverIP=43.138.3.207"
set "username=root"
set "password=Tencent@12345"
set "localFile=%~dp0frontend\src\pages\About.tsx"
set "remotePath=/root/个人网站重制版_20251226022228/frontend/src/pages/About.tsx"

echo.
echo [1/3] 上传文件到服务器...
echo.

:: 检查是否存在OpenSSH的scp
where scp >nul 2>&1
if %errorlevel% equ 0 (
    echo 使用OpenSSH SCP上传...
    scp -o StrictHostKeyChecking=no "%localFile%" %username%@%serverIP%:%remotePath%
    if %errorlevel% equ 0 (
        echo 文件上传成功！
        goto :deploy
    ) else (
        echo SCP上传失败，错误代码: %errorlevel%
        goto :manual
    )
)

:: 检查PuTTY的pscp
if exist "C:\Program Files\PuTTY\pscp.exe" (
    echo 使用PuTTY PSCP上传...
    "C:\Program Files\PuTTY\pscp.exe" -pw "%password%" -o StrictHostKeyChecking=no "%localFile%" %username%@%serverIP%:%remotePath%
    if %errorlevel% equ 0 (
        echo 文件上传成功！
        goto :deploy
    ) else (
        echo PSCP上传失败，错误代码: %errorlevel%
        goto :manual
    )
)

goto :manual

:deploy
echo.
echo [2/3] 文件已上传！现在请通知AI执行部署命令...
echo.
echo 或者使用以下PowerShell命令通过SSH执行部署：
echo.
echo plink root@%serverIP% -pw %password% "cd /root/个人网站重制版_20251226022228/frontend ^&^& npm run build ^&^& docker cp dist/. personal_website_backend:/app/public/ ^&^& docker restart personal_website_backend"
echo.
echo ========================================
echo   第1步（文件上传）已完成！
echo ========================================
echo.
echo 请返回对话，告诉AI文件已上传完成，
echo AI将立即执行剩余的部署步骤。
echo.
pause
exit /b 0

:manual
echo.
echo ========================================
echo   自动上传失败，请手动上传
echo ========================================
echo.
echo 方法1: 使用WinSCP/FileZilla等FTP工具
echo   服务器: %serverIP%
echo   用户名: %username%
echo   密码: %password%
echo   上传文件: %localFile%
echo   目标路径: %remotePath%
echo.
echo 方法2: 使用PowerShell的SCP命令
echo   scp "%localFile%" %username%@%serverIP%:%remotePath%
echo.
echo 方法3: 使用SSH登录后手动创建文件
echo   ssh %username%@%serverIP%
echo   密码: %password%
echo   然后手动创建/编辑文件
echo.
pause
