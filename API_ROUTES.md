# MoodLift Backend API Routes Documentation

## Service Ports (Local Development)

- **Gateway**: http://localhost:3000
- **User Service**: http://localhost:3001
- **Session Service**: http://localhost:3002
- **Chat Service**: http://localhost:3003
- **Payment Service**: http://localhost:3004
- **AI Service**: http://localhost:3005
- **Feedback Service**: http://localhost:3006

---

## 🔐 User Service (Port 3001)

### Authentication Routes (`/api/v1/auth`)

```
POST   /api/v1/auth/register          - Register new user/listener
POST   /api/v1/auth/login            - Login user
GET    /api/v1/auth/verify-token     - Verify JWT token
GET    /api/v1/auth/verify-email/:token - Verify email with token
POST   /api/v1/auth/forgot-password  - Request password reset
POST   /api/v1/auth/reset-password/:token - Reset password with token
```

**Example Registration:**

```json
POST http://localhost:3001/api/v1/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}

// For listener registration, add:
{
  "fullName": "Dr. Sarah Johnson",
  "email": "sarah@example.com",
  "password": "password123",
  "role": "listener",
  "bio": "Licensed therapist with 10 years experience",
  "expertise": ["Anxiety", "Depression", "Stress Management"],
  "hourlyRate": 85
}
```

**Example Login:**

