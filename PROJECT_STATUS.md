# WrestleGuess Project Status

## ✅ Completed

### Frontend (React + Vite)
- ✅ Complete UI redesign with light theme
- ✅ Landing page with simplified hero
- ✅ Public pages: Global Leaderboard, How to Play
- ✅ Authentication pages: Login/Signup
- ✅ User dashboard: League management
- ✅ Events list page
- ✅ Pick submission page with confidence allocation
- ✅ League standings page
- ✅ Admin panel for event management
- ✅ Mobile-responsive design
- ✅ **Migrated to JWT/PostgreSQL API** (Firebase removed)

### Backend (Node.js + Express + PostgreSQL)
- ✅ Complete REST API server
- ✅ PostgreSQL database with proper schema
- ✅ JWT authentication system
- ✅ User registration & login endpoints
- ✅ League CRUD operations
- ✅ Event management (admin only)
- ✅ Pick submission with validation
- ✅ Automated scoring system
- ✅ Global leaderboard endpoint
- ✅ Docker configuration (docker-compose.yml)
- ✅ Ready for deployment

## 📦 Project Structure

```
wrestleguess/
├── src/                          # Frontend (React)
│   ├── assets/
│   ├── models, routes, etc.
│   ├── LandingPage.jsx
│   ├── GlobalLeaderboard.jsx
│   ├── HowToPlay.jsx
│   ├── UserLogin.jsx
│   ├── LeagueGateway.jsx
│   ├── EventsListPage.jsx
│   ├── PickEventPage.jsx
│   ├── StandingsPage.jsx
│   ├── AdminEventPanel.jsx
│   └── ... (other components)
│
├── backend/                      # Backend API (NEW!)
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── League.js
│   │   │   ├── Event.js
│   │   │   └── Pick.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── leagues.js
│   │   │   ├── events.js
│   │   │   ├── picks.js
│   │   │   └── users.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── config/
│   │   │   └── database.js
│   │   └── server.js
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml            # Docker orchestration
├── BACKEND_SETUP.md             # Setup instructions
└── PROJECT_STATUS.md            # This file
```

## 🔄 Next Steps

### Running Locally

1. **Start the backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start the frontend:**
   ```bash
   npm install
   npm run dev
   ```

3. **Test the API:**
   ```bash
   curl http://localhost:5000/api/health
   ```

### Deploy to Production

1. **Set up PostgreSQL database**

2. **Configure environment variables:**
   - `POSTGRES_URI` - PostgreSQL connection string
   - `JWT_SECRET` - Secret key for JWT tokens
   - `VITE_API_URL` - Backend API URL for frontend

3. **Build and deploy:**
   ```bash
   npm run build
   ```

## 🎯 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Leagues
- `POST /api/leagues` - Create league
- `POST /api/leagues/join` - Join by code
- `GET /api/leagues` - Get user's leagues
- `GET /api/leagues/:id/standings` - Get standings

### Events
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (admin)
- `POST /api/events/:id/score` - Score event (admin)

### Picks
- `POST /api/picks` - Submit/update picks
- `GET /api/picks/event/:eventId` - Get picks for event
- `GET /api/picks/user` - Get all user picks

### Users
- `GET /api/users/leaderboard` - Global leaderboard

## 🔐 Environment Variables

Backend requires these env vars (set in docker-compose.yml or .env):

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - Token expiration (e.g., "7d")
- `CORS_ORIGINS` - Allowed origins (frontend URL)
- `PORT` - Server port (default: 5000)

## 📝 Notes

- **Database**: MongoDB stores all data (users, leagues, events, picks)
- **Authentication**: JWT tokens in Authorization header
- **Admin**: Manually set `isAdmin: true` in MongoDB for admin users
- **Scoring**: Automated calculation when admin scores event
- **Frontend**: Still using Firebase until migration is complete

## ⚠️ Important

- Change `JWT_SECRET` in production!
- Use environment variables for sensitive data
- Never commit `.env` files to git
- Test thoroughly before deploying to production
