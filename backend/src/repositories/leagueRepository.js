import { query, getClient } from '../config/postgres.js';

export async function createLeague({ name, joinCode, createdBy, creatorDisplayName }) {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Create league
    const leagueResult = await client.query(
      `INSERT INTO leagues (name, join_code, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, name, join_code, created_by, created_at`,
      [name.trim(), joinCode.toUpperCase(), createdBy]
    );

    const league = leagueResult.rows[0];

    // Add creator as first member
    await client.query(
      `INSERT INTO league_members (league_id, user_id, display_name, total_points, event_scores)
       VALUES ($1, $2, $3, 0, '{}'::jsonb)`,
      [league.id, createdBy, creatorDisplayName]
    );

    await client.query('COMMIT');

    return league;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function findLeagueByJoinCode(joinCode) {
  const result = await query(
    `SELECT id, name, join_code, created_by, created_at
     FROM leagues WHERE join_code = $1`,
    [joinCode.toUpperCase()]
  );

  return result.rows[0] || null;
}

export async function findLeagueById(leagueId) {
  const result = await query(
    `SELECT
      l.id, l.name, l.join_code, l.created_by, l.created_at,
      json_build_object(
        'id', u.id,
        'displayName', u.display_name,
        'email', u.email
      ) as created_by_user
     FROM leagues l
     JOIN users u ON u.id = l.created_by
     WHERE l.id = $1`,
    [leagueId]
  );

  return result.rows[0] || null;
}

export async function getLeagueWithMembers(leagueId) {
  const league = await findLeagueById(leagueId);
  if (!league) return null;

  const membersResult = await query(
    `SELECT
      lm.id, lm.user_id, lm.display_name, lm.total_points,
      lm.event_scores, lm.joined_at,
      json_build_object(
        'id', u.id,
        'displayName', u.display_name,
        'email', u.email
      ) as user
     FROM league_members lm
     JOIN users u ON u.id = lm.user_id
     WHERE lm.league_id = $1
     ORDER BY lm.total_points DESC`,
    [leagueId]
  );

  league.members = membersResult.rows;
  return league;
}

export async function getUserLeagues(userId) {
  const result = await query(
    `SELECT
      l.id, l.name, l.join_code, l.created_by, l.created_at,
      json_build_object(
        'id', u.id,
        'displayName', u.display_name,
        'email', u.email
      ) as created_by_user
     FROM leagues l
     JOIN league_members lm ON lm.league_id = l.id
     JOIN users u ON u.id = l.created_by
     WHERE lm.user_id = $1
     ORDER BY l.created_at DESC`,
    [userId]
  );

  return result.rows;
}

export async function isUserMemberOfLeague(userId, leagueId) {
  const result = await query(
    `SELECT id FROM league_members
     WHERE user_id = $1 AND league_id = $2`,
    [userId, leagueId]
  );

  return result.rows.length > 0;
}

export async function addUserToLeague({ leagueId, userId, displayName }) {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Check if already member
    const checkResult = await client.query(
      `SELECT id FROM league_members WHERE league_id = $1 AND user_id = $2`,
      [leagueId, userId]
    );

    if (checkResult.rows.length > 0) {
      throw new Error('User is already a member of this league');
    }

    // Add member
    const result = await client.query(
      `INSERT INTO league_members (league_id, user_id, display_name, total_points, event_scores)
       VALUES ($1, $2, $3, 0, '{}'::jsonb)
       RETURNING id, league_id, user_id, display_name, total_points, event_scores, joined_at`,
      [leagueId, userId, displayName]
    );

    await client.query('COMMIT');

    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getLeagueStandings(leagueId) {
  const result = await query(
    `SELECT
      lm.user_id as "userId",
      lm.display_name as "displayName",
      lm.total_points as "totalPoints",
      lm.event_scores as "eventScores",
      lm.joined_at as "joinedAt"
     FROM league_members lm
     WHERE lm.league_id = $1
     ORDER BY lm.total_points DESC`,
    [leagueId]
  );

  return result.rows;
}

export async function updateMemberEventScore({ leagueId, userId, eventId, scoreData }) {
  const result = await query(
    `UPDATE league_members
     SET
       event_scores = event_scores || jsonb_build_object($4, $5),
       total_points = total_points + $6
     WHERE league_id = $1 AND user_id = $2
       AND NOT (event_scores ? $4 AND (event_scores->$4->>'scored')::boolean = true)
     RETURNING id`,
    [
      leagueId,
      userId,
      eventId,
      eventId,
      JSON.stringify(scoreData),
      scoreData.points
    ]
  );

  return result.rowCount > 0;
}

export async function getGlobalLeaderboard(limit = 100) {
  const result = await query(
    `SELECT
      u.id as "userId",
      u.display_name as "displayName",
      SUM(lm.total_points) as "totalScore",
      COUNT(DISTINCT lm.league_id) as leagues
     FROM users u
     JOIN league_members lm ON lm.user_id = u.id
     GROUP BY u.id, u.display_name
     ORDER BY "totalScore" DESC
     LIMIT $1`,
    [limit]
  );

  return result.rows;
}
