# Deploy All MoodLift Microservices Individually
# Run this script from the MoodLiftBackend directory

Write-Host "🚀 MoodLift Backend - Individual Service Deployment" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Name="User Service"; Path="user-service"; Port=3001},
    @{Name="Session Service"; Path="session-service"; Port=3002},
    @{Name="Chat Service"; Path="chat-service"; Port=3003},
    @{Name="Payment Service"; Path="payment-service"; Port=3004},
    @{Name="AI Service"; Path="ai-service"; Port=3005},
    @{Name="Feedback Service"; Path="feedback-service"; Port=3006},
    @{Name="Gateway"; Path="gateway"; Port=3000}
)

$deployed = 0
$failed = 0

foreach ($service in $services) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "📦 Deploying: $($service.Name) (Port: $($service.Port))" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host ""
    
    $servicePath = Join-Path $PSScriptRoot $service.Path
    
    if (Test-Path $servicePath) {
        Push-Location $servicePath
        
        try {
            # Run the deployment script
            & .\run-docker.ps1
            
            if ($LASTEXITCODE -eq 0) {
                $deployed++
                Write-Host ""
                Write-Host "✅ $($service.Name) deployed successfully!" -ForegroundColor Green
            } else {
                $failed++
                Write-Host ""
                Write-Host "❌ $($service.Name) deployment failed!" -ForegroundColor Red
            }
        } catch {
            $failed++
            Write-Host ""
            Write-Host "❌ Error deploying $($service.Name): $_" -ForegroundColor Red
        }
        
        Pop-Location
    } else {
        $failed++
        Write-Host "❌ Service directory not found: $servicePath" -ForegroundColor Red
    }
    
    Write-Host ""
    Start-Sleep -Seconds 2
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "📊 Deployment Summary" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "✅ Successfully deployed: $deployed services" -ForegroundColor Green
Write-Host "❌ Failed: $failed services" -ForegroundColor Red
Write-Host ""

if ($deployed -eq $services.Count) {
    Write-Host "🎉 All services deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Running Containers:" -ForegroundColor Cyan
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    Write-Host ""
    Write-Host "🌐 Service URLs:" -ForegroundColor Cyan
    Write-Host "  Gateway:          http://localhost:3000"
    Write-Host "  User Service:     http://localhost:3001"
    Write-Host "  Session Service:  http://localhost:3002"
    Write-Host "  Chat Service:     http://localhost:3003"
    Write-Host "  Payment Service:  http://localhost:3004"
    Write-Host "  AI Service:       http://localhost:3005"
    Write-Host "  Feedback Service: http://localhost:3006"
} else {
    Write-Host "⚠️  Some services failed to deploy. Check the output above for details." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Tip: You can deploy services individually:" -ForegroundColor Cyan
    Write-Host "  cd user-service"
    Write-Host "  .\run-docker.ps1"
}

Write-Host ""
Write-Host "📝 Useful Commands:" -ForegroundColor Cyan
Write-Host "  View all containers: docker ps"
Write-Host "  View logs:          docker logs -f <container-name>"
Write-Host "  Stop all:           docker stop \$(docker ps -q)"
Write-Host "  Remove all:         docker rm -f \$(docker ps -aq)"
Write-Host ""
