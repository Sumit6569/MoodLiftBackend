# 🐳 Docker Quick Start

## Start All Services

```bash
cd MoodLiftBackend
docker-compose up -d
```

## View Logs

```bash
docker-compose logs -f
```

## Stop All Services

```bash
docker-compose down
```

## Rebuild and Start

```bash
docker-compose up -d --build
```

## Service URLs (Local)

- user-service: http://localhost:3001
- session-service: http://localhost:3002
- chat-service: http://localhost:3003
- payment-service: http://localhost:3004
- ai-service: http://localhost:3005
- feedback-service: http://localhost:3006

## Frontend Configuration

Set in `mood-lift-support/.env`:

```env
VITE_ENV=local
```
