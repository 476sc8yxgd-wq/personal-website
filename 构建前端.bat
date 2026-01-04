@echo off
chcp 65001 >nul
cls
echo ========================================
echo   构建前端项目
echo ========================================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0构建前端.ps1"

pause
