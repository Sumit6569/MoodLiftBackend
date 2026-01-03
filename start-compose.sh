#!/bin/bash
# Docker Compose quick start for local integration testing
# Run this from the project root

set -e

echo "🚀 MoodLift Docker Compose Quick Start"
echo "======================================"
echo ""

if ! command -v docker &> /dev/null; then
  echo "❌ Docker is not installed. Please install Docker first."
  exit 1
fi

if ! command -v docker-compose &> /dev/null; then
  echo "❌ Docker Compose is not installed. Please install Docker Compose first."
  exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
  echo "📝 Creating .env from template..."
  cp .env.local.example .env
  echo "✅ Created .env (you can customize it if needed)"
  echo ""
fi

echo "📋 Environment Configuration:"
echo "  Mode: Integration (Local Docker Compose)"
echo "  MongoDB: Container-based"
echo "  Services: All via Docker"
echo ""

# Check Docker daemon
echo "🔍 Checking Docker daemon..."
if ! docker ps &>/dev/null; then
  echo "❌ Docker daemon is not running"
  echo "   Start Docker and try again"
  exit 1
fi

echo "✅ Docker is running"
echo ""

echo "🏗️  Building Docker images (this may take a few minutes)..."
echo ""

docker compose build --no-cache

echo ""
echo "✅ Build complete!"
echo ""

echo "🚀 Starting services..."
echo ""

docker compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "======================================"
echo "✅ All services are running!"
echo ""
echo "📍 Service URLs:"
echo "  Gateway:           http://localhost:3000"
echo "  User Service:      http://localhost:3001"
echo "  Session Service:   http://localhost:3002"
echo "  Chat Service:      http://localhost:3003"
echo "  Payment Service:   http://localhost:3004"
echo "  AI Service:        http://localhost:3005"
echo "  Feedback Service:  http://localhost:3006"
echo ""
echo "🧪 Quick test:"
echo "  curl http://localhost:3000/health"
echo ""
echo "📊 View logs:"
echo "  docker compose logs -f [service-name]"
echo ""
echo "⛔ Stop services:"
echo "  docker compose down"
echo ""
echo "📖 See DOCKER_DEPLOYMENT_GUIDE.md for detailed instructions"
