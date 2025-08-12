@echo off
echo Configuring Windows Firewall for network access...
echo This requires Administrator privileges.
echo.
pause

:: Check for admin privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with Administrator privileges...
    powershell -ExecutionPolicy Bypass -File "%~dp0configure_firewall.ps1"
) else (
    echo Requesting Administrator privileges...
    powershell -Command "Start-Process PowerShell -ArgumentList '-ExecutionPolicy Bypass -File \"%~dp0configure_firewall.ps1\"' -Verb RunAs"
)

pause
