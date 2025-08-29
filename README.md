# MoodLift Backend - MongoDB Implementation

This is the backend implementation of the MoodLift application, an AI-powered mental wellness platform that provides chat, video call, and instant session support for youth dealing with depression, loneliness, and related challenges.

## Architecture

The application follows a microservices architecture with the following services:

- **User Service** (Port 3001) - User management and authentication
- **Session Service** (Port 3002) - Chat and video session management
- **Chat Service** (Port 3003) - Chat message handling
- **Payment Service** (Port 3004) - Payment processing and tracking
- **AI Service** (Port 3005) - AI chatbot interactions
- **Feedback Service** (Port 3006) - User feedback and ratings

## Technology Stack

- **Runtime**: Node.js (v18 or higher)
- **Language**: JavaScript (ES6+)
- **Database**: MongoDB with Mongoose ODM
- **Framework**: Express.js
- **Containerization**: Docker and Docker Compose
- **Security**: Helmet.js, CORS, Rate Limiting
- **Logging**: Morgan
- **Compression**: Compression middleware

## Database Schema

All services use MongoDB with the following collections:

### Users Collection

```javascript
{
  userId: String (required, unique, indexed),
  name: String (required),
  email: String (required, unique, indexed),
  passwordHash: String (required),
  role: String (required, enum: ['user', 'listener']),
  freeSessionsUsed: Number (default: 0),
  createdAt: String (ISO 8601 timestamp)
}
```

### Sessions Collection

```javascript
{
  sessionId: String (required, unique, indexed),
  userId: String (required, indexed),
  listenerId: String (required, indexed),
  type: String (required, enum: ['chat', 'video']),
  status: String (required, enum: ['pending', 'active', 'completed']),
  startTime: String (required, ISO 8601 timestamp),
  endTime: String (optional, ISO 8601 timestamp),
  cost: Number (required)
}
```

### ChatMessages Collection

```javascript
{
  sessionId: String (required, indexed),
  messageId: String (required, unique, indexed),
  senderId: String (required, indexed),
  content: String (required),
  timestamp: String (required, ISO 8601)
}
```

### Payments Collection

```javascript
{
  paymentId: String (required, unique, indexed),
  userId: String (required, indexed),
  sessionId: String (required, indexed),
  amount: Number (required),
  status: String (required, enum: ['pending', 'completed', 'failed']),
  createdAt: String (required, ISO 8601 timestamp)
}
```

### AI_Interactions Collection

```javascript
{
  interactionId: String (required, unique, indexed),
  userId: String (required, indexed),
  query: String (required),
  response: String (required),
  timestamp: String (required, ISO 8601 timestamp)
}
```

### Feedback Collection

```javascript
{
  feedbackId: String (required, unique, indexed),
  userId: String (required, indexed),
  sessionId: String (required, indexed),
  rating: Number (required, min: 1, max: 5),
  comments: String (required),
  createdAt: String (required, ISO 8601 timestamp)
}
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- MongoDB (automatically set up via Docker)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd MoodLiftBackend
```

2. Install dependencies for all services:

```bash
# Install dependencies for each service
cd user-service && npm install && cd ..
cd session-service && npm install && cd ..
cd chat-service && npm install && cd ..
cd payment-service && npm install && cd ..
cd ai-service && npm install && cd ..
cd feedback-service && npm install && cd ..
```

3. Start all services using Docker Compose:

```bash
docker-compose up -d
```

This will start:

- MongoDB database on port 27017
- User Service on port 3001
- Session Service on port 3002
- Chat Service on port 3003
- Payment Service on port 3004
- AI Service on port 3005
- Feedback Service on port 3006

### Development

To run services individually in development mode:

```bash
# User Service
cd user-service && npm run dev

# Session Service
cd session-service && npm run dev

# Chat Service
cd chat-service && npm run dev

# Payment Service
cd payment-service && npm run dev

# AI Service
cd ai-service && npm run dev

# Feedback Service
cd feedback-service && npm run dev
```

## API Endpoints

### User Service (Port 3001)

- `POST /api/users` - Create a new user
- `GET /api/users/:userId` - Get user by ID
- `GET /api/users` - Get all users
- `PUT /api/users/:userId` - Update user
- `DELETE /api/users/:userId` - Delete user

