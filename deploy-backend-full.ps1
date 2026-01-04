# 后端一键完整部署脚本
# 自动打包、上传、部署后端

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "后端一键完整部署" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 配置
$serverIP = "43.138.3.207"
$serverUser = "root"
$projectRoot = "C:\Users\28945\Desktop\个人网站重制版"
$localTemp = "$env:TEMP\personal-website-deploy"

Write-Host "步骤 1/6: 检查本地文件..." -ForegroundColor Cyan

# 检查必要文件
$requiredFiles = @(
    "Dockerfile",
    "docker-compose.yml",
    "backend\package.json",
    "backend\tsconfig.json",
    "backend\src\server.ts",
    "backend\src\config\supabase.ts"
)

$allFilesExist = $true
foreach ($item in $requiredFiles) {
    $path = Join-Path $projectRoot $item
    if (-not (Test-Path $path)) {
        Write-Host "✗ 未找到: $item" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "错误：缺少必要文件" -ForegroundColor Red
    exit 1
}

Write-Host "✓ 所有必要文件存在" -ForegroundColor Green
Write-Host ""

Write-Host "步骤 2/6: 创建临时目录..." -ForegroundColor Cyan
if (Test-Path $localTemp) {
    Remove-Item -Recurse -Force $localTemp
}
New-Item -ItemType Directory -Force -Path $localTemp | Out-Null
Write-Host "✓ 临时目录创建成功" -ForegroundColor Green
Write-Host ""

Write-Host "步骤 3/6: 准备部署文件..." -ForegroundColor Cyan

# 复制必要文件到临时目录
Copy-Item (Join-Path $projectRoot "Dockerfile") -Destination $localTemp
Copy-Item (Join-Path $projectRoot "docker-compose.yml") -Destination $localTemp
Copy-Item (Join-Path $projectRoot "backend") -Destination "$localTemp\backend" -Recurse

Write-Host "✓ 文件准备完成" -ForegroundColor Green
Write-Host ""

Write-Host "步骤 4/6: 检查是否安装了 SCP..." -ForegroundColor Cyan
$scpAvailable = Get-Command scp -ErrorAction SilentlyContinue

if (-not $scpAvailable) {
    Write-Host "✗ 未找到 SCP 命令" -ForegroundColor Red
    Write-Host ""
    Write-Host "请安装 OpenSSH 客户端：" -ForegroundColor Yellow
    Write-Host "- Windows 10/11: 设置 -> 应用 -> 可选功能 -> 添加功能 -> OpenSSH 客户端" -ForegroundColor White
    Write-Host ""
    Write-Host "或者使用手动部署：" -ForegroundColor Yellow
    Write-Host "1. 打开: C:\Users\28945\Desktop\个人网站重制版\后端部署指南.md" -ForegroundColor White
    Write-Host "2. 按照指南手动操作" -ForegroundColor White
    exit 1
}

Write-Host "✓ SCP 可用" -ForegroundColor Green
Write-Host ""
Write-Host "步骤 5/6: 上传文件到服务器..." -ForegroundColor Cyan
Write-Host "请输入服务器密码（您的腾讯云服务器密码）" -ForegroundColor Yellow
Write-Host ""

try {
    # 在服务器上创建备份
    Write-Host "创建服务器备份..." -ForegroundColor Yellow
    ssh $serverUser@$serverIP "cd /var/www/personal-website && tar -czf backup_upload_$(date +%Y%m%d_%H%M%S).tar.gz . 2>/dev/null || true"

    # 上传 Dockerfile
    Write-Host "上传 Dockerfile..." -ForegroundColor Yellow
    scp "$localTemp\Dockerfile" "$serverUser@$serverIP`:/var/www/personal-website/"

    # 上传 docker-compose.yml
    Write-Host "上传 docker-compose.yml..." -ForegroundColor Yellow
    scp "$localTemp\docker-compose.yml" "$serverUser@$serverIP`:/var/www/personal-website/"

    # 上传 backend 目录
    Write-Host "上传 backend/ 目录..." -ForegroundColor Yellow
    scp -r "$localTemp\backend" "$serverUser@$serverIP`:/var/www/personal-website/"

    Write-Host "✓ 文件上传成功！" -ForegroundColor Green
} catch {
    Write-Host "✗ 文件上传失败" -ForegroundColor Red
    Write-Host "错误信息: $_" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "步骤 6/6: 在服务器上构建和部署..." -ForegroundColor Cyan

try {
    # 停止旧容器
    Write-Host "停止旧容器..." -ForegroundColor Yellow
    ssh $serverUser@$serverIP "cd /var/www/personal-website && docker-compose down"

    # 清理旧镜像
    Write-Host "清理旧镜像..." -ForegroundColor Yellow
    ssh $serverUser@$serverIP "docker image prune -f"

    # 构建新镜像
    Write-Host "构建新镜像（这可能需要几分钟）..." -ForegroundColor Yellow
    ssh $serverUser@$serverIP "cd /var/www/personal-website && docker-compose build --no-cache"

    # 启动容器
    Write-Host "启动容器..." -ForegroundColor Yellow
    ssh $serverUser@$serverIP "cd /var/www/personal-website && docker-compose up -d"

    Write-Host "✓ 部署成功！" -ForegroundColor Green
} catch {
    Write-Host "✗ 部署失败" -ForegroundColor Red
    Write-Host "错误信息: $_" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "请尝试手动部署：" -ForegroundColor Yellow
    Write-Host "1. 打开: C:\Users\28945\Desktop\个人网站重制版\后端部署指南.md" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "验证部署状态..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 5

# 验证容器状态
try {
    Write-Host "检查容器状态..." -ForegroundColor Yellow
    $status = ssh $serverUser@$serverIP "docker ps --filter name=personal_website --format '{{.Status}}'"
    Write-Host "容器状态: $status" -ForegroundColor Green

    # 检查端口
    Write-Host ""
    Write-Host "检查端口..." -ForegroundColor Yellow
    $ports = ssh $serverUser@$serverIP "ss -tlnp | grep -E ':(3000|8008)' || echo '端口未监听'"
    Write-Host $ports -ForegroundColor Green

    # 测试后端 API
    Write-Host ""
    Write-Host "测试后端 API..." -ForegroundColor Yellow
    $apiTest = ssh $serverUser@$serverIP "curl -s http://localhost:3000/api/health || echo 'API 测试失败'"
    Write-Host "API 测试: $apiTest" -ForegroundColor Green
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
Write-Host "  - 健康检查: http://$serverIP:3000/health" -ForegroundColor Green
Write-Host ""
Write-Host "测试后端 API：" -ForegroundColor Yellow
Write-Host "  curl http://$serverIP:3000/api/health" -ForegroundColor White
Write-Host ""
Write-Host "查看日志：" -ForegroundColor Yellow
Write-Host "  ssh $serverUser@$serverIP 'cd /var/www/personal-website && docker-compose logs -f'" -ForegroundColor White
Write-Host ""
Write-Host "重启服务：" -ForegroundColor Yellow
Write-Host "  ssh $serverUser@$serverIP 'cd /var/www/personal-website && docker-compose restart'" -ForegroundColor White
Write-Host ""

# 清理临时文件
Write-Host "清理临时文件..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $localTemp
Write-Host "✓ 清理完成" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 部署完成！现在可以访问您的网站了！" -ForegroundColor Green
Write-Host ""
Write-Host "详细文档: C:\Users\28945\Desktop\个人网站重制版\后端部署指南.md" -ForegroundColor Yellow
