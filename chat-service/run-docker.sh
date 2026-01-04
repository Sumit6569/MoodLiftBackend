#!/bin/bash
# Chat Service - Individual Docker Deployment Script

set -e

SERVICE_NAME="chat-service"
IMAGE_NAME="moodlift-chat-service"
CONTAINER_NAME="moodlift-chat-service"
PORT=3003

echo "🚀 Deploying Chat Service"
echo "========================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before running again."
    exit 1
fi

# Build Docker image
echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME .

# Stop and remove existing container if it exists
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "🛑 Stopping existing container..."
    docker stop $CONTAINER_NAME || true
    docker rm $CONTAINER_NAME || true
fi

# Run the container
echo "🐳 Starting container..."
docker run -d \
  --name $CONTAINER_NAME \
  --env-file .env \
  -p $PORT:$PORT \
  --restart unless-stopped \
  $IMAGE_NAME

# Wait for container to be ready
echo "⏳ Waiting for service to be ready..."
sleep 5

# Check container status
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "✅ Chat Service is running!"
    echo "📊 Container Status:"
    docker ps -f name=$CONTAINER_NAME
    echo ""
    echo "🌐 Service URL: http://localhost:$PORT"
    echo "📋 Health Check: http://localhost:$PORT/health"
    echo ""
    echo "📝 Useful Commands:"
    echo "  View logs:    docker logs -f $CONTAINER_NAME"
    echo "  Stop:         docker stop $CONTAINER_NAME"
    echo "  Restart:      docker restart $CONTAINER_NAME"
    echo "  Remove:       docker rm -f $CONTAINER_NAME"
else
    echo "❌ Failed to start Chat Service"
    echo "📋 Checking logs..."
    docker logs $CONTAINER_NAME
    exit 1
fi
