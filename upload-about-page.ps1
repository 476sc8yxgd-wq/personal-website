# PowerShell script to upload About.tsx to server
$serverIP = "43.138.3.207"
$username = "root"
$password = "Tencent@12345"
$localFile = "c:\Users\28945\Desktop\个人网站重制版\frontend\src\pages\About.tsx"
$remotePath = "/root/个人网站重制版_20251226022228/frontend/src/pages/About.tsx"

# 使用SCP上传文件
$scpCommand = "scp -o StrictHostKeyChecking=no $localFile ${username}@${serverIP}:${remotePath}"

Write-Host "Uploading About.tsx to server..."
Write-Host "Command: $scpCommand"

# 执行SCP命令（需要安装OpenSSH客户端）
try {
    Invoke-Expression $scpCommand
    Write-Host "File uploaded successfully!"
} catch {
    Write-Host "Error: $_"
    Write-Host "Please ensure OpenSSH client is installed"
}
