# 上传前端文件到服务器脚本
# 用法：在 PowerShell 中运行 .\upload-to-server.ps1

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "上传前端文件到服务器" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 配置
$serverIP = "43.138.3.207"
$serverUser = "root"  # 根据实际情况修改
$localDistPath = "frontend/dist"
$serverDistPath = "/var/www/personal-website/public"

# 检查本地文件是否存在
if (-not (Test-Path $localDistPath)) {
    Write-Host "错误：未找到前端构建文件目录 $localDistPath" -ForegroundColor Red
    Write-Host "请先运行: cd frontend && npm run build" -ForegroundColor Yellow
    exit 1
}

Write-Host "本地文件目录: $localDistPath" -ForegroundColor Green
Write-Host "服务器目录: $serverDistPath" -ForegroundColor Green
Write-Host ""

# 检查是否安装了 SCP
$scpAvailable = Get-Command scp -ErrorAction SilentlyContinue

if ($scpAvailable) {
    Write-Host "使用 SCP 上传文件..." -ForegroundColor Green
    Write-Host "执行: scp -r $localDistPath/* $serverUser@$serverIP:$serverDistPath/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "请在下面输入服务器密码：" -ForegroundColor Yellow

    # 使用 SCP 上传
    scp -r "$localDistPath/*" "$serverUser@$serverIP:$serverDistPath/"

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ 文件上传成功！" -ForegroundColor Green
        Write-Host ""
        Write-Host "下一步操作：" -ForegroundColor Cyan
        Write-Host "1. SSH 登录服务器：ssh $serverUser@$serverIP" -ForegroundColor White
        Write-Host "2. 进入项目目录：cd /var/www/personal-website" -ForegroundColor White
        Write-Host "3. 重启服务：docker-compose restart" -ForegroundColor White
        Write-Host ""
        Write-Host "访问网站：http://$serverIP:8008" -ForegroundColor Green
    } else {
        Write-Host "❌ 上传失败" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "未找到 SCP 命令" -ForegroundColor Red
    Write-Host ""
    Write-Host "请安装 OpenSSH 客户端：" -ForegroundColor Yellow
    Write-Host "- Windows 10/11: 设置 -> 应用 -> 可选功能 -> 添加功能 -> OpenSSH 客户端" -ForegroundColor White
    Write-Host ""
    Write-Host "或者使用其他工具上传：" -ForegroundColor Yellow
    Write-Host "- WinSCP: https://winscp.net/" -ForegroundColor White
    Write-Host "- FileZilla: https://filezilla-project.org/" -ForegroundColor White
    Write-Host ""
    Write-Host "手动上传步骤：" -ForegroundColor Cyan
    Write-Host "1. 连接到服务器: $serverIP" -ForegroundColor White
    Write-Host "2. 上传 frontend/dist 目录下所有文件到 $serverDistPath" -ForegroundColor White
    Write-Host "3. 在服务器上重启服务: docker-compose restart" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
