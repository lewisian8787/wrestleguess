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
- ✅ **Currently using Firebase** (to be migrated)

### Backend (Node.js + Express + MongoDB)
- ✅ Complete REST API server
- ✅ MongoDB schemas (User, League, Event, Pick)
- ✅ JWT authentication system
- ✅ User registration & login endpoints
- ✅ League CRUD operations
- ✅ Event management (admin only)
- ✅ Pick submission with validation
- ✅ Automated scoring system
- ✅ Global leaderboard endpoint
- ✅ Docker configuration (docker-compose.yml)
- ✅ Ready for Digital Ocean deployment

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

### Option 1: Test Backend Locally (Recommended First)

1. **Install Docker Desktop:**
   - Download: https://www.docker.com/products/docker-desktop/
   - Install and start Docker

2. **Start the backend:**
   ```bash
   docker compose up -d
   ```

3. **Test the API:**
   ```bash
   curl http://localhost:5000/api/health
   ```

4. **Register a test user and try endpoints**
   - See [BACKEND_SETUP.md](BACKEND_SETUP.md) for full testing guide

### Option 2: Migrate Frontend to Use API

Once backend is tested, update frontend files:

1. **Remove Firebase dependencies:**
   ```bash
   npm uninstall firebase
   ```

2. **Install axios:**
   ```bash
   npm install axios
   ```

3. **Create API client utility:**
   - Create `src/api/client.js`
   - Handle JWT token storage/retrieval
   - Wrap all API calls

4. **Update components:**
   - Replace Firebase calls with API calls
   - Update authentication flow
   - Test each feature incrementally

### Option 3: Deploy to Digital Ocean

After testing locally:

1. **Create Digital Ocean Droplet**
   - Size: Basic $6-12/month
   - OS: Ubuntu 22.04

2. **Install Docker on droplet:**
   ```bash
   ssh root@your-droplet-ip
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

3. **Clone repo & deploy:**
   ```bash
   git clone your-repo
   cd wrestleguess
   docker compose up -d
   ```

4. **Optional: Set up domain & SSL**
   - Point domain to droplet IP
   - Use Let's Encrypt for free SSL

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
