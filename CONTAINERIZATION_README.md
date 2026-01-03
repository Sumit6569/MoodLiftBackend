# MoodLift Backend - Complete Containerization Guide

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Services Details](#services-details)
3. [Environment Variables](#environment-variables)
4. [Dependencies](#dependencies)
5. [Port Mapping](#port-mapping)
6. [Build Configuration](#build-configuration)
7. [Database Configuration](#database-configuration)
8. [External Services Integration](#external-services-integration)

---

## 🏗️ Architecture Overview

MoodLift Backend is a **microservices-based architecture** consisting of:

- **7 Microservices** (6 business logic services + 1 API Gateway)
- **MongoDB Atlas** as the primary database
- **External APIs**: PayPal, SendGrid, Google Gemini AI, Cloudinary
- **Node.js 18+** runtime environment

### Service Communication Flow

```
Client → API Gateway (3000) → Individual Services (3001-3006) → MongoDB Atlas
                             ↓
                    External APIs (PayPal, SendGrid, etc.)
```

---

## 🚀 Services Details

### 1. API Gateway

- **Port**: 3000
- **Directory**: `gateway/`
- **Purpose**: Central routing, CORS handling, JWT verification
- **Technology**: Express.js with express-http-proxy
- **Entry Point**: `gateway/index.js`

**Key Features**:

- Routes requests to appropriate microservices
- JWT token verification (skips public routes)
- CORS configuration for frontend origins
- Request logging and error handling

**Dependencies**:

```json
{
  "express": "^5.1.0",
  "express-http-proxy": "^2.1.1",
  "jsonwebtoken": "^9.0.2",
  "nodemon": "^3.1.10"
}
```

**Environment Variables**:

- `JWT_SECRET` - Secret key for JWT verification
- `PORT` or `GATEWAY_PORT` - Gateway port (default: 3000)
- `NODE_ENV` - Environment (development/production)

---

### 2. User Service

- **Port**: 3001
- **Directory**: `user-service/`
- **Purpose**: User management, authentication, listener profiles, mood tracking
- **Entry Point**: `user-service/src/index.js`
- **Build Output**: `user-service/dist/index.cjs`

**Routes**:

- `/api/v1/auth/*` - Authentication (register, login, password reset, email verification)
- `/api/v1/users/*` - User CRUD operations
- `/api/v1/listeners/*` - Listener management
- `/api/v1/mood/*` - Mood tracking

**Dependencies**:

```json
{
  "express": "^4.21.1",
  "cors": "^2.8.5",
  "helmet": "^8.1.0",
  "morgan": "^1.10.1",
  "compression": "^1.8.1",
  "express-rate-limit": "^8.0.1",
  "mongoose": "^8.6.1",
  "bcryptjs": "^3.0.2",
  "jsonwebtoken": "^9.0.2",
  "uuid": "^11.1.0",
  "nodemailer": "^6.9.15",
  "@sendgrid/mail": "^8.1.6",
  "cloudinary": "^2.8.0",
  "multer": "^2.0.2"
}
```

**Environment Variables**:

- `USER_SERVICE_PORT` - Service port (default: 3001)
- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DB` - Database name (default: "moodlift")
- `JWT_SECRET` - JWT signing secret
- `FRONTEND_URL` - Frontend application URL
- `SENDGRID_API_KEY` - SendGrid API key for emails
- `FROM_EMAIL` - Email sender address
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `NODE_ENV` - Environment mode

**Build Process**:

```bash
npm run build  # Uses esbuild to bundle to dist/index.cjs
npm start      # Runs the bundled application
```

---

### 3. Session Service

- **Port**: 3002
- **Directory**: `session-service/`
- **Purpose**: Therapy session management, booking, scheduling
- **Entry Point**: `session-service/src/index.js`
- **Build Output**: `session-service/dist/index.cjs`

**Routes**:

- `/api/sessions/*` - Legacy session routes
- `/api/v1/sessions/*` - Session CRUD, booking, status updates

**Dependencies**:

```json
{
  "express": "^5.1.0",
  "cors": "^2.8.5",
  "helmet": "^8.1.0",
  "morgan": "^1.10.1",
  "compression": "^1.8.1",
  "express-rate-limit": "^8.0.1",
  "mongoose": "^8.6.1",
  "uuid": "^11.1.0",
  "@sendgrid/mail": "^8.1.6"
}
```

**Environment Variables**:

- `PORT` - Service port (default: 3002)
- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DB` - Database name
- `SENDGRID_API_KEY` - SendGrid for email notifications
- `FROM_EMAIL` - Email sender address
- `FRONTEND_URL` - Frontend URL for email links
- `NODE_ENV` - Environment mode

**Email Features**:

- Session booking confirmations
- Session status updates
- Reminder notifications

---

### 4. Chat Service

- **Port**: 3003
- **Directory**: `chat-service/`
- **Purpose**: Real-time messaging, community feed
- **Entry Point**: `chat-service/src/index.js`
- **Build Output**: `chat-service/dist/index.cjs`

**Routes**:

- `/api/messages/*` - Legacy message routes
- `/api/v1/chat/*` - Chat messaging
- `/api/v1/community/*` - Community posts and feed

**Dependencies**:

```json
{
  "express": "^5.1.0",
  "cors": "^2.8.5",
  "helmet": "^8.1.0",
  "morgan": "^1.10.1",
  "compression": "^1.8.1",
  "express-rate-limit": "^8.0.1",
  "mongoose": "^8.6.1",
  "uuid": "^11.1.0"
}
```

**Environment Variables**:

- `PORT` - Service port (default: 3003)
- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DB` - Database name
- `FRONTEND_URL` - Frontend URL for CORS
- `NODE_ENV` - Environment mode

**Models**:

- Message model (sender, receiver, content, attachments)
- Community post model (author, content, likes, comments)

---

### 5. Payment Service

- **Port**: 3004
- **Directory**: `payment-service/`
- **Purpose**: Payment processing via PayPal, subscription management
- **Entry Point**: `payment-service/src/index.js`
- **Build Output**: `payment-service/dist/index.cjs`

**Routes**:

- `/api/payments/*` - Legacy payment routes
- `/api/v1/payments/*` - Payment CRUD
- `/api/v1/paypal/*` - PayPal order creation and capture
- `/api/v1/subscriptions/*` - Subscription management
- `/api/v1/webhooks/paypal` - PayPal webhook handler

**Dependencies**:

```json
{
  "express": "^5.1.0",
  "cors": "^2.8.5",
  "helmet": "^8.1.0",
  "morgan": "^1.10.1",
  "compression": "^1.8.1",
  "express-rate-limit": "^8.0.1",
  "mongoose": "^8.6.1",
  "uuid": "^11.1.0"
}
```

**Environment Variables**:

- `PORT` - Service port (default: 3004)
- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DB` - Database name
- `PAYPAL_CLIENT_ID` - PayPal OAuth client ID
- `PAYPAL_CLIENT_SECRET` - PayPal OAuth client secret
- `PAYPAL_MODE` - PayPal mode ("sandbox" or "live")
- `PAYPAL_SUCCESS_URL` - Payment success redirect URL
- `PAYPAL_CANCEL_URL` - Payment cancel redirect URL
- `FRONTEND_URL` - Frontend URL
- `NODE_ENV` - Environment mode

**PayPal Integration**:

- OAuth 2.0 authentication
- Order creation and capture
- Webhook event handling
- Subscription billing

---

### 6. AI Service

- **Port**: 3005
- **Directory**: `ai-service/`
- **Purpose**: AI-powered mental health chatbot using Google Gemini
- **Entry Point**: `ai-service/src/index.js`
- **Build Output**: `ai-service/dist/index.cjs`

**Routes**:

- `/api/v1/ai/*` - AI chat endpoints
- `/api/v1/ai/chat` - Standard chat
- `/api/v1/ai/chat/stream` - Streaming chat responses
- `/api/v1/ai/mood-analysis` - Mood analysis
- `/api/v1/ai/recommendations` - Personalized recommendations

**Dependencies**:

```json
{
  "express": "^5.1.0",
  "cors": "^2.8.5",
  "helmet": "^8.1.0",
  "morgan": "^1.10.1",
  "compression": "^1.8.1",
  "express-rate-limit": "^8.0.1",
  "mongoose": "^8.6.1",
  "uuid": "^11.1.0",
  "@google/generative-ai": "^0.24.1",
  "mongodb": "^6.19.0"
}
```

**Environment Variables**:

- `PORT` - Service port (default: 3005)
- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DB` - Database name
- `GEMINI_API_KEY` - Google Gemini API key
- `FRONTEND_URL` - Frontend URL
- `NODE_ENV` - Environment mode

**Rate Limiting**:

- General API: 100 requests/15 minutes (production), 1000 (dev)
- AI endpoints: 20 requests/minute (production), 100 (dev)

**Health Check**:

- Enhanced health endpoint with memory usage and uptime
- Readiness check for MongoDB connection

---

### 7. Feedback Service

- **Port**: 3006
- **Directory**: `feedback-service/`
- **Purpose**: User feedback and ratings collection
- **Entry Point**: `feedback-service/src/index.js`
- **Build Output**: `feedback-service/dist/index.cjs`

**Routes**:

- `/api/feedback/*` - Legacy feedback routes
- `/api/v1/feedback/*` - Feedback CRUD operations

**Dependencies**:

```json
{
  "express": "^5.1.0",
  "cors": "^2.8.5",
  "helmet": "^8.1.0",
  "morgan": "^1.10.1",
  "compression": "^1.8.1",
  "express-rate-limit": "^8.0.1",
  "mongoose": "^8.6.1",
  "uuid": "^11.1.0"
}
```

**Environment Variables**:

- `PORT` - Service port (default: 3006)
- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DB` - Database name
- `FRONTEND_URL` - Frontend URL
- `NODE_ENV` - Environment mode

**Features**:

- SessionId is now optional (v1.1.0)
- Support for general app feedback
- Rating system (1-5 stars)
- Comment collection

---

## 🔐 Environment Variables

### Complete Environment Variables List

Create a `.env` file in the root of each service or use a shared configuration:

```bash
# ===== SHARED CONFIGURATION =====
NODE_ENV=production
FRONTEND_URL=https://mood-lift-support.vercel.app

# ===== DATABASE =====
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB=moodlift

# ===== JWT & SECURITY =====
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# ===== SERVICE PORTS (Optional - defaults provided) =====
GATEWAY_PORT=3000
USER_SERVICE_PORT=3001
PORT=3002  # Session Service
# PORT=3003  # Chat Service
# PORT=3004  # Payment Service
# PORT=3005  # AI Service
# PORT=3006  # Feedback Service

# ===== EMAIL SERVICE (User & Session Services) =====
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@moodlift.com

# ===== CLOUDINARY (User Service - Image Uploads) =====
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-cloudinary-secret

# ===== PAYPAL (Payment Service) =====
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox  # or "live" for production
PAYPAL_SUCCESS_URL=https://moodlift.com/payment/success
PAYPAL_CANCEL_URL=https://moodlift.com/payment/cancel

# ===== GOOGLE GEMINI AI (AI Service) =====
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Environment Variables by Service

#### Gateway

```bash
JWT_SECRET=required
PORT=3000
NODE_ENV=development|production
```

#### User Service

```bash
USER_SERVICE_PORT=3001
MONGODB_URI=required
MONGODB_DB=moodlift
JWT_SECRET=required
FRONTEND_URL=optional
SENDGRID_API_KEY=optional
FROM_EMAIL=optional
CLOUDINARY_CLOUD_NAME=optional
CLOUDINARY_API_KEY=optional
CLOUDINARY_API_SECRET=optional
NODE_ENV=development|production
```

#### Session Service

```bash
PORT=3002
MONGODB_URI=required
MONGODB_DB=moodlift
SENDGRID_API_KEY=required
FROM_EMAIL=required
FRONTEND_URL=optional
NODE_ENV=development|production
```

#### Chat Service

```bash
PORT=3003
MONGODB_URI=required
MONGODB_DB=moodlift
FRONTEND_URL=optional
NODE_ENV=development|production
```

#### Payment Service

```bash
PORT=3004
MONGODB_URI=required
MONGODB_DB=moodlift
PAYPAL_CLIENT_ID=required
PAYPAL_CLIENT_SECRET=required
PAYPAL_MODE=sandbox|live
PAYPAL_SUCCESS_URL=optional
PAYPAL_CANCEL_URL=optional
FRONTEND_URL=optional
NODE_ENV=development|production
```

#### AI Service

```bash
PORT=3005
MONGODB_URI=required
MONGODB_DB=moodlift
GEMINI_API_KEY=required
FRONTEND_URL=optional
NODE_ENV=development|production
```

#### Feedback Service

```bash
PORT=3006
MONGODB_URI=required
MONGODB_DB=moodlift
FRONTEND_URL=optional
NODE_ENV=development|production
```

---

## 📦 Dependencies

### Common Dependencies Across Services

All services share these core dependencies:

- `express` - Web framework
- `cors` - Cross-Origin Resource Sharing
- `helmet` - Security headers
- `morgan` - HTTP request logger
- `compression` - Response compression
- `express-rate-limit` - Rate limiting
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variable management
- `uuid` - Unique ID generation

### Service-Specific Dependencies

| Service          | Unique Dependencies                                                                |
| ---------------- | ---------------------------------------------------------------------------------- |
| Gateway          | `express-http-proxy`, `jsonwebtoken`                                               |
| User Service     | `bcryptjs`, `jsonwebtoken`, `nodemailer`, `@sendgrid/mail`, `cloudinary`, `multer` |
| Session Service  | `@sendgrid/mail`                                                                   |
| Chat Service     | None (uses common only)                                                            |
| Payment Service  | None (custom PayPal integration)                                                   |
| AI Service       | `@google/generative-ai`, `mongodb`                                                 |
| Feedback Service | None (uses common only)                                                            |

### Build Dependencies

All services except Gateway use:

- `esbuild` - Fast JavaScript bundler
- `nodemon` - Development auto-reload

---

## 🔌 Port Mapping

| Service          | Internal Port | Container Port | Purpose                   |
| ---------------- | ------------- | -------------- | ------------------------- |
| Gateway          | 3000          | 3000           | API Gateway - Entry point |
| User Service     | 3001          | 3001           | User & Auth               |
| Session Service  | 3002          | 3002           | Session Management        |
| Chat Service     | 3003          | 3003           | Messaging                 |
| Payment Service  | 3004          | 3004           | Payments                  |
| AI Service       | 3005          | 3005           | AI Chatbot                |
| Feedback Service | 3006          | 3006           | Feedback                  |

**Health Check Endpoints**:

- Gateway: `GET /health` (if implemented)
- User Service: `GET /api/health`
- Other Services: `GET /health`

---

## 🏗️ Build Configuration

### Build Process for Each Service

All services (except Gateway) follow this build pattern:

#### Development

```bash
npm run dev  # Uses nodemon for auto-reload
```

#### Production Build

```bash
npm run clean   # Clean dist folder
npm run build   # Bundle with esbuild
npm start       # Run bundled application
```

#### Build Script Details

Using **esbuild** for fast bundling:

```json
{
  "build": "npx esbuild src/index.js --bundle --platform=node --outfile=dist/index.cjs --format=cjs --minify --external:express --external:cors --external:helmet --external:morgan --external:compression --external:express-rate-limit --external:dotenv --external:mongoose --external:uuid [additional externals]"
}
```

**External packages** (not bundled):

- express, cors, helmet, morgan, compression
- express-rate-limit, dotenv, mongoose, uuid
- Service-specific: @sendgrid/mail, @google/generative-ai, cloudinary, etc.

### Dockerfile Strategy

Each service should use a multi-stage Dockerfile:

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
RUN npm run build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE [PORT]
CMD ["npm", "start"]
```

**Note**: Gateway doesn't need a build step, so it only needs the production stage.

---

## 🗄️ Database Configuration

### MongoDB Atlas Setup

**Connection Pattern**:

```javascript
mongoose.connect(MONGODB_URI, {
  dbName: process.env.MONGODB_DB || "moodlift",
  retryWrites: true,
  w: "majority",
});
```

**Database Name**: `moodlift` (configurable via `MONGODB_DB`)

### Collections

| Collection       | Used By          | Purpose                     |
| ---------------- | ---------------- | --------------------------- |
| `users`          | User Service     | User accounts               |
| `listeners`      | User Service     | Therapist/listener profiles |
| `moods`          | User Service     | Mood tracking entries       |
| `sessions`       | Session Service  | Therapy sessions            |
| `messages`       | Chat Service     | Chat messages               |
| `communityposts` | Chat Service     | Community feed posts        |
| `payments`       | Payment Service  | Payment records             |
| `subscriptions`  | Payment Service  | Subscription management     |
| `aiinteractions` | AI Service       | AI chat history             |
| `feedback`       | Feedback Service | User feedback               |

### Database Indexes

Each service should create appropriate indexes on startup (handled by Mongoose schemas).

---

## 🌐 External Services Integration

### 1. SendGrid (Email Service)

**Used by**: User Service, Session Service

**Setup**:

1. Create account at https://sendgrid.com
2. Generate API key
3. Verify sender email address
4. Set environment variables:
   ```bash
   SENDGRID_API_KEY=SG.xxxx
   FROM_EMAIL=noreply@yourdomain.com
   ```

**Usage**:

- User registration verification emails
- Password reset emails
- Session booking confirmations
- Session reminder emails

### 2. Cloudinary (Image Storage)

**Used by**: User Service

**Setup**:

1. Create account at https://cloudinary.com
2. Get cloud name, API key, and API secret from dashboard
3. Set environment variables:
   ```bash
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=123456789
   CLOUDINARY_API_SECRET=xxxxx
   ```

**Usage**:

- User profile picture uploads
- Listener profile pictures
- Image transformations (500x500, auto quality, auto format)

### 3. PayPal (Payment Processing)

**Used by**: Payment Service

**Setup**:

1. Create PayPal Developer account
2. Create REST API app
3. Get Client ID and Secret
4. Set environment variables:
   ```bash
   PAYPAL_CLIENT_ID=your-client-id
   PAYPAL_CLIENT_SECRET=your-secret
   PAYPAL_MODE=sandbox  # or live
   PAYPAL_SUCCESS_URL=https://yourapp.com/success
   PAYPAL_CANCEL_URL=https://yourapp.com/cancel
   ```

**Integration**:

- OAuth 2.0 authentication
- Order creation and capture
- Subscription management
- Webhook handling

**API Endpoints**:

- Sandbox: `https://api-m.sandbox.paypal.com`
- Production: `https://api-m.paypal.com`

### 4. Google Gemini AI

**Used by**: AI Service

**Setup**:

1. Create Google Cloud project
2. Enable Generative AI API
3. Generate API key
4. Set environment variable:
   ```bash
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXX
   ```

**Usage**:

- Mental health chatbot conversations
- Mood analysis
- Personalized recommendations
- Crisis detection and support

**Model**: `gemini-pro`

**API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`

---

## 🐳 Docker Compose Example

Here's a complete `docker-compose.yml` for all services:

```yaml
version: "3.8"

services:
  gateway:
    build:
      context: ./gateway
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - PORT=3000
    depends_on:
      - user-service
      - session-service
      - chat-service
      - payment-service
      - ai-service
      - feedback-service
    networks:
      - moodlift-network
    restart: unless-stopped

  user-service:
    build:
      context: ./user-service
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - USER_SERVICE_PORT=3001
      - MONGODB_URI=${MONGODB_URI}
      - MONGODB_DB=${MONGODB_DB}
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
      - SENDGRID_API_KEY=${SENDGRID_API_KEY}
      - FROM_EMAIL=${FROM_EMAIL}
      - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
      - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
      - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
    networks:
      - moodlift-network
    restart: unless-stopped

  session-service:
    build:
      context: ./session-service
      dockerfile: Dockerfile
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - PORT=3002
      - MONGODB_URI=${MONGODB_URI}
      - MONGODB_DB=${MONGODB_DB}
      - SENDGRID_API_KEY=${SENDGRID_API_KEY}
      - FROM_EMAIL=${FROM_EMAIL}
      - FRONTEND_URL=${FRONTEND_URL}
    networks:
      - moodlift-network
    restart: unless-stopped

  chat-service:
    build:
      context: ./chat-service
      dockerfile: Dockerfile
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=production
      - PORT=3003
      - MONGODB_URI=${MONGODB_URI}
      - MONGODB_DB=${MONGODB_DB}
      - FRONTEND_URL=${FRONTEND_URL}
    networks:
      - moodlift-network
    restart: unless-stopped

  payment-service:
    build:
      context: ./payment-service
      dockerfile: Dockerfile
    ports:
      - "3004:3004"
    environment:
      - NODE_ENV=production
      - PORT=3004
      - MONGODB_URI=${MONGODB_URI}
      - MONGODB_DB=${MONGODB_DB}
      - PAYPAL_CLIENT_ID=${PAYPAL_CLIENT_ID}
      - PAYPAL_CLIENT_SECRET=${PAYPAL_CLIENT_SECRET}
      - PAYPAL_MODE=${PAYPAL_MODE}
      - PAYPAL_SUCCESS_URL=${PAYPAL_SUCCESS_URL}
      - PAYPAL_CANCEL_URL=${PAYPAL_CANCEL_URL}
      - FRONTEND_URL=${FRONTEND_URL}
    networks:
      - moodlift-network
    restart: unless-stopped

  ai-service:
    build:
      context: ./ai-service
      dockerfile: Dockerfile
    ports:
      - "3005:3005"
    environment:
      - NODE_ENV=production
      - PORT=3005
      - MONGODB_URI=${MONGODB_URI}
      - MONGODB_DB=${MONGODB_DB}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - FRONTEND_URL=${FRONTEND_URL}
    networks:
      - moodlift-network
    restart: unless-stopped

  feedback-service:
    build:
      context: ./feedback-service
      dockerfile: Dockerfile
    ports:
      - "3006:3006"
    environment:
      - NODE_ENV=production
      - PORT=3006
      - MONGODB_URI=${MONGODB_URI}
      - MONGODB_DB=${MONGODB_DB}
      - FRONTEND_URL=${FRONTEND_URL}
    networks:
      - moodlift-network
    restart: unless-stopped

networks:
  moodlift-network:
    driver: bridge
```

---

## 📝 Container Resource Requirements

### Recommended Resource Allocation

| Service          | CPU  | Memory | Storage |
| ---------------- | ---- | ------ | ------- |
| Gateway          | 0.25 | 256MB  | 50MB    |
| User Service     | 0.5  | 512MB  | 100MB   |
| Session Service  | 0.25 | 256MB  | 50MB    |
| Chat Service     | 0.25 | 256MB  | 50MB    |
| Payment Service  | 0.25 | 256MB  | 50MB    |
| AI Service       | 0.5  | 512MB  | 100MB   |
| Feedback Service | 0.25 | 256MB  | 50MB    |

**Total**: 2.25 CPU cores, 2.5GB RAM

---

## 🚦 Health Checks

Each service exposes a health check endpoint:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:[PORT]/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Health Check Responses

**User Service** (`/api/health`):

```json
{
  "status": "OK",
  "timestamp": "2025-12-23T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

**Other Services** (`/health`):

```json
{
  "status": "OK",
  "service": "session-service",
  "timestamp": "2025-12-23T10:30:00.000Z"
}
```

**AI Service** (Enhanced):

```json
{
  "status": "OK",
  "service": "ai-service",
  "version": "2.0.0",
  "timestamp": "2025-12-23T10:30:00.000Z",
  "uptime": 3600,
  "memory": {
    "used": 128,
    "total": 256
  },
  "environment": "production"
}
```

---

## 🔒 Security Considerations

### 1. Environment Variables

- Never commit `.env` files to version control
- Use Docker secrets or Kubernetes secrets in production
- Rotate API keys regularly

### 2. Network Security

- Use internal Docker network for service-to-service communication
- Only expose Gateway (port 3000) to the internet
- Implement rate limiting on all services

### 3. Database Security

- Use MongoDB Atlas network access lists
- Enable MongoDB authentication
- Use encrypted connections (TLS/SSL)

### 4. API Security

- JWT token validation in Gateway
- Helmet.js for security headers
- CORS configuration for allowed origins
- Input validation and sanitization

---

## 📚 Additional Resources

### Seed Data

Run `npm run seed` in the root directory to populate MongoDB with test data:

- 6 users (3 regular, 3 listeners)
- 4 therapy sessions
- 5 chat messages
- 4 payments
- 3 AI interactions
- 3 feedback entries

### API Documentation

See [API_ROUTES.md](./API_ROUTES.md) for complete API endpoint documentation.

### Deployment Guide

See [QUICK_DEPLOY_GUIDE.md](./QUICK_DEPLOY_GUIDE.md) for deployment instructions.

---

## 🎯 Quick Start Containerization Checklist

- [ ] Set up MongoDB Atlas cluster
- [ ] Configure all environment variables
- [ ] Set up external services (SendGrid, Cloudinary, PayPal, Gemini)
- [ ] Create Dockerfile for each service
- [ ] Create docker-compose.yml
- [ ] Build all services: `docker-compose build`
- [ ] Start all services: `docker-compose up -d`
- [ ] Run seed data: `npm run seed`
- [ ] Verify health checks: `curl http://localhost:3001/api/health`
- [ ] Test API through Gateway: `http://localhost:3000`

---

## ☁️ Azure Deployment Guide

This section provides step-by-step instructions for deploying all MoodLift microservices to Microsoft Azure.

### Prerequisites

1. **Azure Account** with an active subscription
2. **Azure CLI** installed: [Install Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
3. **Docker** installed locally
4. **Git** for version control
5. **MongoDB Atlas** account and cluster

### Deployment Options

We'll cover two deployment strategies:

- **Option A**: Azure Container Apps (Recommended - Serverless, auto-scaling)
- **Option B**: Azure Kubernetes Service (AKS) (For advanced orchestration)

---

## 🚀 Option A: Deploy to Azure Container Apps (Recommended)

Azure Container Apps is a serverless container platform ideal for microservices.

### Step 1: Prepare Your Environment

```bash
# Login to Azure
az login

# Set your subscription (if you have multiple)
az account set --subscription "Your-Subscription-Name"

# Install Container Apps extension
az extension add --name containerapp --upgrade

# Create resource group
az group create \
  --name moodlift-rg \
  --location eastus

# Create Container Apps environment
az containerapp env create \
  --name moodlift-env \
  --resource-group moodlift-rg \
  --location eastus
```

### Step 2: Create Azure Container Registry (ACR)

```bash
# Create ACR
az acr create \
  --resource-group moodlift-rg \
  --name moodliftregistry \
  --sku Basic \
  --admin-enabled true

# Login to ACR
az acr login --name moodliftregistry

# Get ACR credentials (save these for later)
az acr credential show --name moodliftregistry
```

### Step 3: Build and Push Docker Images

Create Dockerfiles for each service first.

#### Gateway Dockerfile (`gateway/Dockerfile`)

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
```

#### Service Dockerfile Template (for User, Session, Chat, Payment, AI, Feedback)

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["npm", "start"]
```

**Adjust the EXPOSE port for each service**:

- User Service: 3001
- Session Service: 3002
- Chat Service: 3003
- Payment Service: 3004
- AI Service: 3005
- Feedback Service: 3006

#### Build and Push Images

```bash
# Navigate to backend directory
cd MoodLiftBackend

# Build and push Gateway
docker build -t moodliftregistry.azurecr.io/gateway:latest ./gateway
docker push moodliftregistry.azurecr.io/gateway:latest

# Build and push User Service
docker build -t moodliftregistry.azurecr.io/user-service:latest ./user-service
docker push moodliftregistry.azurecr.io/user-service:latest

# Build and push Session Service
docker build -t moodliftregistry.azurecr.io/session-service:latest ./session-service
docker push moodliftregistry.azurecr.io/session-service:latest

# Build and push Chat Service
docker build -t moodliftregistry.azurecr.io/chat-service:latest ./chat-service
docker push moodliftregistry.azurecr.io/chat-service:latest

# Build and push Payment Service
docker build -t moodliftregistry.azurecr.io/payment-service:latest ./payment-service
docker push moodliftregistry.azurecr.io/payment-service:latest

# Build and push AI Service
docker build -t moodliftregistry.azurecr.io/ai-service:latest ./ai-service
docker push moodliftregistry.azurecr.io/ai-service:latest

# Build and push Feedback Service
docker build -t moodliftregistry.azurecr.io/feedback-service:latest ./feedback-service
docker push moodliftregistry.azurecr.io/feedback-service:latest
```

### Step 4: Deploy Each Service to Container Apps

#### Deploy User Service

```bash
az containerapp create \
  --name user-service \
  --resource-group moodlift-rg \
  --environment moodlift-env \
  --image moodliftregistry.azurecr.io/user-service:latest \
  --registry-server moodliftregistry.azurecr.io \
  --target-port 3001 \
  --ingress internal \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 0.5 \
  --memory 1.0Gi \
  --secrets \
    mongodb-uri="<YOUR_MONGODB_URI>" \
    jwt-secret="<YOUR_JWT_SECRET>" \
    sendgrid-api-key="<YOUR_SENDGRID_KEY>" \
    cloudinary-cloud-name="<YOUR_CLOUDINARY_NAME>" \
    cloudinary-api-key="<YOUR_CLOUDINARY_KEY>" \
    cloudinary-api-secret="<YOUR_CLOUDINARY_SECRET>" \
  --env-vars \
    NODE_ENV=production \
    USER_SERVICE_PORT=3001 \
    MONGODB_URI=secretref:mongodb-uri \
    MONGODB_DB=moodlift \
    JWT_SECRET=secretref:jwt-secret \
    FRONTEND_URL=https://mood-lift-support.vercel.app \
    SENDGRID_API_KEY=secretref:sendgrid-api-key \
    FROM_EMAIL=noreply@moodlift.com \
    CLOUDINARY_CLOUD_NAME=secretref:cloudinary-cloud-name \
    CLOUDINARY_API_KEY=secretref:cloudinary-api-key \
    CLOUDINARY_API_SECRET=secretref:cloudinary-api-secret
```

#### Deploy Session Service

```bash
az containerapp create \
  --name session-service \
  --resource-group moodlift-rg \
  --environment moodlift-env \
  --image moodliftregistry.azurecr.io/session-service:latest \
  --registry-server moodliftregistry.azurecr.io \
  --target-port 3002 \
  --ingress internal \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 0.25 \
  --memory 0.5Gi \
  --secrets \
    mongodb-uri="<YOUR_MONGODB_URI>" \
    sendgrid-api-key="<YOUR_SENDGRID_KEY>" \
  --env-vars \
    NODE_ENV=production \
    PORT=3002 \
    MONGODB_URI=secretref:mongodb-uri \
    MONGODB_DB=moodlift \
    FRONTEND_URL=https://mood-lift-support.vercel.app \
    SENDGRID_API_KEY=secretref:sendgrid-api-key \
    FROM_EMAIL=noreply@moodlift.com
```

#### Deploy Chat Service

```bash
az containerapp create \
  --name chat-service \
  --resource-group moodlift-rg \
  --environment moodlift-env \
  --image moodliftregistry.azurecr.io/chat-service:latest \
  --registry-server moodliftregistry.azurecr.io \
  --target-port 3003 \
  --ingress internal \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 0.25 \
  --memory 0.5Gi \
  --secrets \
    mongodb-uri="<YOUR_MONGODB_URI>" \
  --env-vars \
    NODE_ENV=production \
    PORT=3003 \
    MONGODB_URI=secretref:mongodb-uri \
    MONGODB_DB=moodlift \
    FRONTEND_URL=https://mood-lift-support.vercel.app
```

#### Deploy Payment Service

```bash
az containerapp create \
  --name payment-service \
  --resource-group moodlift-rg \
  --environment moodlift-env \
  --image moodliftregistry.azurecr.io/payment-service:latest \
  --registry-server moodliftregistry.azurecr.io \
  --target-port 3004 \
  --ingress internal \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 0.25 \
  --memory 0.5Gi \
  --secrets \
    mongodb-uri="<YOUR_MONGODB_URI>" \
    paypal-client-id="<YOUR_PAYPAL_CLIENT_ID>" \
    paypal-client-secret="<YOUR_PAYPAL_CLIENT_SECRET>" \
  --env-vars \
    NODE_ENV=production \
    PORT=3004 \
    MONGODB_URI=secretref:mongodb-uri \
    MONGODB_DB=moodlift \
    FRONTEND_URL=https://mood-lift-support.vercel.app \
    PAYPAL_CLIENT_ID=secretref:paypal-client-id \
    PAYPAL_CLIENT_SECRET=secretref:paypal-client-secret \
    PAYPAL_MODE=sandbox \
    PAYPAL_SUCCESS_URL=https://moodlift.com/payment/success \
    PAYPAL_CANCEL_URL=https://moodlift.com/payment/cancel
```

#### Deploy AI Service

```bash
az containerapp create \
  --name ai-service \
  --resource-group moodlift-rg \
  --environment moodlift-env \
  --image moodliftregistry.azurecr.io/ai-service:latest \
  --registry-server moodliftregistry.azurecr.io \
  --target-port 3005 \
  --ingress internal \
  --min-replicas 1 \
  --max-replicas 5 \
  --cpu 0.5 \
  --memory 1.0Gi \
  --secrets \
    mongodb-uri="<YOUR_MONGODB_URI>" \
    gemini-api-key="<YOUR_GEMINI_API_KEY>" \
  --env-vars \
    NODE_ENV=production \
    PORT=3005 \
    MONGODB_URI=secretref:mongodb-uri \
    MONGODB_DB=moodlift \
    FRONTEND_URL=https://mood-lift-support.vercel.app \
    GEMINI_API_KEY=secretref:gemini-api-key
```

#### Deploy Feedback Service

```bash
az containerapp create \
  --name feedback-service \
  --resource-group moodlift-rg \
  --environment moodlift-env \
  --image moodliftregistry.azurecr.io/feedback-service:latest \
  --registry-server moodliftregistry.azurecr.io \
  --target-port 3006 \
  --ingress internal \
  --min-replicas 1 \
  --max-replicas 3 \
  --cpu 0.25 \
  --memory 0.5Gi \
  --secrets \
    mongodb-uri="<YOUR_MONGODB_URI>" \
  --env-vars \
    NODE_ENV=production \
    PORT=3006 \
    MONGODB_URI=secretref:mongodb-uri \
    MONGODB_DB=moodlift \
    FRONTEND_URL=https://mood-lift-support.vercel.app
```

#### Deploy Gateway (with External Ingress)

```bash
az containerapp create \
  --name gateway \
  --resource-group moodlift-rg \
  --environment moodlift-env \
  --image moodliftregistry.azurecr.io/gateway:latest \
  --registry-server moodliftregistry.azurecr.io \
  --target-port 3000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 5 \
  --cpu 0.25 \
  --memory 0.5Gi \
  --secrets \
    jwt-secret="<YOUR_JWT_SECRET>" \
  --env-vars \
    NODE_ENV=production \
    PORT=3000 \
    JWT_SECRET=secretref:jwt-secret \
    USER_SERVICE_URL=http://user-service:3001 \
    SESSION_SERVICE_URL=http://session-service:3002 \
    CHAT_SERVICE_URL=http://chat-service:3003 \
    PAYMENT_SERVICE_URL=http://payment-service:3004 \
    AI_SERVICE_URL=http://ai-service:3005 \
    FEEDBACK_SERVICE_URL=http://feedback-service:3006
```

### Step 5: Get Gateway URL

```bash
# Get the gateway FQDN
az containerapp show \
  --name gateway \
  --resource-group moodlift-rg \
  --query properties.configuration.ingress.fqdn \
  --output tsv
```

This will output something like: `gateway.randomstring.eastus.azurecontainerapps.io`

### Step 6: Configure MongoDB Atlas Network Access

```bash
# Get Container Apps environment static IP
az containerapp env show \
  --name moodlift-env \
  --resource-group moodlift-rg \
  --query properties.staticIp \
  --output tsv
```

Add this IP to MongoDB Atlas Network Access whitelist:

1. Go to MongoDB Atlas dashboard
2. Network Access → IP Whitelist
3. Add the static IP from above

### Step 7: Verify Deployment

```bash
# Check all container apps
az containerapp list \
  --resource-group moodlift-rg \
  --output table

# Check specific service logs
az containerapp logs show \
  --name user-service \
  --resource-group moodlift-rg \
  --follow

# Test health endpoints
GATEWAY_URL=$(az containerapp show --name gateway --resource-group moodlift-rg --query properties.configuration.ingress.fqdn -o tsv)
curl https://$GATEWAY_URL/api/health
```

---

## 🎯 Option B: Deploy to Azure Kubernetes Service (AKS)

For more advanced orchestration needs.

### Step 1: Create AKS Cluster

```bash
# Create AKS cluster
az aks create \
  --resource-group moodlift-rg \
  --name moodlift-aks \
  --node-count 3 \
  --node-vm-size Standard_B2s \
  --enable-managed-identity \
  --generate-ssh-keys \
  --attach-acr moodliftregistry

# Get credentials
az aks get-credentials \
  --resource-group moodlift-rg \
  --name moodlift-aks
```

### Step 2: Create Kubernetes Namespace and Secrets

```bash
# Create namespace
kubectl create namespace moodlift

# Create secrets
kubectl create secret generic moodlift-secrets \
  --namespace=moodlift \
  --from-literal=mongodb-uri='<YOUR_MONGODB_URI>' \
  --from-literal=jwt-secret='<YOUR_JWT_SECRET>' \
  --from-literal=sendgrid-api-key='<YOUR_SENDGRID_KEY>' \
  --from-literal=cloudinary-cloud-name='<YOUR_CLOUDINARY_NAME>' \
  --from-literal=cloudinary-api-key='<YOUR_CLOUDINARY_KEY>' \
  --from-literal=cloudinary-api-secret='<YOUR_CLOUDINARY_SECRET>' \
  --from-literal=paypal-client-id='<YOUR_PAYPAL_CLIENT_ID>' \
  --from-literal=paypal-client-secret='<YOUR_PAYPAL_CLIENT_SECRET>' \
  --from-literal=gemini-api-key='<YOUR_GEMINI_API_KEY>'
```

### Step 3: Create Kubernetes Deployment Files

Create a file `k8s-deployments.yaml` with all service deployments and services. Here's an example for the gateway and user service:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: moodlift

---
# User Service Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  namespace: moodlift
spec:
  replicas: 2
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
        - name: user-service
          image: moodliftregistry.azurecr.io/user-service:latest
          ports:
            - containerPort: 3001
          env:
            - name: NODE_ENV
              value: "production"
            - name: USER_SERVICE_PORT
              value: "3001"
            - name: MONGODB_DB
              value: "moodlift"
            - name: MONGODB_URI
              valueFrom:
                secretKeyRef:
                  name: moodlift-secrets
                  key: mongodb-uri
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: moodlift-secrets
                  key: jwt-secret
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3001
            initialDelaySeconds: 30
            periodSeconds: 10

---
# User Service
apiVersion: v1
kind: Service
metadata:
  name: user-service
  namespace: moodlift
spec:
  selector:
    app: user-service
  ports:
    - protocol: TCP
      port: 3001
      targetPort: 3001
  type: ClusterIP

---
# Gateway Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gateway
  namespace: moodlift
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gateway
  template:
    metadata:
      labels:
        app: gateway
    spec:
      containers:
        - name: gateway
          image: moodliftregistry.azurecr.io/gateway:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
            - name: PORT
              value: "3000"
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: moodlift-secrets
                  key: jwt-secret
          resources:
            requests:
              memory: "256Mi"
              cpu: "125m"

---
# Gateway Service (LoadBalancer)
apiVersion: v1
kind: Service
metadata:
  name: gateway
  namespace: moodlift
spec:
  selector:
    app: gateway
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

Repeat similar patterns for all other services (session, chat, payment, ai, feedback).

### Step 4: Deploy to AKS

```bash
# Apply all manifests
kubectl apply -f k8s-deployments.yaml

# Check deployments
kubectl get deployments -n moodlift

# Check pods
kubectl get pods -n moodlift

# Check services
kubectl get services -n moodlift

# Get gateway external IP (wait for it to be assigned)
kubectl get service gateway -n moodlift
```

---

## 📊 Monitoring and Logging

### Enable Application Insights

```bash
# Create Log Analytics workspace
az monitor log-analytics workspace create \
  --resource-group moodlift-rg \
  --workspace-name moodlift-logs \
  --location eastus

# Create Application Insights
az monitor app-insights component create \
  --app moodlift-insights \
  --location eastus \
  --resource-group moodlift-rg \
  --workspace moodlift-logs
```

### View Logs

#### Container Apps

```bash
# Stream logs
az containerapp logs show \
  --name user-service \
  --resource-group moodlift-rg \
  --follow

# Tail last 100 lines
az containerapp logs show \
  --name user-service \
  --resource-group moodlift-rg \
  --tail 100
```

#### AKS

```bash
# View pod logs
kubectl logs -f deployment/user-service -n moodlift

# View logs for specific pod
kubectl logs <pod-name> -n moodlift
```

---

## 🔄 CI/CD Pipeline with GitHub Actions

Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure Container Apps

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: moodliftregistry.azurecr.io
  RESOURCE_GROUP: moodlift-rg

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service:
          - gateway
          - user-service
          - session-service
          - chat-service
          - payment-service
          - ai-service
          - feedback-service

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Login to ACR
        run: az acr login --name moodliftregistry

      - name: Build Docker Image
        run: |
          docker build -t ${{ env.REGISTRY }}/${{ matrix.service }}:${{ github.sha }} \
            -t ${{ env.REGISTRY }}/${{ matrix.service }}:latest \
            ./MoodLiftBackend/${{ matrix.service }}

      - name: Push Docker Image
        run: |
          docker push ${{ env.REGISTRY }}/${{ matrix.service }}:${{ github.sha }}
          docker push ${{ env.REGISTRY }}/${{ matrix.service }}:latest

      - name: Deploy to Container Apps
        run: |
          az containerapp update \
            --name ${{ matrix.service }} \
            --resource-group ${{ env.RESOURCE_GROUP }} \
            --image ${{ env.REGISTRY }}/${{ matrix.service }}:${{ github.sha }}
```

---

## 💰 Cost Optimization

1. **Container Apps**: Pay only for actual usage (ideal for variable traffic)
2. **Use Azure Spot VMs** for AKS nodes (up to 90% discount)
3. **Enable auto-scaling** to scale down during low traffic
4. **Use Azure Cost Management** to monitor spending
5. **Set up budget alerts** to avoid overspending
6. **Use reserved instances** for predictable workloads
7. **Optimize Docker images** (Alpine Linux, multi-stage builds)

### Estimated Monthly Costs (Container Apps)

- Gateway: ~$10-20
- User Service: ~$20-30
- Other Services: ~$10-15 each
- ACR: ~$5
- **Total**: ~$100-150/month for moderate traffic

---

## 🔐 Security Best Practices

1. **Use Azure Key Vault** for secrets management
2. **Enable managed identity** for Container Apps
3. **Use private endpoints** for MongoDB Atlas
4. **Enable container scanning** in ACR
5. **Implement network policies**
6. **Use Azure WAF** with Application Gateway
7. **Enable Azure DDoS Protection**
8. **Regular security updates** for dependencies
9. **Implement rate limiting** on all endpoints
10. **Use HTTPS only** for all communications

---

## 🚨 Troubleshooting Guide

### Issue: Container fails to start

```bash
# Check logs
az containerapp logs show --name <service-name> --resource-group moodlift-rg --tail 200

# Check replica status
az containerapp replica list --name <service-name> --resource-group moodlift-rg --output table

# Check revision
az containerapp revision list --name <service-name> --resource-group moodlift-rg
```

### Issue: Cannot connect to MongoDB

**Solutions**:

- Verify MongoDB Atlas IP whitelist includes Azure Container Apps static IP
- Check connection string format (must include password encoding for special characters)
- Ensure secrets are correctly configured
- Test connection locally first

### Issue: Service returns 502/503 errors

**Solutions**:

- Check if service is healthy: `az containerapp show --name <service> --resource-group moodlift-rg`
- Verify target port matches container port
- Check resource limits (increase CPU/Memory if needed)
- Review application logs for crashes

### Issue: High latency

**Solutions**:

- Enable Azure CDN
- Increase replica count
- Use Azure Front Door for global distribution
- Check database query performance
- Implement caching with Azure Redis

---

## 📋 Complete Deployment Checklist

### Pre-Deployment

- [ ] MongoDB Atlas cluster created and configured
- [ ] All API keys obtained (SendGrid, Cloudinary, PayPal, Gemini)
- [ ] Azure subscription active with sufficient credits
- [ ] Azure CLI installed and logged in
- [ ] Docker Desktop installed and running
- [ ] All services tested locally

### Azure Setup

- [ ] Resource group created (`moodlift-rg`)
- [ ] Container Registry created (`moodliftregistry`)
- [ ] Container Apps environment created (`moodlift-env`)
- [ ] Log Analytics workspace created
- [ ] Application Insights configured

### Build & Push

- [ ] Dockerfile created for each service
- [ ] All 7 Docker images built successfully
- [ ] All images pushed to ACR
- [ ] Images verified in ACR

### Deployment

- [ ] User Service deployed
- [ ] Session Service deployed
- [ ] Chat Service deployed
- [ ] Payment Service deployed
- [ ] AI Service deployed
- [ ] Feedback Service deployed
- [ ] Gateway deployed with external ingress

### Configuration

- [ ] All secrets configured
- [ ] Environment variables set
- [ ] MongoDB Atlas IP whitelist updated
- [ ] Auto-scaling rules configured
- [ ] Health checks verified

### Post-Deployment

- [ ] All services running (check with `az containerapp list`)
- [ ] Health endpoints responding (test each service)
- [ ] Gateway accessible via FQDN
- [ ] API endpoints tested end-to-end
- [ ] External integrations verified (PayPal, SendGrid, etc.)
- [ ] Logging and monitoring enabled
- [ ] CI/CD pipeline configured (optional)
- [ ] Custom domain configured (optional)
- [ ] SSL/TLS certificate installed
- [ ] Cost monitoring alerts set up

---

## 📞 Additional Resources

- **Azure Container Apps**: https://docs.microsoft.com/azure/container-apps
- **Azure CLI Reference**: https://docs.microsoft.com/cli/azure
- **AKS Documentation**: https://docs.microsoft.com/azure/aks
- **MongoDB Atlas Azure Integration**: https://www.mongodb.com/docs/atlas/reference/microsoft-azure
- **Azure Pricing Calculator**: https://azure.microsoft.com/pricing/calculator

---

**Last Updated**: December 23, 2025  
**Version**: 2.0.0 (Added Azure Deployment Guide)  
**Maintainer**: MoodLift Development Team
