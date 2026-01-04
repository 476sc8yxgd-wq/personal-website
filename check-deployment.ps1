# 部署状态检查脚本
# 用法：在 PowerShell 中运行 .\check-deployment.ps1

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "部署状态检查" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 配置
$serverIP = "43.138.3.207"
$port = 8008

Write-Host "检查目标服务器: $serverIP:$port" -ForegroundColor Yellow
Write-Host ""

# 1. 检查网络连接
Write-Host "1. 检查网络连接..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://${serverIP}:${port}/api/health" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ 网络连接正常" -ForegroundColor Green
        $healthData = $response.Content | ConvertFrom-Json
        Write-Host "   时间戳: $($healthData.timestamp)" -ForegroundColor Gray
        Write-Host "   消息: $($healthData.message)" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ 网络连接异常 (Status: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ 无法连接到服务器" -ForegroundColor Red
    Write-Host "   错误: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "请检查:" -ForegroundColor Yellow
    Write-Host "  - 服务器是否运行" -ForegroundColor White
    Write-Host "  - 端口 $port 是否开放" -ForegroundColor White
    Write-Host "  - 防火墙设置" -ForegroundColor White
    exit 1
}

Write-Host ""

# 2. 检查前端入口文件
Write-Host "2. 检查前端入口文件..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://${serverIP}:${port}/" -TimeoutSec 5 -UseBasicParsing
    $htmlContent = $response.Content

    if ($htmlContent -match '<!doctype html>' -and $htmlContent -match '<div id="root">') {
        Write-Host "   ✅ HTML 入口文件正常" -ForegroundColor Green

        if ($htmlContent -match '/assets/index-.*\.js') {
            Write-Host "   ✅ JavaScript 文件引用正常" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️ JavaScript 文件引用异常" -ForegroundColor Yellow
        }

        if ($htmlContent -match '/assets/index-.*\.css') {
            Write-Host "   ✅ CSS 文件引用正常" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️ CSS 文件引用异常" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ HTML 入口文件异常" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ 无法检查前端文件" -ForegroundColor Red
    Write-Host "   错误: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 3. 检查静态资源（简化版，只检查是否能访问）
Write-Host "3. 检查静态资源..." -ForegroundColor Yellow
$jsFile = "/assets/index-Bnmig0ZE.js"
$cssFile = "/assets/index-B4bKsMer.css"

try {
    $jsResponse = Invoke-WebRequest -Uri "http://${serverIP}:${port}${jsFile}" -TimeoutSec 5 -UseBasicParsing -Method Head
    if ($jsResponse.StatusCode -eq 200) {
        Write-Host "   ✅ JavaScript 文件可访问" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ JavaScript 文件未上传或无法访问" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️ JavaScript 文件未上传 (Status: 404)" -ForegroundColor Yellow
}

try {
    $cssResponse = Invoke-WebRequest -Uri "http://${serverIP}:${port}${cssFile}" -TimeoutSec 5 -UseBasicParsing -Method Head
    if ($cssResponse.StatusCode -eq 200) {
        Write-Host "   ✅ CSS 文件可访问" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ CSS 文件未上传或无法访问" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️ CSS 文件未上传 (Status: 404)" -ForegroundColor Yellow
}

Write-Host ""

# 4. 总结
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "部署状态总结" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "访问地址: http://${serverIP}:${port}" -ForegroundColor Green
Write-Host ""

Write-Host "如果静态资源显示 ⚠️，请执行以下操作:" -ForegroundColor Yellow
Write-Host ""
Write-Host "方法一（推荐）：" -ForegroundColor Cyan
Write-Host "  1. 运行上传脚本: .\upload-to-server.ps1" -ForegroundColor White
Write-Host "  2. 在服务器重启: ssh root@${serverIP} 'cd /var/www/personal-website && docker-compose restart'" -ForegroundColor White
Write-Host ""
Write-Host "方法二（图形化）：" -ForegroundColor Cyan
Write-Host "  1. 使用 WinSCP 连接到 ${serverIP}" -ForegroundColor White
Write-Host "  2. 上传 frontend/dist/* 到 /var/www/personal-website/public/" -ForegroundColor White
Write-Host "  3. SSH 登录服务器并重启容器" -ForegroundColor White
Write-Host ""
Write-Host "详细步骤请参考:" -ForegroundColor Yellow
Write-Host "  - 前端文件上传指南.md" -ForegroundColor White
Write-Host "  - 部署完成报告.md" -ForegroundColor White
Write-Host ""
