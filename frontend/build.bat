@echo off
echo Building frontend...
cd /d %~dp0
echo Current directory: %CD%
npm run build
