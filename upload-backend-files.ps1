# 上传后端源代码文件脚本
$ErrorActionPreference = "Stop"

$serverIP = "43.138.3.207"
$serverUser = "root"
$backendRoot = "C:\Users\28945\Desktop\个人网站重制版\backend"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "上传后端源代码文件" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "步骤 1/2: 检查本地文件..." -ForegroundColor Cyan

$filesToUpload = @(
    @{ Local="src\server.ts"; Remote="backend/src/server.ts" },
    @{ Local="src\config\supabase.ts"; Remote="backend/src/config/supabase.ts" },
    @{ Local="src\config\database.ts"; Remote="backend/src/config/database.ts" },
    @{ Local="src\config\schema.sql"; Remote="backend/src/config/schema.sql" },
    @{ Local="src\controllers\blogController.ts"; Remote="backend/src/controllers/blogController.ts" },
    @{ Local="src\controllers\profileController.ts"; Remote="backend/src/controllers/profileController.ts" },
    @{ Local="src\controllers\qaController.ts"; Remote="backend/src/controllers/qaController.ts" },
    @{ Local="src\models\Blog.ts"; Remote="backend/src/models/Blog.ts" },
    @{ Local="src\models\Profile.ts"; Remote="backend/src/models/Profile.ts" },
    @{ Local="src\models\QA.ts"; Remote="backend/src/models/QA.ts" },
    @{ Local="src\routes\blog.ts"; Remote="backend/src/routes/blog.ts" },
    @{ Local="src\routes\profile.ts"; Remote="backend/src/routes/profile.ts" },
    @{ Local="src\routes\qa.ts"; Remote="backend/src/routes/qa.ts" },
    @{ Local="src\types\index.ts"; Remote="backend/src/types/index.ts" },
    @{ Local="src\utils\initDatabase.ts"; Remote="backend/src/utils/initDatabase.ts" }
)

$allFilesExist = $true
foreach ($item in $filesToUpload) {
    $path = Join-Path $backendRoot $item.Local
    if (-not (Test-Path $path)) {
        Write-Host "✗ 未找到: $($item.Local)" -ForegroundColor Red
        $allFilesExist = $false
    } else {
        Write-Host "✓ 找到: $($item.Local)" -ForegroundColor Green
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "错误：缺少必要文件" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "步骤 2/2: 上传文件到服务器..." -ForegroundColor Cyan
Write-Host "请输入服务器密码（您的腾讯云服务器密码）" -ForegroundColor Yellow
Write-Host ""

$scpAvailable = Get-Command scp -ErrorAction SilentlyContinue

if (-not $scpAvailable) {
    Write-Host "✗ 未找到 SCP 命令" -ForegroundColor Red
    Write-Host ""
    Write-Host "请安装 OpenSSH 客户端或使用宝塔面板上传" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "详细指南: C:\Users\28945\Desktop\个人网站重制版\upload-backend-files.md" -ForegroundColor White
    exit 1
}

$uploadSuccess = $true
foreach ($item in $filesToUpload) {
    $localPath = Join-Path $backendRoot $item.Local
    $remotePath = "$serverUser@$serverIP`:/var/www/personal-website/$($item.Remote)"
    
    try {
        scp $localPath $remotePath
        Write-Host "✓ 已上传: $($item.Local)" -ForegroundColor Green
    } catch {
        Write-Host "✗ 上传失败: $($item.Local)" -ForegroundColor Red
        $uploadSuccess = $false
    }
}

if ($uploadSuccess) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "文件上传完成！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "下一步：在宝塔终端执行以下命令" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "```bash" -ForegroundColor White
    Write-Host "cd /var/www/personal-website" -ForegroundColor White
    Write-Host "docker-compose build --no-cache" -ForegroundColor White
    Write-Host "docker-compose up -d" -ForegroundColor White
    Write-Host "```" -ForegroundColor White
    Write-Host ""
    Write-Host "或者运行: C:\Users\28945\Desktop\个人网站重制版\deploy-backend-full.ps1" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "部分文件上传失败，请检查并重试" -ForegroundColor Red
}
