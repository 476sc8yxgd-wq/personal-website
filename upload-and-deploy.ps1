# 自动上传并部署脚本
# 使用方法：在 PowerShell 中运行此脚本

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "自动上传并部署前端项目" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 配置
$serverIP = "43.138.3.207"
$serverUser = "root"
$localDistPath = "C:\Users\28945\Desktop\个人网站重制版\frontend\dist"
$serverPublicPath = "/var/www/personal-website/public"

# 检查本地文件
if (-not (Test-Path $localDistPath)) {
    Write-Host "错误：未找到前端构建文件" -ForegroundColor Red
    Write-Host "请先运行: cd frontend && npm run build" -ForegroundColor Yellow
    exit 1
}

Write-Host "本地文件: $localDistPath" -ForegroundColor Green
Write-Host "服务器路径: $serverPublicPath" -ForegroundColor Green
Write-Host ""

# 检查是否安装了 SCP
$scpAvailable = Get-Command scp -ErrorAction SilentlyContinue

if ($scpAvailable) {
    Write-Host "步骤 1/3: 上传文件到服务器..." -ForegroundColor Cyan
    Write-Host "请输入服务器密码（您的腾讯云服务器密码）" -ForegroundColor Yellow
    Write-Host ""

    # 清空服务器上的 public 目录
    Write-Host "清空服务器目录..." -ForegroundColor Yellow
    ssh $serverUser@$serverIP "rm -rf $serverPublicPath/*"

    # 上传文件
    Write-Host "上传文件中..." -ForegroundColor Yellow
    scp -r "$localDistPath/*" "$serverUser@$serverIP:$serverPublicPath/"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 文件上传成功！" -ForegroundColor Green
    } else {
        Write-Host "✗ 文件上传失败" -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "步骤 2/3: 重启 Docker 服务..." -ForegroundColor Cyan
    ssh $serverUser@$serverIP "cd /var/www/personal-website && docker-compose restart"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 服务重启成功！" -ForegroundColor Green
    } else {
        Write-Host "✗ 服务重启失败" -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "步骤 3/3: 验证服务状态..." -ForegroundColor Cyan
    $status = ssh $serverUser@$serverIP "cd /var/www/personal-website && docker ps --filter name=personal_website --format '{{.Status}}'"
    Write-Host "容器状态: $status" -ForegroundColor Green
} else {
    Write-Host "未找到 SCP 命令" -ForegroundColor Red
    Write-Host ""
    Write-Host "请安装 OpenSSH 客户端：" -ForegroundColor Yellow
    Write-Host "- Windows 10/11: 设置 -> 应用 -> 可选功能 -> 添加功能 -> OpenSSH 客户端" -ForegroundColor White
    Write-Host ""
    Write-Host "或者使用其他工具上传：" -ForegroundColor Yellow
    Write-Host "- 宝塔面板（推荐）" -ForegroundColor White
    Write-Host "- WinSCP: https://winscp.net/" -ForegroundColor White
    Write-Host "- FileZilla: https://filezilla-project.org/" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "部署完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "访问网站: http://$serverIP:8008" -ForegroundColor Green
Write-Host ""
Write-Host "下一步操作：" -ForegroundColor Cyan
Write-Host "1. 在 Supabase 控制台创建 Storage 存储桶（blog-images）" -ForegroundColor White
Write-Host "2. 设置存储桶权限（公开访问和上传权限）" -ForegroundColor White
Write-Host "3. 在管理后台测试新功能" -ForegroundColor White
Write-Host ""
Write-Host "详细部署指南: C:\Users\28945\Desktop\个人网站重制版\管理后台功能部署指南.md" -ForegroundColor Yellow
