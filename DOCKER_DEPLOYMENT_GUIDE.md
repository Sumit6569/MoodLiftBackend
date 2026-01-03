# MoodLift Backend - Deployment Guide

## System Architecture

MoodLift is a **polyglot microservices architecture** designed to run in two distinct modes:

1. **Integration Mode** - Local Docker Compose for CI/CD and development
2. **Production Mode** - Independent services on AWS EC2 with no Docker Compose dependency

---

## 🏗️ Architecture Overview

### Services

| Service | Port | Purpose | DB |
|---------|------|---------|-----|
| **Gateway** | 3000 | API routing & auth | N/A |
| **User Service** | 3001 | Auth, users, listeners | MongoDB |
| **Session Service** | 3002 | Therapy sessions & ratings | MongoDB |
| **Chat Service** | 3003 | Real-time messaging | MongoDB |
| **Payment Service** | 3004 | PayPal integration | MongoDB |
| **AI Service** | 3005 | Gemini AI interactions | MongoDB |
| **Feedback Service** | 3006 | User feedback collection | MongoDB |

### Data Layer

- **Development/Integration**: MongoDB container in Docker Compose
- **Production**: MongoDB Atlas (cloud-hosted)

---

## 🚀 Mode 1: Integration Mode (Local / CI-CD)

### Prerequisites
- Docker & Docker Compose installed
- 4GB+ available memory

### Setup

```bash
# Clone repo
git clone <repo-url>
cd MoodLiftBackend

# Copy local environment template
cp .env.local.example .env

# Optional: Customize .env for your setup
# nano .env

# Build and start all services
docker compose up --build
```

### What Happens

- **MongoDB container** starts with persistent volume
- **All 7 services** build and start in dependency order
- **Gateway** available at `http://localhost:3000`
- **Services** communicate via Docker container names:
  - `http://user-service:3001`
  - `http://session-service:3002`
  - etc.

### Stop Services

```bash
docker compose down
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f user-service
```

### Environment Variables (Integration Mode)

```env
MONGODB_URI=mongodb://mongo:27017/moodlift
MONGODB_DB=moodlift

# Services use container names for communication
USER_SERVICE_URL=http://user-service:3001
SESSION_SERVICE_URL=http://session-service:3002
CHAT_SERVICE_URL=http://chat-service:3003
PAYMENT_SERVICE_URL=http://payment-service:3004
AI_SERVICE_URL=http://ai-service:3005
FEEDBACK_SERVICE_URL=http://feedback-service:3006
```

---

## 🔒 Mode 2: Production Mode (AWS EC2)

### Architecture

Each service runs **independently** on its own EC2 instance (or grouped on shared instances).
No Docker Compose. No inter-container networking. Pure HTTP over VPC.

```
┌─────────────────────────────────────────────────────┐
│          AWS VPC (Private Network)                  │
│  ┌────────────────────────────────────────────────┐ │
│  │                                                │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │ │
│  │  │ User Svc │  │ Session  │  │   Chat   │    │ │
│  │  │ i-xxxxx1 │  │ i-xxxxx2 │  │ i-xxxxx3 │    │ │
│  │  └──────────┘  └──────────┘  └──────────┘    │ │
│  │                                                │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │ │
│  │  │ Payment  │  │    AI    │  │ Feedback │    │ │
│  │  │ i-xxxxx4 │  │ i-xxxxx5 │  │ i-xxxxx6 │    │ │
│  │  └──────────┘  └──────────┘  └──────────┘    │ │
│  │                                                │ │
│  │  ┌────────────────────────────────────────┐   │ │
│  │  │        Gateway (ALB Public)            │   │ │
│  │  │        i-xxxxx7 / Port 3000            │   │ │
│  │  └────────────────────────────────────────┘   │ │
│  │                                                │ │
│  └────────────────────────────────────────────────┘ │
│                                                     │
│  MongoDB Atlas (Multi-region, outside VPC)        │
└─────────────────────────────────────────────────────┘
```

### Deployment Steps

#### 1. Prepare AMI

Launch an EC2 instance (Ubuntu 22.04 LTS) and install Docker:

```bash
#!/bin/bash
sudo apt-get update
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user
```

