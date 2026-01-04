# 后端一键部署脚本
# 使用方法：在 PowerShell 中运行此脚本

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "后端一键部署" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 配置
$serverIP = "43.138.3.207"
$serverUser = "root"
$projectRoot = "C:\Users\28945\Desktop\个人网站重制版"

# 需要上传的文件和目录
$filesToUpload = @(
    "Dockerfile",
    "docker-compose.yml",
    "backend\"
)

Write-Host "步骤 1/5: 检查本地文件..." -ForegroundColor Cyan

$allFilesExist = $true
foreach ($item in $filesToUpload) {
    $path = Join-Path $projectRoot $item
    if (-not (Test-Path $path)) {
        Write-Host "✗ 未找到: $item" -ForegroundColor Red
        $allFilesExist = $false
    } else {
        Write-Host "✓ 找到: $item" -ForegroundColor Green
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "错误：缺少必要文件" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "步骤 2/5: 检查是否安装了 SCP..." -ForegroundColor Cyan
$scpAvailable = Get-Command scp -ErrorAction SilentlyContinue

if (-not $scpAvailable) {
    Write-Host "✗ 未找到 SCP 命令" -ForegroundColor Red
    Write-Host ""
    Write-Host "请安装 OpenSSH 客户端：" -ForegroundColor Yellow
    Write-Host "- Windows 10/11: 设置 -> 应用 -> 可选功能 -> 添加功能 -> OpenSSH 客户端" -ForegroundColor White
    Write-Host ""
    Write-Host "或者使用宝塔面板上传文件" -ForegroundColor Yellow
    Write-Host "1. 登录宝塔面板：https://43.138.3.207:20794/8ff1df99" -ForegroundColor White
    Write-Host "2. 进入文件管理，导航到 /var/www/personal-website" -ForegroundColor White
    Write-Host "3. 上传以下文件：" -ForegroundColor White
    Write-Host "   - Dockerfile" -ForegroundColor White
    Write-Host "   - docker-compose.yml" -ForegroundColor White
    Write-Host "   - backend/ (整个目录)" -ForegroundColor White
    Write-Host "4. 上传完成后，在宝塔终端执行：" -ForegroundColor White
    Write-Host "   cd /var/www/personal-website && docker-compose down && docker-compose up -d --build" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ SCP 可用" -ForegroundColor Green
Write-Host ""
Write-Host "步骤 3/5: 上传文件到服务器..." -ForegroundColor Cyan
Write-Host "请输入服务器密码（您的腾讯云服务器密码）" -ForegroundColor Yellow
Write-Host ""

try {
    # 上传 Dockerfile
    Write-Host "上传 Dockerfile..." -ForegroundColor Yellow
    $dockerfile = Join-Path $projectRoot "Dockerfile"
    scp $dockerfile "$serverUser@$serverIP`:/var/www/personal-website/"
    
    # 上传 docker-compose.yml
    Write-Host "上传 docker-compose.yml..." -ForegroundColor Yellow
    $compose = Join-Path $projectRoot "docker-compose.yml"
    scp $compose "$serverUser@$serverIP`:/var/www/personal-website/"
    
    # 上传 backend 目录
    Write-Host "上传 backend/ 目录..." -ForegroundColor Yellow
    $backend = Join-Path $projectRoot "backend"
    scp -r "$backend" "$serverUser@$serverIP`:/var/www/personal-website/"
    
    Write-Host "✓ 文件上传成功！" -ForegroundColor Green
} catch {
    Write-Host "✗ 文件上传失败" -ForegroundColor Red
    Write-Host "错误信息: $_" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "步骤 4/5: 在服务器上构建和启动..." -ForegroundColor Cyan
Write-Host "停止旧容器..." -ForegroundColor Yellow

try {
    ssh $serverUser@$serverIP "cd /var/www/personal-website && docker-compose down"
    
    Write-Host "构建新镜像..." -ForegroundColor Yellow
    ssh $serverUser@$serverIP "cd /var/www/personal-website && docker-compose build --no-cache"
    
    Write-Host "启动容器..." -ForegroundColor Yellow
    ssh $serverUser@$serverIP "cd /var/www/personal-website && docker-compose up -d"
    
    Write-Host "✓ 部署成功！" -ForegroundColor Green
} catch {
    Write-Host "✗ 部署失败" -ForegroundColor Red
    Write-Host "错误信息: $_" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "步骤 5/5: 验证服务状态..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

try {
    $status = ssh $serverUser@$serverIP "docker ps --filter name=personal_website --format '{{.Status}}'"
    Write-Host "容器状态: $status" -ForegroundColor Green
    
    # 检查端口监听
    $portStatus = ssh $serverUser@$serverIP "netstat -tlnp 2>/dev/null | grep 3000 || ss -tlnp | grep 3000"
    if ($portStatus) {
        Write-Host "端口 3000: 正在监听" -ForegroundColor Green
    } else {
        Write-Host "⚠ 端口 3000 未监听" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ 无法验证服务状态" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "后端部署完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "访问地址：" -ForegroundColor White
Write-Host "  - 前端: http://$serverIP:8008" -ForegroundColor Green
Write-Host "  - 后端 API: http://$serverIP:3000" -ForegroundColor Green
Write-Host ""
Write-Host "测试后端 API：" -ForegroundColor Yellow
Write-Host "  curl http://$serverIP:3000/health" -ForegroundColor White
Write-Host ""
Write-Host "查看日志：" -ForegroundColor Yellow
Write-Host "  ssh $serverUser@$serverIP 'cd /var/www/personal-website && docker-compose logs -f'" -ForegroundColor White
Write-Host ""
Write-Host "重启服务：" -ForegroundColor Yellow
Write-Host "  ssh $serverUser@$serverIP 'cd /var/www/personal-website && docker-compose restart'" -ForegroundColor White
