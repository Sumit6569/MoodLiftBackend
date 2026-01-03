#!/bin/bash
# Deployment script for MoodLift Backend Services
# Builds and runs individual services on EC2

set -e  # Exit on error

SERVICE_NAME=$1
SERVICE_PORT=${2:-3001}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-}
IMAGE_TAG=${IMAGE_TAG:-latest}

if [ -z "$SERVICE_NAME" ]; then
  echo "Usage: ./deploy-service.sh <service-name> [port]"
  echo ""
  echo "Services:"
  echo "  - user-service (default: 3001)"
  echo "  - session-service (3002)"
  echo "  - chat-service (3003)"
  echo "  - payment-service (3004)"
  echo "  - ai-service (3005)"
  echo "  - feedback-service (3006)"
  echo "  - gateway (3000)"
  exit 1
fi

# Validate service exists
if [ ! -d "$SERVICE_NAME" ] && [ ! -f "$SERVICE_NAME/Dockerfile" ]; then
  echo "❌ Error: $SERVICE_NAME not found or no Dockerfile"
  exit 1
fi

# Determine port based on service
case $SERVICE_NAME in
  user-service)
    SERVICE_PORT=3001
    ;;
  session-service)
    SERVICE_PORT=3002
    ;;
  chat-service)
    SERVICE_PORT=3003
    ;;
  payment-service)
    SERVICE_PORT=3004
    ;;
  ai-service)
    SERVICE_PORT=3005
    ;;
  feedback-service)
    SERVICE_PORT=3006
    ;;
  gateway)
    SERVICE_PORT=3000
    ;;
esac

IMAGE_NAME="moodlift-${SERVICE_NAME}:${IMAGE_TAG}"
if [ -n "$DOCKER_REGISTRY" ]; then
  IMAGE_NAME="${DOCKER_REGISTRY}/${IMAGE_NAME}"
fi

echo "📦 Deploying $SERVICE_NAME..."
echo "🏗️  Building Docker image: $IMAGE_NAME"

# Build image
cd "$SERVICE_NAME"
docker build -t "$IMAGE_NAME" .
cd ..

echo "✅ Build complete"
echo ""
echo "🚀 To run this service, execute:"
echo ""
echo "docker run -d \\"
echo "  --name $SERVICE_NAME \\"
echo "  -p ${SERVICE_PORT}:${SERVICE_PORT} \\"
echo "  --env-file .env \\"
echo "  --restart unless-stopped \\"
echo "  $IMAGE_NAME"
echo ""
echo "📝 Make sure .env file exists with required variables"
echo "📖 See .env.production.example for reference"
