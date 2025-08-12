# PowerShell script to configure Windows Firewall for the Swimlane Tracker
# Run this as Administrator

Write-Host "🔥 Configuring Windows Firewall for Swimlane Project Tracker..." -ForegroundColor Yellow
Write-Host ""

try {
    # Remove any existing rule with the same name
    Write-Host "Removing any existing firewall rules..." -ForegroundColor Gray
    Remove-NetFirewallRule -DisplayName "Swimlane Project Tracker" -ErrorAction SilentlyContinue
    
    # Add new inbound rule for port 8000
    Write-Host "Adding firewall rule for port 8000..." -ForegroundColor Gray
    New-NetFirewallRule -DisplayName "Swimlane Project Tracker" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow -Profile Any
    
    Write-Host "✅ Firewall configured successfully!" -ForegroundColor Green
    Write-Host "✅ Port 8000 is now open for incoming connections" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run 'python chart.py' and others on your network should be able to access it." -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error configuring firewall: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual steps:" -ForegroundColor Yellow
    Write-Host "1. Open Windows Defender Firewall with Advanced Security" -ForegroundColor White
    Write-Host "2. Click 'Inbound Rules' > 'New Rule'" -ForegroundColor White
    Write-Host "3. Select 'Port' > Next" -ForegroundColor White
    Write-Host "4. Select 'TCP' and enter '8000' > Next" -ForegroundColor White
    Write-Host "5. Select 'Allow the connection' > Next" -ForegroundColor White
    Write-Host "6. Check all profiles > Next" -ForegroundColor White
    Write-Host "7. Name it 'Swimlane Project Tracker' > Finish" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
