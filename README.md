# MoodLift Backend

A microservices-based backend for the MoodLift mental health platform, built with Node.js, Express, and MongoDB Atlas.

## 🏗️ Architecture

The backend consists of the following microservices:

- **User Service** (Port 3001) - User management and authentication
- **Session Service** (Port 3002) - Therapy session management
- **Chat Service** (Port 3003) - Real-time messaging
- **Payment Service** (Port 3004) - Payment processing
- **AI Service** (Port 3005) - AI-powered mental health assistance
- **Feedback Service** (Port 3006) - User feedback and ratings
- **API Gateway** (Port 3000) - Central routing and load balancing

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for running seed script)
- MongoDB Atlas account

### 1. Clone and Setup

```bash
cd MoodLiftBackend
npm install
```

### 2. Database Setup

The project is configured to use MongoDB Atlas. The connection string is already set up in the `docker-compose.yml` file.

### 3. Seed Sample Data

```bash
npm run seed
```

This will create sample data including:
- 6 users (3 regular users, 3 listeners)
- 4 therapy sessions
- 5 chat messages
- 4 payments
- 3 AI interactions
- 3 feedback entries

### 4. Start Services

```bash
# Build and start all services
npm run build
npm run start

# Or use docker-compose directly
docker-compose up -d
```

### 5. Verify Services

Check if all services are running:

```bash
# View logs
npm run logs

# Check individual service health
curl http://localhost:3001/api/health  # User Service
curl http://localhost:3002/health      # Session Service
curl http://localhost:3003/health      # Chat Service
curl http://localhost:3004/health      # Payment Service
curl http://localhost:3005/health      # AI Service
curl http://localhost:3006/health      # Feedback Service
```

## 📊 Sample Data

After running the seed script, you'll have the following test accounts:

### Users
- **john.doe@example.com** / password123 (User)
- **jane.smith@example.com** / password123 (User)
- **mike.johnson@example.com** / password123 (User)

### Listeners
- **sarah.wilson@moodlift.com** / password123 (Listener)
- **robert.chen@moodlift.com** / password123 (Listener)
- **emily.davis@moodlift.com** / password123 (Listener)

## 🔧 Configuration

### Environment Variables

All services use the following environment variables:

- `MONGODB_URI` - MongoDB Atlas connection string
- `MONGODB_DB` - Database name (default: "moodlift")
- `NODE_ENV` - Environment (development/production)
- `PORT` - Service port (auto-configured per service)

### MongoDB Collections

The database contains the following collections:

- `users` - User accounts and profiles
- `sessions` - Therapy session records
- `chatMessages` - Chat conversation messages
- `payments` - Payment transaction records
- `ai_interactions` - AI chat interactions
- `feedback` - User feedback and ratings

## 🛠️ Development

### Adding New Services

1. Create a new service directory
2. Add Dockerfile
3. Update `docker-compose.yml`
4. Add service to gateway configuration

### Database Schema Changes

1. Update the model files in each service
2. Update the seed script if needed
3. Run `npm run seed` to update sample data

### API Documentation

Each service exposes RESTful APIs:

- **User Service**: `/api/v1/users/*`
- **Session Service**: `/api/sessions/*`
- **Chat Service**: `/api/messages/*`
- **Payment Service**: `/api/payments/*`
- **AI Service**: `/api/interactions/*`
- **Feedback Service**: `/api/feedback/*`

## 🐳 Docker Commands

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart a specific service
docker-compose restart user-service

# Scale a service
docker-compose up -d --scale user-service=3
```

## 🔍 Monitoring

### Health Checks

Each service provides a health endpoint:

```bash
curl http://localhost:3001/api/health
```

### Logs

View service logs:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f user-service
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Verify the connection string in `docker-compose.yml`
   - Check if MongoDB Atlas is accessible
   - Ensure IP whitelist includes your IP

2. **Service Won't Start**
   - Check if ports are already in use
   - Verify Docker is running
   - Check service logs: `docker-compose logs service-name`

3. **Database Empty**
   - Run the seed script: `npm run seed`
   - Check if MongoDB connection is successful

### Reset Everything

```bash
# Stop and remove all containers
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Rebuild and start
docker-compose up -d --build

# Seed data
npm run seed
```

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team.
