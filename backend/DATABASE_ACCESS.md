# PostgreSQL Database Access Guide

## Quick Access on VPS

```bash
# SSH into VPS
ssh ian@wrestleguess.com

# Access PostgreSQL
sudo -u postgres psql wrestleguess
```

## Common psql Commands

```sql
-- List all tables
\dt

-- Describe table structure
\d users
\d events
\d matches
\d picks
\d leagues
\d league_members

-- Quit psql
\q
```

## Useful Queries

### View All Users
```sql
SELECT id, email, display_name, is_admin, created_at
FROM users
ORDER BY created_at DESC;
```

### View All Events
```sql
SELECT
  e.id,
  e.name,
  e.brand,
  e.date,
  e.locked,
  e.scored,
  COUNT(m.id) as match_count
FROM events e
LEFT JOIN matches m ON m.event_id = e.id
GROUP BY e.id
ORDER BY e.date DESC;
```

### View Event with Matches
```sql
SELECT
  e.name as event_name,
  m.match_id,
  m.match_type,
  m.title_match,
  m.competitors,
  m.winner,
  m.multiplier
FROM events e
JOIN matches m ON m.event_id = e.id
WHERE e.name = 'Royal Rumble 2026'
ORDER BY m.match_order;
```

### View Picks for an Event
```sql
SELECT
  u.display_name,
  p.submitted_at,
  pc.match_id,
  pc.winner,
  pc.confidence
FROM picks p
JOIN users u ON u.id = p.user_id
JOIN pick_choices pc ON pc.pick_id = p.id
WHERE p.event_id = 'EVENT_UUID_HERE'
ORDER BY u.display_name, pc.match_id;
```

### View League Standings
```sql
SELECT
  u.display_name,
  lm.role,
  lm.total_points,
  lm.events_participated,
  lm.joined_at
FROM league_members lm
JOIN users u ON u.id = lm.user_id
JOIN leagues l ON l.id = lm.league_id
WHERE l.name = 'Test League'
ORDER BY lm.total_points DESC;
```

### View All Leagues
```sql
SELECT
  l.id,
  l.name,
  l.description,
  u.display_name as creator,
  COUNT(lm.user_id) as member_count,
  l.created_at
FROM leagues l
JOIN users u ON u.id = l.created_by
LEFT JOIN league_members lm ON lm.league_id = l.id
GROUP BY l.id, u.display_name
ORDER BY l.created_at DESC;
```

## Backup Database

```bash
# On VPS
sudo -u postgres pg_dump wrestleguess > wrestleguess_backup_$(date +%Y%m%d).sql

# Restore from backup
sudo -u postgres psql wrestleguess < wrestleguess_backup_20260201.sql
```

## Reset Database (DANGEROUS - deletes all data)

```bash
# Drop and recreate database
sudo -u postgres psql <<EOF
DROP DATABASE IF EXISTS wrestleguess;
CREATE DATABASE wrestleguess;
GRANT ALL PRIVILEGES ON DATABASE wrestleguess TO wrestleguess_user;
\c wrestleguess
GRANT ALL PRIVILEGES ON SCHEMA public TO wrestleguess_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO wrestleguess_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO wrestleguess_user;
EOF

# Then run migrations and seeds
cd ~/wrestleguess/backend
node src/db/migrations/001_initial_schema.js
node src/db/migrations/002_add_leagues.js
node src/db/migrations/003_add_events_and_picks.js
node src/db/seeds/001_admin_user.js
node src/db/seeds/002_test_data.js
```
