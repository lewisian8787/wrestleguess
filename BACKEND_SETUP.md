# Backend Setup & Testing Guide

## Prerequisites

Install Docker Desktop for Mac:
https://www.docker.com/products/docker-desktop/

## Quick Start with Docker

1. **Start the backend + MongoDB:**
```bash
docker compose up -d
```

2. **Check if services are running:**
```bash
docker compose ps
```

You should see:
- `wrestleguess-db` (MongoDB) on port 27017
- `wrestleguess-backend` (API) on port 5000

3. **Test the API health endpoint:**
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "WrestleGuess API is running",
  "timestamp": "..."
}
```

## Testing Authentication

### Register a new user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "displayName": "Test User"
  }'
```

Response includes a JWT token:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type": application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test protected route:
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Testing League Creation

```bash
curl -X POST http://localhost:5000/api/leagues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test League"
  }'
```

Response includes a `joinCode` (e.g., "ABC123")

## View Logs

```bash
# View all logs
docker compose logs

# Follow backend logs
docker compose logs -f backend

# Follow MongoDB logs
docker compose logs -f mongodb
```

## Stop Services

```bash
docker compose down
```

## Troubleshooting

### Port already in use
If port 5000 or 27017 is already in use, edit `docker-compose.yml` to change the port mappings.

### MongoDB connection errors
Make sure MongoDB container is running:
```bash
docker compose ps mongodb
```

### Backend not starting
Check logs:
```bash
docker compose logs backend
```

## Next Steps

Once Docker is running successfully:

1. **Create an admin user** (in MongoDB shell):
```javascript
docker compose exec mongodb mongosh wrestleguess
db.users.updateOne(
  { email: "test@example.com" },
  { $set: { isAdmin: true } }
)
```

2. **Test admin endpoints** (create events, score matches)

3. **Start migrating the frontend** to use this API instead of Firebase
