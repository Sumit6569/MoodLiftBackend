#!/usr/bin/env pwsh

# MoodLift Backend - Local Development Startup Script
Write-Host "🚀 Starting MoodLift Backend Services..." -ForegroundColor Green

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js version: $(node --version)" -ForegroundColor Green

# Base path
$basePath = "c:\Users\infos\Desktop\MoodLift\MoodLiftBackend"

# Service configurations
$services = @(
    @{ Name = "User Service"; Path = "$basePath\user-service"; Port = 3001; Script = "simple" },
    @{ Name = "Session Service"; Path = "$basePath\session-service"; Port = 3002; Script = "dev" },
    @{ Name = "Chat Service"; Path = "$basePath\chat-service"; Port = 3003; Script = "dev" },
    @{ Name = "Payment Service"; Path = "$basePath\payment-service"; Port = 3004; Script = "dev" },
    @{ Name = "AI Service"; Path = "$basePath\ai-service"; Port = 3005; Script = "dev" },
    @{ Name = "Feedback Service"; Path = "$basePath\feedback-service"; Port = 3006; Script = "dev" },
    @{ Name = "Gateway"; Path = "$basePath\gateway"; Port = 3000; Script = "dev" }
)

Write-Host "📋 Available Services:" -ForegroundColor Cyan
foreach ($service in $services) {
    Write-Host "  - $($service.Name): http://localhost:$($service.Port)" -ForegroundColor White
}

Write-Host "`n🔧 Instructions:" -ForegroundColor Yellow
Write-Host "1. Open separate terminal windows for each service" -ForegroundColor White
Write-Host "2. Run the following commands in each terminal:" -ForegroundColor White

foreach ($service in $services) {
    Write-Host "`n📁 $($service.Name):" -ForegroundColor Cyan
    Write-Host "   cd `"$($service.Path)`"" -ForegroundColor Gray
    Write-Host "   npm install" -ForegroundColor Gray
    Write-Host "   npm run $($service.Script)" -ForegroundColor Gray
}

Write-Host "`n🌐 API Documentation:" -ForegroundColor Green
Write-Host "   See API_ROUTES.md for complete route documentation" -ForegroundColor White

Write-Host "`n🔍 Quick Health Checks:" -ForegroundColor Yellow
foreach ($service in $services) {
    $healthUrl = "http://localhost:$($service.Port)/api/health"
    if ($service.Name -eq "Gateway") {
        $healthUrl = "http://localhost:$($service.Port)/health"
    }
    Write-Host "   curl $healthUrl" -ForegroundColor Gray
}

Write-Host "`n💡 Pro Tips:" -ForegroundColor Magenta
Write-Host "   - Start User Service first (other services may depend on it)" -ForegroundColor White
Write-Host "   - Gateway should be started last" -ForegroundColor White
Write-Host "   - Use 'rs' in nodemon terminals to restart services" -ForegroundColor White
Write-Host "   - Check API_ROUTES.md for endpoint documentation" -ForegroundColor White

Write-Host "`n✨ Example API Calls:" -ForegroundColor Green
Write-Host "   # Register user:" -ForegroundColor Gray
Write-Host "   curl -X POST http://localhost:3001/api/v1/auth/register -H `"Content-Type: application/json`" -d `"{`\`"fullName`\`":`\`"John Doe`\`",`\`"email`\`":`\`"john@example.com`\`",`\`"password`\`":`\`"password123`\`",`\`"role`\`":`\`"user`\`"}`"" -ForegroundColor Gray
Write-Host "`n   # Get approved listeners:" -ForegroundColor Gray  
Write-Host "   curl http://localhost:3001/api/v1/listeners/approved" -ForegroundColor Gray