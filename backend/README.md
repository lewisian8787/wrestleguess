# WrestleGuess Backend API

Node.js + Express + MongoDB backend for WrestleGuess wrestling prediction app.

## Features

- User authentication with JWT
- League management (create, join, standings)
- Event management (CRUD operations)
- Pick submission with confidence allocation
- Automated scoring system
- Global leaderboard

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Password Hashing**: bcryptjs

## Getting Started

### Prerequisites

- Node.js 18+ or Docker
- MongoDB (local or Docker)

### Local Development (without Docker)

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration

4. Start MongoDB locally

5. Run the server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Docker Development

From the project root:

```bash
docker-compose up
```

This will start both MongoDB and the backend API.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Leagues
- `POST /api/leagues` - Create league (protected)
- `POST /api/leagues/join` - Join league by code (protected)
- `GET /api/leagues` - Get user's leagues (protected)
- `GET /api/leagues/:id` - Get league details (protected)
- `GET /api/leagues/:id/standings` - Get league standings (protected)

### Events
- `GET /api/events` - Get all events (protected)
- `GET /api/events/:id` - Get event by ID (protected)
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `POST /api/events/:id/score` - Score event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)

### Picks
- `POST /api/picks` - Submit/update picks (protected)
- `GET /api/picks/event/:eventId` - Get user's picks for event (protected)
- `GET /api/picks/user` - Get all user picks (protected)
- `DELETE /api/picks/event/:eventId` - Delete picks (protected)

### Users
- `GET /api/users/leaderboard` - Get global leaderboard (public)
- `GET /api/users/profile` - Get user profile (protected)

## Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Environment Variables

See `.env.example` for required environment variables.

## Database Schema

### Users
- email, password, displayName, leagues[], isAdmin

### Leagues
- name, joinCode, createdBy, members[]

### Events
- name, brand, date, matches[], locked, scored

### Picks
- event, user, choices (Map), totalConfidence, version

## Admin Setup

To create an admin user, manually update a user document in MongoDB:

```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { isAdmin: true } }
)
```
