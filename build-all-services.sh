#!/bin/bash
# AWS EC2 deployment script for all MoodLift services
# Builds and launches all services on a single instance or cluster

set -e

PROJECT_ROOT=$(pwd)
IMAGE_TAG=${1:-latest}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-}
LOG_GROUP=${LOG_GROUP:-/moodlift}

echo "🚀 MoodLift Deployment Script"
echo "=============================="
echo "Image Tag: $IMAGE_TAG"
echo "Project: $PROJECT_ROOT"
echo ""

# Function to build and describe deployment
deploy_service() {
  local SERVICE=$1
  local PORT=$2
  
  echo ""
  echo "📦 Building $SERVICE (port $PORT)..."
  
  if [ ! -d "$SERVICE" ] || [ ! -f "$SERVICE/Dockerfile" ]; then
    echo "⚠️  Skipping $SERVICE - directory not found"
    return
  fi
  
  cd "$SERVICE"
  
  # Build image
  IMAGE_NAME="moodlift-${SERVICE}:${IMAGE_TAG}"
  if [ -n "$DOCKER_REGISTRY" ]; then
    IMAGE_NAME="${DOCKER_REGISTRY}/${IMAGE_NAME}"
  fi
  
  echo "  Building: $IMAGE_NAME"
  docker build -t "$IMAGE_NAME" .
  
  echo "  ✅ Built: $IMAGE_NAME"
  
  # Display run command for manual deployment
  cat > "run-${SERVICE}.sh" << EOF
#!/bin/bash
# Run script for $SERVICE
docker run -d \\
  --name $SERVICE \\
  -p ${PORT}:${PORT} \\
  --env-file ../.env \\
  --restart unless-stopped \\
  --log-opt max-size=10m \\
  --log-opt max-file=3 \\
  $IMAGE_NAME
EOF
  
  chmod +x "run-${SERVICE}.sh"
  
  echo "  💾 Created: $SERVICE/run-${SERVICE}.sh"
  
  cd ..
}

# Build all services
echo "🏗️  Building all services..."
echo ""

deploy_service "user-service" 3001
deploy_service "session-service" 3002
deploy_service "chat-service" 3003
deploy_service "payment-service" 3004
deploy_service "ai-service" 3005
deploy_service "feedback-service" 3006
deploy_service "gateway" 3000

echo ""
echo "=============================="
echo "✅ All services built successfully!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Prepare environment:"
echo "   cp .env.production.example .env"
echo "   # Edit .env with your production values"
echo ""
echo "2. Run services individually:"
echo "   ./user-service/run-user-service.sh"
echo "   ./session-service/run-session-service.sh"
echo "   # ... etc for each service"
echo ""
echo "3. Or run all at once:"
echo "   for svc in user-service session-service chat-service payment-service ai-service feedback-service gateway; do"
echo "     ./${svc}/run-${svc}.sh"
echo "   done"
echo ""
echo "4. Verify services are running:"
echo "   docker ps"
echo ""
echo "5. Check logs:"
echo "   docker logs -f user-service"
echo ""
echo "📖 See DOCKER_DEPLOYMENT_GUIDE.md for detailed instructions"
