# 个人网站前端部署修复脚本
# 用于将本地更新的About.tsx上传到服务器并重新构建前端

$ErrorActionPreference = "Stop"

# 配置信息
$serverIP = "43.138.3.207"
$username = "root"
$password = "Tencent@12345"
$projectPath = "/root/个人网站重制版_20251226022228/frontend"
$localProjectPath = "c:\Users\28945\Desktop\个人网站重制版\frontend"
$aboutPageLocal = Join-Path $localProjectPath "src\pages\About.tsx"
$aboutPageRemote = "$projectPath/src/pages/About.tsx"

Write-Host "========================================"  -ForegroundColor Green
Write-Host "  个人网站前端部署修复脚本"  -ForegroundColor Green
Write-Host "========================================"  -ForegroundColor Green
Write-Host ""

# 检查本地文件是否存在
if (!(Test-Path $aboutPageLocal)) {
    Write-Host "错误: 找不到本地文件 $aboutPageLocal" -ForegroundColor Red
    exit 1
}

Write-Host "步骤 1: 上传About.tsx到服务器..." -ForegroundColor Yellow

# 方法1: 尝试使用scp（如果安装了OpenSSH客户端）
try {
    $scpPath = Get-Command scp -ErrorAction SilentlyContinue
    if ($scpPath) {
        Write-Host "使用SCP上传文件..." -ForegroundColor Cyan
        $scpCommand = "`"$aboutPageLocal`" ${username}@${serverIP}:$aboutPageRemote"
        $plinkPath = "C:\Program Files\PuTTY\plink.exe"
        $pscpPath = "C:\Program Files\PuTTY\pscp.exe"

        if (Test-Path $pscpPath) {
            # 使用PuTTY的pscp
            $uploadCmd = "`"$pscpPath`" -pw `"$password`" `"$aboutPageLocal`" ${username}@${serverIP}:$aboutPageRemote"
            Invoke-Expression $uploadCmd
        } else {
            Write-Host "请先安装OpenSSH客户端或PuTTY" -ForegroundColor Yellow
            Write-Host "或者手动上传文件后继续执行后续步骤" -ForegroundColor Yellow
            Read-Host "按Enter继续..."
        }
    } else {
        Write-Host "未找到SCP工具，请手动上传文件" -ForegroundColor Yellow
        Write-Host "需要上传的文件: $aboutPageLocal" -ForegroundColor Cyan
        Write-Host "目标路径: ${username}@${serverIP}:$aboutPageRemote" -ForegroundColor Cyan
        Read-Host "上传完成后按Enter继续..."
    }
} catch {
    Write-Host "上传过程中出现错误: $_" -ForegroundColor Red
    Write-Host "请手动上传文件后继续" -ForegroundColor Yellow
    Read-Host "按Enter继续..."
}

Write-Host ""
Write-Host "步骤 2: 在服务器上重新构建前端..." -ForegroundColor Yellow

# 创建远程执行脚本
$remoteScript = @'
cd /root/个人网站重制版_20251226022228/frontend

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install
fi

# 构建前端
echo "开始构建前端..."
npm run build

# 检查构建结果
if [ -d "dist" ]; then
    echo "构建成功！"
else
    echo "构建失败！"
    exit 1
fi

# 复制到后端容器的public目录
echo "复制构建文件到后端容器..."
docker cp dist/. personal_website_backend:/app/public/

# 重启后端容器
echo "重启后端容器..."
docker restart personal_website_backend

echo "部署完成！"
'@

# 保存脚本到临时文件
$tempScript = "$env:TEMP\deploy-frontend-remote.sh"
$remoteScript | Out-File -FilePath $tempScript -Encoding UTF8

Write-Host ""
Write-Host "步骤 3: 执行远程构建脚本..." -ForegroundColor Yellow

try {
    # 尝试使用plink执行远程命令
    $plinkPath = "C:\Program Files\PuTTY\plink.exe"
    if (Test-Path $plinkPath) {
        Write-Host "使用PuTTY执行远程命令..." -ForegroundColor Cyan
        $remoteCommand = Get-Content $tempScript -Raw
        $plinkCmd = "`"$plinkPath`" -pw `"$password`" ${username}@${serverIP} `"$remoteCommand`""
        Invoke-Expression $plinkCmd
    } else {
        Write-Host "未找到PuTTY，请手动SSH到服务器执行以下命令:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host $remoteScript -ForegroundColor Cyan
        Write-Host ""
        Read-Host "按Enter继续..."
    }
} catch {
    Write-Host "远程执行过程中出现错误: $_" -ForegroundColor Red
    Write-Host "请手动SSH到服务器执行以下命令:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host $remoteScript -ForegroundColor Cyan
    Write-Host ""
}

# 清理临时文件
if (Test-Path $tempScript) {
    Remove-Item $tempScript
}

Write-Host ""
Write-Host "========================================"  -ForegroundColor Green
Write-Host "  部署脚本执行完成！"  -ForegroundColor Green
Write-Host "========================================"  -ForegroundColor Green
Write-Host ""
Write-Host "请访问 http://$serverIP 查看更新后的网站" -ForegroundColor Cyan
Write-Host "如果仍然看到旧页面，请清除浏览器缓存后重试" -ForegroundColor Yellow
Write-Host ""
