import { query, getClient } from '../config/postgres.js';

/**
 * Create or update a pick with choices
 * @param {Object} pickData - { eventId, userId, choices, totalConfidence }
 * @returns {Promise<string>} Pick ID
 */
export async function createOrUpdatePick({ eventId, userId, choices, totalConfidence }) {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Upsert pick
    const pickResult = await client.query(`
      INSERT INTO picks (event_id, user_id, total_confidence, version, submitted_at)
      VALUES ($1, $2, $3, 2, CURRENT_TIMESTAMP)
      ON CONFLICT (event_id, user_id)
      DO UPDATE SET
        total_confidence = EXCLUDED.total_confidence,
        submitted_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `, [eventId, userId, totalConfidence]);

    const pickId = pickResult.rows[0].id;

    // Delete old choices
    await client.query('DELETE FROM pick_choices WHERE pick_id = $1', [pickId]);

    // Insert new choices
    for (const [matchId, choice] of Object.entries(choices)) {
      await client.query(`
        INSERT INTO pick_choices (pick_id, match_id, winner, confidence)
        VALUES ($1, $2, $3, $4)
      `, [pickId, matchId, choice.winner, choice.confidence]);
    }

    await client.query('COMMIT');
    return pickId;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Find pick by ID
 * @param {string} pickId - Pick UUID
 * @param {boolean} includeChoices - Include choices in response
 * @returns {Promise<Object|null>} Pick object or null
 */
export async function findPickById(pickId, includeChoices = true) {
  if (!includeChoices) {
    const result = await query(`
      SELECT
        id, event_id as "eventId", user_id as "userId",
        total_confidence as "totalConfidence", version,
        submitted_at as "submittedAt", created_at as "createdAt", updated_at as "updatedAt"
      FROM picks
      WHERE id = $1
    `, [pickId]);

    return result.rows[0] || null;
  }

  const result = await query(`
    SELECT
      p.id, p.event_id as "eventId", p.user_id as "userId",
      p.total_confidence as "totalConfidence", p.version,
      p.submitted_at as "submittedAt", p.created_at as "createdAt", p.updated_at as "updatedAt",
      COALESCE(
        json_agg(
          json_build_object(
            'matchId', pc.match_id,
            'winner', pc.winner,
            'confidence', pc.confidence
          )
        ) FILTER (WHERE pc.id IS NOT NULL),
        '[]'
      ) as choices
    FROM picks p
    LEFT JOIN pick_choices pc ON pc.pick_id = p.id
    WHERE p.id = $1
    GROUP BY p.id
  `, [pickId]);

  return result.rows[0] || null;
}

/**
 * Find pick by event and user
 * @param {string} eventId - Event UUID
 * @param {string} userId - User UUID
 * @returns {Promise<Object|null>} Pick object or null
 */
export async function findPickByEventAndUser(eventId, userId) {
  const result = await query(`
    SELECT
      p.id, p.event_id as "eventId", p.user_id as "userId",
      p.total_confidence as "totalConfidence", p.version,
      p.submitted_at as "submittedAt", p.created_at as "createdAt", p.updated_at as "updatedAt",
      COALESCE(
        json_agg(
          json_build_object(
            'matchId', pc.match_id,
            'winner', pc.winner,
            'confidence', pc.confidence
          )
        ) FILTER (WHERE pc.id IS NOT NULL),
        '[]'
      ) as choices
    FROM picks p
    LEFT JOIN pick_choices pc ON pc.pick_id = p.id
    WHERE p.event_id = $1 AND p.user_id = $2
    GROUP BY p.id
  `, [eventId, userId]);

  return result.rows[0] || null;
}

/**
 * Find all picks for an event (for scoring)
 * @param {string} eventId - Event UUID
 * @returns {Promise<Array>} Array of picks with choices
 */
export async function findPicksByEvent(eventId) {
  const result = await query(`
    SELECT
      p.id, p.event_id as "eventId", p.user_id as "userId",
      p.total_confidence as "totalConfidence", p.version,
      p.submitted_at as "submittedAt", p.created_at as "createdAt", p.updated_at as "updatedAt",
      COALESCE(
        json_agg(
          json_build_object(
            'matchId', pc.match_id,
            'winner', pc.winner,
            'confidence', pc.confidence
          )
        ) FILTER (WHERE pc.id IS NOT NULL),
        '[]'
      ) as choices
    FROM picks p
    LEFT JOIN pick_choices pc ON pc.pick_id = p.id
    WHERE p.event_id = $1
    GROUP BY p.id
  `, [eventId]);

  return result.rows;
}

/**
 * Find all picks for a user
 * @param {string} userId - User UUID
 * @returns {Promise<Array>} Array of picks with choices
 */
export async function findPicksByUser(userId) {
  const result = await query(`
    SELECT
      p.id, p.event_id as "eventId", p.user_id as "userId",
      p.total_confidence as "totalConfidence", p.version,
      p.submitted_at as "submittedAt", p.created_at as "createdAt", p.updated_at as "updatedAt",
      COALESCE(
        json_agg(
          json_build_object(
            'matchId', pc.match_id,
            'winner', pc.winner,
            'confidence', pc.confidence
          )
        ) FILTER (WHERE pc.id IS NOT NULL),
        '[]'
      ) as choices
    FROM picks p
    LEFT JOIN pick_choices pc ON pc.pick_id = p.id
    WHERE p.user_id = $1
    GROUP BY p.id
    ORDER BY p.submitted_at DESC
  `, [userId]);

  return result.rows;
}

/**
 * Delete a pick by event and user
 * @param {string} eventId - Event UUID
 * @param {string} userId - User UUID
 * @returns {Promise<void>}
 */
export async function deletePickByEventAndUser(eventId, userId) {
  await query(`
    DELETE FROM picks
    WHERE event_id = $1 AND user_id = $2
  `, [eventId, userId]);
}

/**
 * Delete a pick by ID (CASCADE deletes pick_choices)
 * @param {string} pickId - Pick UUID
 * @returns {Promise<void>}
 */
export async function deletePick(pickId) {
  await query('DELETE FROM picks WHERE id = $1', [pickId]);
}
