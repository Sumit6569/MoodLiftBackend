#!/bin/bash
# Validation script to verify all services can run independently

echo "🧪 MoodLift Service Independence Validation"
echo "==========================================="
echo ""

SERVICES=(
  "ai-service:3005"
  "chat-service:3003"
  "feedback-service:3006"
  "payment-service:3004"
  "session-service:3002"
  "user-service:3001"
  "gateway:3000"
)

ERRORS=0
WARNINGS=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_dockerfile() {
  local service=$1
  
  if [ ! -f "$service/Dockerfile" ]; then
    echo -e "${RED}❌${NC} Missing: $service/Dockerfile"
    ((ERRORS++))
    return 1
  else
    echo -e "${GREEN}✅${NC} Found: $service/Dockerfile"
    return 0
  fi
}

check_dockerignore() {
  local service=$1
  
  if [ ! -f "$service/.dockerignore" ]; then
    echo -e "${YELLOW}⚠️${NC} Missing: $service/.dockerignore"
    ((WARNINGS++))
    return 1
  else
    echo -e "${GREEN}✅${NC} Found: $service/.dockerignore"
    return 0
  fi
}

check_no_localhost() {
  local service=$1
  
  if grep -r "localhost" "$service/src" "$service/index.js" 2>/dev/null | grep -v "localhost:8080" | grep -v "localhost:3000" | grep -q "localhost"; then
    echo -e "${RED}❌${NC} $service has hardcoded localhost references"
    grep -r "localhost" "$service/src" "$service/index.js" 2>/dev/null | grep -v "localhost:8080" | grep -v "localhost:3000" | sed 's/^/    /'
    ((ERRORS++))
    return 1
  else
    echo -e "${GREEN}✅${NC} No hardcoded localhost in $service"
    return 0
  fi
}

check_package_json() {
  local service=$1
  
  if [ ! -f "$service/package.json" ]; then
    echo -e "${RED}❌${NC} Missing: $service/package.json"
    ((ERRORS++))
    return 1
  else
    echo -e "${GREEN}✅${NC} Found: $service/package.json"
    return 0
  fi
}

check_env_vars() {
  local service=$1
  
  if grep -r "process.env" "$service/src" "$service/index.js" 2>/dev/null | grep -q "process.env"; then
    echo -e "${GREEN}✅${NC} $service uses environment variables"
    return 0
  else
    echo -e "${YELLOW}⚠️${NC} $service may not use environment variables"
    ((WARNINGS++))
    return 1
  fi
}

echo "📋 Checking root files..."
echo ""

if [ -f "docker-compose.yml" ]; then
  echo -e "${GREEN}✅${NC} Found: docker-compose.yml"
else
  echo -e "${RED}❌${NC} Missing: docker-compose.yml"
  ((ERRORS++))
fi

if [ -f ".env.local.example" ]; then
  echo -e "${GREEN}✅${NC} Found: .env.local.example"
else
  echo -e "${RED}❌${NC} Missing: .env.local.example"
  ((ERRORS++))
fi

if [ -f ".env.production.example" ]; then
  echo -e "${GREEN}✅${NC} Found: .env.production.example"
else
  echo -e "${RED}❌${NC} Missing: .env.production.example"
  ((ERRORS++))
fi

if [ -f ".dockerignore" ]; then
  echo -e "${GREEN}✅${NC} Found: .dockerignore (root)"
else
  echo -e "${YELLOW}⚠️${NC} Missing: .dockerignore (root)"
  ((WARNINGS++))
fi

echo ""
echo "🔍 Checking individual services..."
echo ""

for SERVICE_INFO in "${SERVICES[@]}"; do
  SERVICE="${SERVICE_INFO%:*}"
  echo "📦 $SERVICE"
  
  check_package_json "$SERVICE"
  check_dockerfile "$SERVICE"
  check_dockerignore "$SERVICE"
  check_no_localhost "$SERVICE"
  check_env_vars "$SERVICE"
  
  echo ""
done

echo ""
echo "======================================"
echo "📊 Validation Summary"
echo "======================================"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed!${NC}"
  echo ""
  echo "Your MoodLift backend is ready for:"
  echo "  • Local Docker Compose testing"
  echo "  • Production EC2 deployment"
  echo "  • True microservice independence"
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠️ $WARNINGS warnings (non-blocking)${NC}"
  echo ""
  echo "Your MoodLift backend is ready, but consider:"
  echo "  • Adding missing .dockerignore files"
  echo "  • Reviewing environment variable setup"
else
  echo -e "${RED}❌ $ERRORS errors found${NC}"
  echo ""
  echo "Please fix the above issues before deploying."
fi

echo ""
echo "======================================"
echo ""
echo "📖 Next Steps:"
echo ""
echo "For local testing:"
echo "  ./start-compose.sh"
echo ""
echo "For production deployment:"
echo "  ./build-all-services.sh"
echo ""
echo "See DOCKER_DEPLOYMENT_GUIDE.md for details"
