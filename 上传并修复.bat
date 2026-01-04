@echo off
chcp 65001 >nul
cls
echo ========================================
echo   一键上传并修复前端页面
echo ========================================
echo.
echo 本脚本将自动完成以下操作：
echo 1. 上传 About.tsx 到服务器
echo 2. 通知AI执行部署命令
echo.
echo 准备开始...
pause

cd /d "%~dp0"
set "serverIP=43.138.3.207"
set "username=root"
set "localFile=frontend\src\pages\About.tsx"
set "remotePath=/root/个人网站重制版_20251226022228/frontend/src/pages/About.tsx"

echo.
echo [1/2] 正在上传文件到服务器...
echo.

:: 检查文件是否存在
if not exist "%localFile%" (
    echo ✗ 错误：找不到文件 %localFile%
    echo.
    echo 请确保当前目录是项目根目录
    pause
    exit /b 1
)

echo 本地文件: %localFile%
echo 目标服务器: %username%@%serverIP%
echo 目标路径: %remotePath%
echo.

:: 尝试使用SCP（OpenSSH）
where scp >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ 找到OpenSSH的SCP工具
    echo 正在上传...
    scp -o StrictHostKeyChecking=no "%localFile%" %username%@%serverIP%:%remotePath%

    if %errorlevel% equ 0 (
        echo.
        echo ========================================
        echo   ✓ 文件上传成功！
        echo ========================================
        echo.
        echo [2/2] 请立即回到AI对话窗口，
        echo     输入"文件已上传"
        echo.
        echo AI将自动执行：
        echo   - 重新构建前端
        echo   - 部署到后端容器
        echo   - 重启服务
        echo.
        echo 按任意键打开AI对话窗口...
        pause >nul
        start https://claude.ai/chat
        exit /b 0
    ) else (
        echo ✗ SCP上传失败，错误代码: %errorlevel%
        echo.
        goto :try_putty
    )
)

:try_putty
:: 检查PuTTY的pscp
if exist "C:\Program Files\PuTTY\pscp.exe" (
    echo ✓ 找到PuTTY的PSCP工具
    echo 正在上传...
    "C:\Program Files\PuTTY\pscp.exe" -o StrictHostKeyChecking=no -pw Tencent@12345 "%localFile%" %username%@%serverIP%:%remotePath%

    if %errorlevel% equ 0 (
        echo.
        echo ========================================
        echo   ✓ 文件上传成功！
        echo ========================================
        echo.
        echo [2/2] 请立即回到AI对话窗口，
        echo     输入"文件已上传"
        echo.
        echo AI将自动执行：
        echo   - 重新构建前端
        echo   - 部署到后端容器
        echo   - 重启服务
        echo.
        echo 按任意键打开AI对话窗口...
        pause >nul
        start https://claude.ai/chat
        exit /b 0
    ) else (
        echo ✗ PSCP上传失败，错误代码: %errorlevel%
        echo.
    )
)

:: 都失败了，显示手动上传说明
echo ========================================
echo   ✗ 自动上传失败，请手动上传
echo ========================================
echo.
echo 原因：未找到SCP工具（OpenSSH或PuTTY）
echo.
echo 解决方案：
echo.
echo 方案1：安装OpenSSH客户端
echo   Windows 10/11通常已预装，尝试在PowerShell中运行：
echo   scp "%localFile%" %username%@%serverIP%:%remotePath%
echo.
echo 方案2：安装PuTTY
echo   下载地址：https://www.putty.org/
echo   安装后重新运行本脚本
echo.
echo 方案3：使用FTP工具（WinSCP/FileZilla）
echo   - 服务器: %serverIP%
echo   - 用户名: %username%
echo   - 密码: Tencent@12345
echo   - 上传文件: %localFile%
echo   - 目标路径: %remotePath%
echo.
echo 方案4：使用SSH登录后手动创建
echo   1. 下载SSH客户端（如PuTTY）
echo   2. 连接到 %serverIP%
echo   3. 登录后执行:
echo      vi /root/个人网站重制版_20251226022228/frontend/src/pages/About.tsx
echo   4. 复制粘贴本地文件内容
echo.
echo 上传成功后，请回到AI对话输入："文件已上传"
echo.
pause