```json
POST http://localhost:3001/api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### User Management Routes (`/api/v1/users`)

```
GET    /api/v1/users                 - Get all users
GET    /api/v1/users/:userId         - Get user by ID
POST   /api/v1/users                 - Create new user
PATCH  /api/v1/users/:userId         - Update user
DELETE /api/v1/users/:userId         - Delete user
```

### Listener Routes (`/api/v1/listeners`)

```
GET    /api/v1/listeners/approved    - Get approved listeners (PUBLIC)
GET    /api/v1/listeners/pending     - Get pending listeners (ADMIN)
POST   /api/v1/listeners/:userId/approve - Approve listener (ADMIN)
POST   /api/v1/listeners/:userId/reject  - Reject listener (ADMIN)
PUT    /api/v1/listeners/:userId/profile - Update listener profile
```

### Health Check

```
GET    /api/health                   - Service health status
```

---

## 📅 Session Service (Port 3002)

### Session Routes (`/api/v1/sessions`)

```
POST   /api/v1/sessions              - Create new session
GET    /api/v1/sessions              - Get all sessions
GET    /api/v1/sessions/:sessionId   - Get session by ID
GET    /api/v1/sessions/user/:userId - Get sessions by user ID
GET    /api/v1/sessions/listener/:listenerId - Get sessions by listener ID
PUT    /api/v1/sessions/:sessionId   - Update session
DELETE /api/v1/sessions/:sessionId   - Delete session
```

**Example Session Creation:**

```json
POST http://localhost:3002/api/v1/sessions
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "userId": "user_123",
  "listenerId": "listener_456",
  "sessionType": "video",
  "scheduledTime": "2025-10-11T14:00:00.000Z",
  "duration": 60,
  "notes": "Initial therapy session"
}
```

---

## 💬 Chat Service (Port 3003)

### Chat Routes (`/api/v1/chat`)

```
POST   /api/v1/chat                  - Send chat message
GET    /api/v1/chat                  - Get all messages
GET    /api/v1/chat/:messageId       - Get message by ID
GET    /api/v1/chat/session/:sessionId - Get messages by session
GET    /api/v1/chat/user/:userId     - Get messages by user
PUT    /api/v1/chat/:messageId       - Update message
DELETE /api/v1/chat/:messageId       - Delete message
```

**Example Chat Message:**

```json
POST http://localhost:3003/api/v1/chat
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "sessionId": "session_789",
  "senderId": "user_123",
  "message": "Hello, I'm feeling anxious today",
  "messageType": "text"
}
```

---

## 💳 Payment Service (Port 3004)

### Payment Routes (`/api/v1/payments`)

```
POST   /api/v1/payments              - Create payment
GET    /api/v1/payments              - Get all payments
GET    /api/v1/payments/:paymentId   - Get payment by ID
GET    /api/v1/payments/user/:userId - Get payments by user
GET    /api/v1/payments/session/:sessionId - Get payments by session
GET    /api/v1/payments/status/:status - Get payments by status
PUT    /api/v1/payments/:paymentId   - Update payment
DELETE /api/v1/payments/:paymentId   - Delete payment
```

**Example Payment:**

```json
POST http://localhost:3004/api/v1/payments
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "userId": "user_123",
  "sessionId": "session_789",
  "amount": 85.00,
  "currency": "USD",
  "paymentMethod": "credit_card",
  "paymentProvider": "stripe"
}
```

---

## 🤖 AI Service (Port 3005)

### AI Routes (`/api/v1/ai`)

```
POST   /api/v1/ai/chat              - AI chat interaction
GET    /api/v1/ai                   - Get all AI interactions
GET    /api/v1/ai/:interactionId   - Get AI interaction by ID
GET    /api/v1/ai/user/:userId     - Get AI interactions by user
PUT    /api/v1/ai/:interactionId   - Update AI interaction
DELETE /api/v1/ai/:interactionId   - Delete AI interaction
```

**Example AI Chat:**

```json
POST http://localhost:3005/api/v1/ai/chat
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "userId": "user_123",
  "message": "I'm feeling overwhelmed with work stress",
  "context": "anxiety_support"
}
```

---

## 📝 Feedback Service (Port 3006)

### Feedback Routes (`/api/v1/feedback`)

```
POST   /api/v1/feedback              - Submit feedback
GET    /api/v1/feedback              - Get all feedback
GET    /api/v1/feedback/:feedbackId - Get feedback by ID
GET    /api/v1/feedback/user/:userId - Get feedback by user
GET    /api/v1/feedback/session/:sessionId - Get feedback by session
PUT    /api/v1/feedback/:feedbackId - Update feedback
DELETE /api/v1/feedback/:feedbackId - Delete feedback
```

**Example Feedback:**

```json
POST http://localhost:3006/api/v1/feedback
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "userId": "user_123",
  "sessionId": "session_789",
  "listenerId": "listener_456",
  "rating": 5,
  "comment": "Great session, very helpful!",
  "feedbackType": "session_rating"
}
```

---

## 🌐 Gateway Routes (Port 3000)

The gateway acts as a reverse proxy and routes requests to appropriate services:

```
/auth/*      -> User Service (localhost:3001)
/users/*     -> User Service (localhost:3001)
/listeners/* -> User Service (localhost:3001)
/sessions/*  -> Session Service (localhost:3002)
/chat/*      -> Chat Service (localhost:3003)
/payment/*   -> Payment Service (localhost:3004)
/ai/*        -> AI Service (localhost:3005)
/feedback/*  -> Feedback Service (localhost:3006)
/health      -> Gateway health check
```

**Example using Gateway:**

```bash
# Instead of: http://localhost:3001/api/v1/auth/login
# Use:        http://localhost:3000/auth/login

curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

---

## 🔑 Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

**Public endpoints (no auth required):**

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/verify-email/:token`
- `POST /auth/forgot-password`
- `POST /auth/reset-password/:token`
- `GET /listeners/approved`
- `GET /health` (all services)

---

## 📊 Response Format

All endpoints return responses in this format:

**Success:**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "token": "jwt_token" // (for auth endpoints)
}
```

**Error:**

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"] // (for validation errors)
}
```

---

## 🚀 Quick Test Commands

```bash
# Test user service health
curl http://localhost:3001/api/health

# Register a user
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","password":"password123","role":"user"}'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get approved listeners
curl http://localhost:3001/api/v1/listeners/approved
```
