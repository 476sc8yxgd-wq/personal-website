cd "c:\Users\28945\Desktop\个人网站重制版\frontend"
Write-Host "========================================" -ForegroundColor Green
Write-Host "  开始构建前端项目" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "[1/2] 安装依赖..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ 依赖安装失败" -ForegroundColor Red
    exit 1
}

Write-Host "✓ 依赖安装成功" -ForegroundColor Green
Write-Host ""

Write-Host "[2/2] 构建项目..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ 项目构建失败" -ForegroundColor Red
    exit 1
}

Write-Host "✓ 项目构建成功" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  构建完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "构建文件位置: c:\Users\28945\Desktop\个人网站重制版\frontend\dist" -ForegroundColor Cyan
Write-Host ""

Write-Host "下一步：使用宝塔面板上传这些文件" -ForegroundColor Cyan
Write-Host "1. 登录宝塔面板: https://43.138.3.207:20794/8ff1df99" -ForegroundColor White
Write-Host "2. 进入文件管理: /www/wwwroot/personal-website" -ForegroundColor White
Write-Host "3. 上传 dist 目录下的所有文件" -ForegroundColor White
Write-Host ""
Write-Host "按任意键打开构建目录..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
explorer "c:\Users\28945\Desktop\个人网站重制版\frontend\dist"