Create an AMI from this instance for reuse.

#### 2. Deploy Each Service

For **each service**, repeat on its EC2 instance:

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@<instance-private-ip>

# Clone repo (or use deployment artifact)
git clone <repo-url>
cd MoodLiftBackend

# Copy production environment
cp .env.production.example .env

# Edit .env with your actual values
# - MONGODB_URI: MongoDB Atlas connection string
# - SERVICE_URLs: Private IPs of other services in VPC
nano .env

# Build the service's Docker image
cd user-service
docker build -t moodlift-user-service:latest .

# Run the container with proper env
docker run -d \
  --name user-service \
  -p 3001:3001 \
  --env-file ../.env \
  --log-driver awslogs \
  --log-opt awslogs-group=/ecs/user-service \
  --log-opt awslogs-region=us-east-1 \
  --log-opt awslogs-stream-prefix=ecs \
  moodlift-user-service:latest
```

#### 3. Deploy Gateway (Public Facing)

```bash
# On gateway instance
cd gateway
docker build -t moodlift-gateway:latest .

docker run -d \
  --name gateway \
  -p 3000:3000 \
  --env-file ../.env \
  --log-driver awslogs \
  --log-opt awslogs-group=/ecs/gateway \
  --log-opt awslogs-region=us-east-1 \
  moodlift-gateway:latest
```

#### 4. Configure Networking

**Security Group Inbound Rules:**
- Gateway instance: Allow port 3000 from 0.0.0.0/0 (Internet)
- Service instances: Allow ports 3001-3006 from VPC CIDR only (10.0.0.0/8)

**VPC Security Groups:**
```
Gateway SG:
  - Inbound: 3000 from 0.0.0.0/0
  - Outbound: All traffic

Service SG:
  - Inbound: Port 3001-3006 from VPC CIDR (10.0.0.0/8)
  - Outbound: All traffic
```

#### 5. Configure Application Load Balancer

**Create ALB with:**
- Target group pointing to gateway instance on port 3000
- Health check: `/health`
- Health check interval: 30 seconds
- Healthy threshold: 2
- Unhealthy threshold: 3

**Example:**
```
ALB Public IP: 54.x.x.x
Route53 CNAME: api.yourdomain.com -> ALB DNS
```

#### 6. Environment Variables (Production)

**Each service reads from `.env` file:**

```env
# .env (copied to each EC2 instance)
MONGODB_URI=mongodb+srv://user:pass@cluster0.mongodb.net/moodlift
MONGODB_DB=moodlift
NODE_ENV=production

# Private IPs of service instances (within VPC)
USER_SERVICE_URL=http://10.0.1.10:3001
SESSION_SERVICE_URL=http://10.0.1.20:3002
CHAT_SERVICE_URL=http://10.0.1.30:3003
PAYMENT_SERVICE_URL=http://10.0.1.40:3004
AI_SERVICE_URL=http://10.0.1.50:3005
FEEDBACK_SERVICE_URL=http://10.0.1.60:3006

# Public-facing URLs
FRONTEND_URL=https://app.yourdomain.com
ALLOWED_ORIGINS=https://app.yourdomain.com

# Secrets (use AWS Secrets Manager in production)
JWT_SECRET=<32+ char random string>
PAYPAL_CLIENT_ID=<from PayPal>
PAYPAL_CLIENT_SECRET=<from PayPal>
```

---

## 📝 Environment Variables Reference

### Integration Mode (.env)
```bash
MONGODB_URI=mongodb://mongo:27017/moodlift
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

### Production Mode (.env)
```bash
MONGODB_URI=mongodb+srv://...mongodb.net/moodlift
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
# All SERVICE_URLs use private IPs, not localhost
USER_SERVICE_URL=http://10.0.1.10:3001
```

---

## 🔄 Inter-Service Communication

### Integration Mode (Docker Compose)
```javascript
// Services can reach each other via container names
const response = await fetch('http://user-service:3001/api/v1/users/123');
```

### Production Mode (AWS EC2)
```javascript
// Services use private IPs from environment
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://10.0.1.10:3001';
const response = await fetch(`${userServiceUrl}/api/v1/users/123`);
```

**Gateway always reads service URLs from environment:**

