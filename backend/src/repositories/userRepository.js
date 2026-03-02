import { query } from '../config/postgres.js';
import { hashPassword, comparePassword } from '../utils/password.js';

export async function createUser({ email, password, displayName, isAdmin = false }) {
  const hashedPassword = await hashPassword(password);

  const result = await query(
    `INSERT INTO users (email, password, display_name, is_admin)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, display_name, is_admin, created_at`,
    [email.toLowerCase(), hashedPassword, displayName.trim(), isAdmin]
  );

  return result.rows[0];
}

export async function findUserByEmail(email, includePassword = false) {
  const fields = includePassword
    ? 'id, email, password, display_name, is_admin, created_at'
    : 'id, email, display_name, is_admin, created_at';

  const result = await query(
    `SELECT ${fields} FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );

  return result.rows[0] || null;
}

export async function findUserById(id, includePassword = false) {
  const fields = includePassword
    ? 'id, email, password, display_name, is_admin, created_at'
    : 'id, email, display_name, is_admin, created_at';

  const result = await query(
    `SELECT ${fields} FROM users WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

export async function getUserWithLeagues(userId) {
  const result = await query(
    `SELECT
      u.id, u.email, u.display_name, u.is_admin, u.created_at,
      COALESCE(
        json_agg(
          json_build_object(
            'id', l.id,
            'name', l.name,
            'joinCode', l.join_code
          )
        ) FILTER (WHERE l.id IS NOT NULL),
        '[]'
      ) as leagues
    FROM users u
    LEFT JOIN league_members lm ON lm.user_id = u.id
    LEFT JOIN leagues l ON l.id = lm.league_id
    WHERE u.id = $1
    GROUP BY u.id`,
    [userId]
  );

  return result.rows[0] || null;
}

export async function verifyPassword(userId, candidatePassword) {
  const user = await findUserById(userId, true);
  if (!user) return false;
  return await comparePassword(candidatePassword, user.password);
}

export async function getUserStats(userId) {
  const result = await query(`
    SELECT id, display_name, total_score, events_played,
           COALESCE(avg_per_event, 0) as avg_per_event, global_rank
    FROM (
      SELECT u.id, u.display_name,
        COALESCE(SUM(p.points_earned), 0) as total_score,
        COUNT(p.id) as events_played,
        COALESCE(AVG(p.points_earned), 0) as avg_per_event,
        RANK() OVER (ORDER BY COALESCE(SUM(p.points_earned), 0) DESC) as global_rank
      FROM users u
      LEFT JOIN picks p ON p.user_id = u.id AND p.points_earned IS NOT NULL
      GROUP BY u.id, u.display_name
    ) ranked
    WHERE id = $1
  `, [userId]);
  return result.rows[0] || null;
}

export async function getUserHistory(userId) {
  const result = await query(`
    SELECT e.id as event_id, e.name as event_name, e.brand, e.date,
           p.points_earned, p.correct_picks,
           (SELECT COUNT(*) FROM matches m WHERE m.event_id = e.id) as total_matches
    FROM picks p
    JOIN events e ON e.id = p.event_id
    WHERE p.user_id = $1 AND p.points_earned IS NOT NULL
    ORDER BY e.date DESC
  `, [userId]);
  return result.rows;
}

export async function updateDisplayName(userId, displayName) {
  const result = await query(
    `UPDATE users SET display_name = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, email, display_name, is_admin, created_at`,
    [displayName.trim(), userId]
  );
  return result.rows[0] || null;
}

export async function updatePassword(userId, hashedPassword) {
  await query(
    `UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`,
    [hashedPassword, userId]
  );
}

export async function setPasswordResetToken(userId, hashedToken, expiresAt) {
  await query(
    `UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3`,
    [hashedToken, expiresAt, userId]
  );
}

export async function findUserByResetToken(hashedToken) {
  const result = await query(
    `SELECT id, email, display_name, is_admin, created_at
     FROM users
     WHERE password_reset_token = $1
       AND password_reset_expires > NOW()`,
    [hashedToken]
  );
  return result.rows[0] || null;
}

export async function clearPasswordResetToken(userId) {
  await query(
    `UPDATE users SET password_reset_token = NULL, password_reset_expires = NULL WHERE id = $1`,
    [userId]
  );
}

export function toPublicJSON(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    isAdmin: user.is_admin,
    leagues: user.leagues || [],
    createdAt: user.created_at
  };
}
