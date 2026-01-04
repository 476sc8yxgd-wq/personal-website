# 清除缓存并重启开发服务器
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "清除Vite缓存并重启服务器" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 停止所有Node.js进程
Write-Host "步骤 1/4: 停止Node.js进程..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "  ✓ 已停止 $($nodeProcesses.Count) 个Node.js进程" -ForegroundColor Green
} else {
    Write-Host "  ✓ 没有运行中的Node.js进程" -ForegroundColor Green
}
Write-Host ""

# 进入frontend目录
Write-Host "步骤 2/4: 进入frontend目录..." -ForegroundColor Yellow
Set-Location "c:/Users/28945/Desktop/个人网站重制版/frontend"
Write-Host "  ✓ 当前目录: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# 删除Vite缓存
Write-Host "步骤 3/4: 删除Vite缓存和构建目录..." -ForegroundColor Yellow
$viteCacheDeleted = Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
$distDeleted = Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

if ($viteCacheDeleted -or $distDeleted) {
    Write-Host "  ✓ 已删除缓存目录" -ForegroundColor Green
} else {
    Write-Host "  ✓ 缓存目录不存在或已删除" -ForegroundColor Green
}
Write-Host ""

# 启动开发服务器
Write-Host "步骤 4/4: 启动开发服务器..." -ForegroundColor Yellow
Write-Host "  正在启动 npm run dev..." -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "服务器启动中..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "请在浏览器中访问:" -ForegroundColor White
Write-Host "  http://localhost:3000/about" -ForegroundColor Cyan
Write-Host ""
Write-Host "按 Ctrl+C 可停止服务器" -ForegroundColor Gray
Write-Host ""

npm run dev