```javascript
// gateway/index.js
const serviceHosts = {
  user: process.env.USER_SERVICE_URL || "http://user-service:3001",
  session: process.env.SESSION_SERVICE_URL || "http://session-service:3002",
  // ...
};
```

---

## 🧪 Testing

### Integration Mode
```bash
# Test gateway
curl http://localhost:3000/health

# Test specific service
curl http://localhost:3000/auth/register
```

### Production Mode
```bash
# SSH to service instance
ssh -i key.pem ec2-user@<instance-ip>

# Check service is running
docker ps

# View logs
docker logs -f user-service

# Test service directly
curl http://10.0.1.10:3001/health

# Test via gateway
curl https://api.yourdomain.com/health
```

---

## 🛠️ Troubleshooting

### Integration Mode

**Services won't start:**
```bash
# Check Docker is running
docker --version

# Check disk space
docker system df

# Clean up
docker compose down
docker system prune -a
```

**MongoDB connection error:**
```bash
# Verify mongo container
docker compose logs mongo

# Restart mongo
docker compose restart mongo
```

### Production Mode

**Service can't reach MongoDB:**
- Verify MONGODB_URI is correct
- Check MongoDB Atlas IP whitelist includes EC2 instance public IP
- Test connection: `nc -zv cluster.mongodb.net 27017`

**Services can't reach each other:**
- Verify private IPs in .env match actual instance private IPs
- Check security group allows port 3001-3006 from VPC CIDR
- Test connectivity: `nc -zv 10.0.1.10 3001`

**Gateway can't reach services:**
- Gateway SG must allow outbound to service ports
- Check SERVICE_URLs environment variables
- Verify services are running: `docker ps`

---

## 📦 Deployment Automation (Optional)

### Using AWS CodeDeploy

**appspec.yml** (per service):
```yaml
version: 0.0
Resources:
  - TargetService:
      Type: AWS::EC2::Instance
      Properties:
        Tags:
          - Key: Name
            Value: user-service

Hooks:
  BeforeInstall:
    - location: scripts/install.sh
  ApplicationStart:
    - location: scripts/start.sh
  ApplicationStop:
    - location: scripts/stop.sh
```

### Using ECS with Fargate

Define task definitions for each service in `ecs-task-definition.json`, then deploy via AWS CLI or Terraform.

---

## 🔐 Security Best Practices

1. **Secrets Management:**
   - Use AWS Secrets Manager for PayPal, SendGrid, etc.
   - Never commit `.env` files
   - Rotate secrets regularly

2. **Network:**
   - VPC with private subnets for services
   - Security groups restrict ports by source
   - Use VPC endpoints for AWS services

3. **Monitoring:**
   - CloudWatch logs for all containers
   - CloudWatch alarms for error rates
   - VPC Flow Logs for network debugging

4. **Scaling:**
   - Use Auto Scaling Groups for each service
   - Use Application Load Balancer for gateway
   - Consider managed container services (ECS Fargate)

---

## 📊 Monitoring & Logging

### Local Logs (Integration Mode)
```bash
docker compose logs -f [service-name]
```

### Production Logs (CloudWatch)
```bash
# View logs for specific service
aws logs tail /ecs/user-service --follow

# Search for errors
aws logs filter-log-events \
  --log-group-name /ecs/user-service \
  --filter-pattern "ERROR"
```

---

## 🚨 Health Checks

Each service exposes a `/health` endpoint:

```bash
# Check gateway
curl http://localhost:3000/health

# Response
{"status":"OK","timestamp":"2026-01-03T..."}
```

---

## 🎯 Next Steps

1. **Test Integration Mode locally** (if Docker available)
2. **Prepare EC2 AMI** with Docker pre-installed
3. **Deploy services incrementally** to test network
4. **Configure MongoDB Atlas** with IP whitelist
5. **Set up ALB and Route53** for public access
6. **Enable CloudWatch monitoring** and alarms
7. **Document runbooks** for incident response

---

## 📞 Support

For issues or questions:
- Check CloudWatch Logs for error messages
- Verify environment variables match deployment guide
- Test inter-service connectivity with `curl` or `nc`
- Review security group rules if services can't communicate

