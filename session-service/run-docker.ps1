# Session Service - Individual Docker Deployment Script (PowerShell)

$SERVICE_NAME = "session-service"
$IMAGE_NAME = "moodlift-session-service"
$CONTAINER_NAME = "moodlift-session-service"
$PORT = 3002

Write-Host "🚀 Deploying Session Service" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# Check if Docker is running
Write-Host "🔍 Checking Docker status..." -ForegroundColor Yellow
try {
    $null = docker ps 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker is not running"
    }
} catch {
    Write-Host ""
    Write-Host "❌ Docker Desktop is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 Please start Docker Desktop:" -ForegroundColor Yellow
    Write-Host "   1. Open Docker Desktop application" -ForegroundColor White
    Write-Host "   2. Wait for it to start (icon will be green)" -ForegroundColor White
    Write-Host "   3. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Tip: Search for 'Docker Desktop' in Windows Start menu" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}
Write-Host "✅ Docker is running" -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Please edit .env file with your configuration before running again." -ForegroundColor Yellow
    exit 1
}

# Build Docker image
Write-Host "📦 Building Docker image..." -ForegroundColor Green
docker build -t $IMAGE_NAME .

# Stop and remove existing container if it exists
$existingContainer = docker ps -aq -f name=$CONTAINER_NAME
if ($existingContainer) {
    Write-Host "🛑 Stopping existing container..." -ForegroundColor Yellow
    docker stop $CONTAINER_NAME 2>$null
    docker rm $CONTAINER_NAME 2>$null
}

# Run the container
Write-Host "🐳 Starting container..." -ForegroundColor Green
docker run -d `
  --name $CONTAINER_NAME `
  --env-file .env `
  -p ${PORT}:${PORT} `
  --restart unless-stopped `
  $IMAGE_NAME

# Wait for container to be ready
Write-Host "⏳ Waiting for service to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check container status
$runningContainer = docker ps -q -f name=$CONTAINER_NAME
if ($runningContainer) {
    Write-Host "✅ Session Service is running!" -ForegroundColor Green
    Write-Host "📊 Container Status:" -ForegroundColor Cyan
    docker ps -f name=$CONTAINER_NAME
    Write-Host ""
    Write-Host "🌐 Service URL: http://localhost:$PORT" -ForegroundColor Cyan
    Write-Host "📋 Health Check: http://localhost:${PORT}/health" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 Useful Commands:" -ForegroundColor Cyan
    Write-Host "  View logs:    docker logs -f $CONTAINER_NAME"
    Write-Host "  Stop:         docker stop $CONTAINER_NAME"
    Write-Host "  Restart:      docker restart $CONTAINER_NAME"
    Write-Host "  Remove:       docker rm -f $CONTAINER_NAME"
} else {
    Write-Host "❌ Failed to start Session Service" -ForegroundColor Red
    Write-Host "📋 Checking logs..." -ForegroundColor Yellow
    docker logs $CONTAINER_NAME
    exit 1
}
