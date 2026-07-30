@echo off
setlocal

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy-local.ps1" %*
set "EXIT_CODE=%ERRORLEVEL%"
echo.
echo Deploy script finished. Press any key to close this window.
pause >nul
exit /b %EXIT_CODE%
