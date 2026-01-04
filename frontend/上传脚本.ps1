# 上传前端文件到服务器
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "上传前端文件到服务器" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$localPath = "c:\Users\28945\Desktop\个人网站重制版\frontend\dist"
$remotePath = "root@43.138.3.207:/tmp/frontend-update/"

Write-Host "本地路径: $localPath" -ForegroundColor Yellow
Write-Host "目标路径: $remotePath" -ForegroundColor Yellow
Write-Host ""

if (!(Test-Path $localPath)) {
    Write-Host "错误：未找到 dist 目录" -ForegroundColor Red
    exit 1
}

Write-Host "开始上传..." -ForegroundColor Green
scp -o StrictHostKeyChecking=no -r $localPath $remotePath

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "上传成功！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "请复制以下消息回复 AI：" -ForegroundColor Yellow
    Write-Host "文件已上传" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "上传失败！请检查网络和密码" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
}

Write-Host "按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
