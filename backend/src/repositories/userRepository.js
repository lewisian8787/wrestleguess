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
