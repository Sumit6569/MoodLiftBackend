#!/usr/bin/env pwsh

# MoodLift Backend - API Route Testing Script
Write-Host "🧪 MoodLift API Route Tester" -ForegroundColor Green

$baseUrl = "http://localhost:3001"  # Direct to user service for now

Write-Host "`n1️⃣ Testing Health Check..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET
    Write-Host "✅ Health Check: $($health.status)" -ForegroundColor Green
    Write-Host "   Service: $($health.service)" -ForegroundColor White
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2️⃣ Testing User Registration..." -ForegroundColor Cyan
$registerData = @{
    fullName = "Test User"
    email = "test@example.com"
    password = "password123"
    role = "user"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "✅ Registration successful for: $($registerResponse.user.name)" -ForegroundColor Green
    $token = $registerResponse.token
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor White
} catch {
    Write-Host "❌ Registration Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3️⃣ Testing User Login..." -ForegroundColor Cyan
$loginData = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login successful for: $($loginResponse.user.name)" -ForegroundColor Green
    $token = $loginResponse.token
} catch {
    Write-Host "❌ Login Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4️⃣ Testing Token Verification..." -ForegroundColor Cyan
if ($token) {
    try {
        $headers = @{ Authorization = "Bearer $token" }
        $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/verify-token" -Method GET -Headers $headers
        Write-Host "✅ Token verified for: $($verifyResponse.user.name)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Token Verification Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ No token available for verification" -ForegroundColor Yellow
}

Write-Host "`n5️⃣ Testing Approved Listeners..." -ForegroundColor Cyan
try {
    $listenersResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/listeners/approved" -Method GET
    Write-Host "✅ Found $($listenersResponse.listeners.Count) approved listeners" -ForegroundColor Green
    foreach ($listener in $listenersResponse.listeners) {
        Write-Host "   - $($listener.name) ($($listener.expertise -join ', '))" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Get Listeners Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n6️⃣ Testing Listener Registration..." -ForegroundColor Cyan
$listenerData = @{
    fullName = "Dr. Test Listener"
    email = "listener@example.com"
    password = "password123"
    role = "listener"
    bio = "Licensed therapist specializing in anxiety and depression"
    expertise = @("Anxiety", "Depression", "Stress Management")
    hourlyRate = 75
} | ConvertTo-Json

try {
    $listenerResponse = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/register" -Method POST -Body $listenerData -ContentType "application/json"
    Write-Host "✅ Listener registration successful: $($listenerResponse.user.name)" -ForegroundColor Green
    Write-Host "   Approval status: $($listenerResponse.user.isApproved)" -ForegroundColor White
} catch {
    Write-Host "❌ Listener Registration Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📊 Test Summary:" -ForegroundColor Yellow
Write-Host "   ✅ Tests completed" -ForegroundColor Green
Write-Host "   📖 Check API_ROUTES.md for complete documentation" -ForegroundColor White
Write-Host "   🌐 User Service running on: $baseUrl" -ForegroundColor White

Write-Host "`n🔧 Next Steps:" -ForegroundColor Magenta
Write-Host "   1. Start other services (session, chat, payment, ai, feedback)" -ForegroundColor White
Write-Host "   2. Start gateway on port 3000" -ForegroundColor White
Write-Host "   3. Test through gateway: http://localhost:3000/auth/register" -ForegroundColor White