### Session Service (Port 3002)

- `POST /api/sessions` - Create a new session
- `GET /api/sessions/:sessionId` - Get session by ID
- `GET /api/sessions/user/:userId` - Get sessions by user
- `GET /api/sessions/listener/:listenerId` - Get sessions by listener
- `GET /api/sessions` - Get all sessions
- `PUT /api/sessions/:sessionId` - Update session
- `DELETE /api/sessions/:sessionId` - Delete session

### Chat Service (Port 3003)

- `POST /api/messages` - Create a new message
- `GET /api/messages/message/:messageId` - Get message by ID
- `GET /api/messages/session/:sessionId` - Get messages by session
- `GET /api/messages/sender/:senderId` - Get messages by sender
- `GET /api/messages` - Get all messages
- `PUT /api/messages/:messageId` - Update message
- `DELETE /api/messages/:messageId` - Delete message
- `DELETE /api/messages/session/:sessionId` - Delete messages by session

### Payment Service (Port 3004)

- `POST /api/payments` - Create a new payment
- `GET /api/payments/:paymentId` - Get payment by ID
- `GET /api/payments/user/:userId` - Get payments by user
- `GET /api/payments/session/:sessionId` - Get payments by session
- `GET /api/payments/status/:status` - Get payments by status
- `GET /api/payments` - Get all payments
- `PUT /api/payments/:paymentId` - Update payment
- `DELETE /api/payments/:paymentId` - Delete payment

### AI Service (Port 3005)

- `POST /api/interactions` - Create a new AI interaction
- `GET /api/interactions/:interactionId` - Get interaction by ID
- `GET /api/interactions/user/:userId` - Get interactions by user
- `GET /api/interactions/date-range/:startDate/:endDate` - Get interactions by date range
- `GET /api/interactions` - Get all interactions
- `PUT /api/interactions/:interactionId` - Update interaction
- `DELETE /api/interactions/:interactionId` - Delete interaction
- `DELETE /api/interactions/user/:userId` - Delete interactions by user

### Feedback Service (Port 3006)

- `POST /api/feedback` - Create a new feedback
- `GET /api/feedback/:feedbackId` - Get feedback by ID
- `GET /api/feedback/user/:userId` - Get feedback by user
- `GET /api/feedback/session/:sessionId` - Get feedback by session
- `GET /api/feedback/rating/:rating` - Get feedback by rating
- `GET /api/feedback/stats/average` - Get average rating
- `GET /api/feedback` - Get all feedback
- `PUT /api/feedback/:feedbackId` - Update feedback
- `DELETE /api/feedback/:feedbackId` - Delete feedback

## Health Checks

All services provide health check endpoints:

- `GET /health` - Returns service status and timestamp

## Environment Variables

Each service uses the following environment variables:

- `MONGODB_URI` - MongoDB connection string (default: `mongodb://localhost:27017/moodlift`)
- `PORT` - Service port number

## Database Indexes

The following indexes are created for optimal performance:

### Users Collection

- `userId` (unique)
- `email` (unique)

### Sessions Collection

- `sessionId` (unique)
- `userId`
- `listenerId`

### ChatMessages Collection

- `sessionId`
- `messageId` (unique)
- `senderId`
- Compound index: `{ sessionId: 1, timestamp: 1 }`

### Payments Collection

- `paymentId` (unique)
- `userId`
- `sessionId`

### AI_Interactions Collection

- `interactionId` (unique)
- `userId`
- Compound index: `{ userId: 1, timestamp: -1 }`

### Feedback Collection

- `feedbackId` (unique)
- `userId`
- `sessionId`

## Error Handling

All services include comprehensive error handling with:

- Input validation
- Database error handling
- HTTP status codes
- Error logging
- Graceful shutdown

## Security Features

- Rate limiting (100 requests per 15 minutes per IP)
- Helmet.js for security headers
- CORS configuration
- Input sanitization
- Password hashing with bcrypt

## Monitoring

Each service includes:

- Request logging with Morgan
- Error logging
- Health check endpoints
- Graceful shutdown handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
