# 部署前端文件到服务器
# 需要先安装 OpenSSH 客户端

param(
    [string]$ServerIP = "43.138.3.207",
    [string]$Username = "root",
    [string]$LocalPath = "frontend\dist",
    [string]$RemotePath = "/var/www/personal-website/public"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "部署前端文件到服务器" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查本地文件
if (-not (Test-Path $LocalPath)) {
    Write-Host "❌ 错误：未找到本地构建文件目录 $LocalPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 本地文件目录: $LocalPath" -ForegroundColor Green
Write-Host "📤 目标服务器: $ServerIP" -ForegroundColor Yellow
Write-Host "📂 目标路径: $RemotePath" -ForegroundColor Yellow
Write-Host ""

# 检查是否安装了 SCP
$scpCommand = Get-Command scp -ErrorAction SilentlyContinue

if ($null -eq $scpCommand) {
    Write-Host "❌ 未找到 SCP 命令" -ForegroundColor Red
    Write-Host ""
    Write-Host "请安装 OpenSSH 客户端：" -ForegroundColor Yellow
    Write-Host "以管理员身份运行 PowerShell，执行：" -ForegroundColor White
    Write-Host "Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "或者使用 WinSCP 图形化工具：" -ForegroundColor Yellow
    Write-Host "1. 下载: https://winscp.net/" -ForegroundColor White
    Write-Host "2. 连接到: ${Username}@${ServerIP}" -ForegroundColor White
    Write-Host "3. 上传: ${LocalPath}\* 到 ${RemotePath}/" -ForegroundColor White
    Write-Host "4. 重启: docker-compose restart" -ForegroundColor White
    exit 1
}

# 清理远程服务器上的旧文件
Write-Host "🧹 清理远程服务器旧文件..." -ForegroundColor Yellow
$cleanupCommand = "rm -rf ${RemotePath}/* && mkdir -p ${RemotePath}/assets"
$executeCleanup = ssh ${Username}@${ServerIP} $cleanupCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 远程文件清理完成" -ForegroundColor Green
} else {
    Write-Host "⚠️ 警告：无法清理远程文件，继续上传" -ForegroundColor Yellow
}

Write-Host ""

# 上传文件
Write-Host "📤 开始上传文件..." -ForegroundColor Cyan
Write-Host ""

# 上传 index.html
Write-Host "上传 index.html..." -ForegroundColor White
scp "${LocalPath}/index.html" "${Username}@${ServerIP}:${RemotePath}/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 上传 index.html 失败" -ForegroundColor Red
    exit 1
}
Write-Host "✅ index.html 上传完成" -ForegroundColor Green

# 上传 assets 目录
Write-Host "上传 assets 目录..." -ForegroundColor White
scp -r "${LocalPath}/assets/*" "${Username}@${ServerIP}:${RemotePath}/assets/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 上传 assets 失败" -ForegroundColor Red
    exit 1
}
Write-Host "✅ assets 上传完成" -ForegroundColor Green

Write-Host ""

# 重启服务
Write-Host "🔄 重启 Docker 容器..." -ForegroundColor Cyan
$restartCommand = "cd /var/www/personal-website && docker-compose restart"
ssh ${Username}@${ServerIP} $restartCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ 部署成功！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 访问地址: http://${ServerIP}:8008" -ForegroundColor Cyan
    Write-Host "❤️ 健康检查: http://${ServerIP}:8008/api/health" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "等待服务启动..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3

    # 检查服务状态
    $response = Invoke-WebRequest -Uri "http://${ServerIP}:8008/api/health" -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ 服务运行正常！" -ForegroundColor Green
    } else {
        Write-Host "⚠️ 服务可能需要更多时间启动" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "❌ 重启服务失败" -ForegroundColor Red
    Write-Host "请手动 SSH 登录服务器检查：" -ForegroundColor Yellow
    Write-Host "ssh ${Username}@${ServerIP}" -ForegroundColor White
    Write-Host "cd /var/www/personal-website" -ForegroundColor White
    Write-Host "docker-compose restart" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "📋 查看日志: ssh ${Username}@${ServerIP} 'cd /var/www/personal-website && docker logs -f'" -ForegroundColor Gray
Write-Host ""
