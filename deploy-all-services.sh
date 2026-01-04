#!/bin/bash
# Deploy All MoodLift Microservices Individually
# Run this script from the MoodLiftBackend directory

set -e

echo "🚀 MoodLift Backend - Individual Service Deployment"
echo "==================================================="
echo ""

declare -a services=(
    "user-service:3001"
    "session-service:3002"
    "chat-service:3003"
    "payment-service:3004"
    "ai-service:3005"
    "feedback-service:3006"
    "gateway:3000"
)

deployed=0
failed=0

for service_info in "${services[@]}"; do
    IFS=':' read -r service port <<< "$service_info"
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 Deploying: $service (Port: $port)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    if [ -d "$service" ]; then
        cd "$service"
        
        if [ -f "run-docker.sh" ]; then
            chmod +x run-docker.sh
            
            if ./run-docker.sh; then
                ((deployed++))
                echo ""
                echo "✅ $service deployed successfully!"
            else
                ((failed++))
                echo ""
                echo "❌ $service deployment failed!"
            fi
        else
            ((failed++))
            echo "❌ run-docker.sh not found in $service"
        fi
        
        cd ..
    else
        ((failed++))
        echo "❌ Service directory not found: $service"
    fi
    
    echo ""
    sleep 2
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Deployment Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Successfully deployed: $deployed services"
echo "❌ Failed: $failed services"
echo ""

if [ $deployed -eq ${#services[@]} ]; then
    echo "🎉 All services deployed successfully!"
    echo ""
    echo "📋 Running Containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "🌐 Service URLs:"
    echo "  Gateway:          http://localhost:3000"
    echo "  User Service:     http://localhost:3001"
    echo "  Session Service:  http://localhost:3002"
    echo "  Chat Service:     http://localhost:3003"
    echo "  Payment Service:  http://localhost:3004"
    echo "  AI Service:       http://localhost:3005"
    echo "  Feedback Service: http://localhost:3006"
else
    echo "⚠️  Some services failed to deploy. Check the output above for details."
    echo ""
    echo "💡 Tip: You can deploy services individually:"
    echo "  cd user-service"
    echo "  ./run-docker.sh"
fi

echo ""
echo "📝 Useful Commands:"
echo "  View all containers: docker ps"
echo "  View logs:          docker logs -f <container-name>"
echo "  Stop all:           docker stop \$(docker ps -q)"
echo "  Remove all:         docker rm -f \$(docker ps -aq)"
echo ""
