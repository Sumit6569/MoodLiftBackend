# Docker & Deployment Guide

This document provides quick reference for deploying MoodLift in different environments.

## 🎯 Quick Start

### For Local Testing (Integration Mode)

```bash
# 1. Install Docker & Docker Compose
# Visit: https://www.docker.com/products/docker-desktop

# 2. Setup environment
cp .env.local.example .env

# 3. Start everything
chmod +x start-compose.sh
./start-compose.sh

# 4. Test
curl http://localhost:3000/health
```

**Gateway URL:** `http://localhost:3000`

### For Production on AWS EC2

```bash
# 1. Prepare .env with production values
cp .env.production.example .env
# Edit .env with MongoDB Atlas, service IPs, secrets

# 2. Build all services
chmod +x build-all-services.sh
./build-all-services.sh

# 3. Start services (see generated run scripts)
./user-service/run-user-service.sh
./session-service/run-session-service.sh
# ... continue for all services

# 4. Verify
docker ps
```

---

## 📚 Detailed Documentation

See **[DOCKER_DEPLOYMENT_GUIDE.md](./DOCKER_DEPLOYMENT_GUIDE.md)** for:

- Complete architecture overview
- Step-by-step integration mode setup
- Complete production deployment walkthrough
- Inter-service communication patterns
- Networking & security configuration
- AWS EC2 deployment procedures
- Troubleshooting guide
- Monitoring & logging setup

---

## 🏗️ Project Structure

```
MoodLiftBackend/
├── docker-compose.yml          # Integration mode (local)
├── .env.local.example          # Local env template
├── .env.production.example     # Production env template
├── .dockerignore                # Root Docker ignore
├── start-compose.sh            # Local quick start
├── build-all-services.sh       # Production builder
├── deploy-service.sh           # Individual service deployer
│
├── ai-service/
│   ├── Dockerfile              # Multi-stage production build
│   ├── .dockerignore           # Service-level ignore
│   └── src/
│
├── chat-service/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/
│
├── feedback-service/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/
│
├── payment-service/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/
│
├── session-service/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/
│
├── user-service/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/
│
└── gateway/
    ├── Dockerfile              # Single-stage (no build)
    ├── .dockerignore
    └── index.js
```

---

## 🔑 Key Features

✅ **No localhost hardcoding** - All services use environment variables  
✅ **True microservice independence** - Each service runs standalone  
✅ **Multi-stage builds** - Optimized production images  
✅ **Docker Compose support** - Local integration testing  
✅ **AWS-ready** - Tested deployment patterns for EC2  
✅ **Zero local Docker requirement** - Builds and runs on servers only  

---

## 📦 Image Sizes

Optimized multi-stage builds:
- `ai-service:latest` - ~150MB
- `chat-service:latest` - ~150MB
- `feedback-service:latest` - ~150MB
- `payment-service:latest` - ~150MB
- `session-service:latest` - ~150MB
- `user-service:latest` - ~150MB
- `gateway:latest` - ~100MB

---

## 🚀 Deployment Modes

| Feature | Local (Compose) | Production (EC2) |
|---------|-----------------|------------------|
| **Database** | Container | MongoDB Atlas |
| **Networking** | Docker internal | VPC + private IPs |
| **Communication** | Service names | HTTP over IPs |
| **Storage** | Persistent volume | AWS storage |
| **Scaling** | N/A | ASG + ALB |
| **Cost** | Free (local) | Pay per instance |

---

## 🔒 Security

### Local (Integration)
- All services on private network
- No auth between services
- Suitable for CI/CD testing only

### Production
- VPC with private subnets
- Security groups restrict ports
- Services use private IPs
- MongoDB Atlas with IP whitelist
- All secrets via AWS Secrets Manager

---

## 📋 Pre-Deployment Checklist

- [ ] Docker installed on deployment machine
- [ ] Clone MoodLift repository
- [ ] Copy appropriate .env file (`.env.local.example` or `.env.production.example`)
- [ ] Customize environment variables
- [ ] Verify MongoDB connectivity (local or Atlas)
- [ ] Test service ports are not in use
- [ ] If production: VPC/security groups configured
- [ ] If production: MongoDB Atlas IP whitelist updated

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `docker: command not found` | Install Docker from https://docker.com |
| `docker compose: command not found` | Install Docker Compose |
| `Bind for 0.0.0.0:3000 failed` | Port 3000 in use; kill process or change port |
| `MongoDB connection refused` | Verify MONGODB_URI; check Atlas IP whitelist |
| `Cannot reach service from gateway` | Check SERVICE_URLs in .env; verify networking |

---

## 📞 Need Help?

1. Check [DOCKER_DEPLOYMENT_GUIDE.md](./DOCKER_DEPLOYMENT_GUIDE.md)
2. Review service logs: `docker logs <service-name>`
3. Test connectivity: `docker exec <service-name> curl http://other-service:port/health`
4. Verify environment: `docker inspect <service-name> | grep -A 50 Env`

---

## 📖 Related Files

- [DOCKER_DEPLOYMENT_GUIDE.md](./DOCKER_DEPLOYMENT_GUIDE.md) - Comprehensive deployment guide
- [docker-compose.yml](./docker-compose.yml) - Local integration configuration
- [.env.local.example](./.env.local.example) - Local environment template
- [.env.production.example](./.env.production.example) - Production environment template
- [.dockerignore](./.dockerignore) - Root Docker ignore patterns

---

**Last Updated:** January 3, 2026  
**Status:** Production-Ready ✅
