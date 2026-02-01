import { query, getClient } from '../config/postgres.js';

/**
 * Create a new event with matches
 * @param {Object} eventData - { name, brand, date, matches, createdBy }
 * @returns {Promise<Object>} Created event with matches
 */
export async function createEvent({ name, brand = 'Wrestling', date, matches, createdBy }) {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Insert event
    const eventResult = await client.query(`
      INSERT INTO events (name, brand, date, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, brand, date, locked, scored, scored_at, created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
    `, [name, brand, date, createdBy]);

    const event = eventResult.rows[0];

    // Insert matches
    const matchesData = [];
    for (const match of matches) {
      const matchResult = await client.query(`
        INSERT INTO matches (event_id, match_id, match_type, title_match, competitors, winner, multiplier, match_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, match_id as "matchId", match_type as "type", title_match as "titleMatch", competitors, winner, multiplier
      `, [
        event.id,
        match.matchId,
        match.type || match.match_type || 'Singles',
        match.titleMatch || match.title_match || false,
        match.competitors,
        match.winner || null,
        match.multiplier || 1.0,
        match.match_order !== undefined ? match.match_order : matches.indexOf(match)
      ]);

      matchesData.push(matchResult.rows[0]);
    }

    await client.query('COMMIT');

    return {
      ...event,
      matches: matchesData
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Find event by ID
 * @param {string} id - Event UUID
 * @param {boolean} includeMatches - Include matches in response
 * @returns {Promise<Object|null>} Event object or null
 */
export async function findEventById(id, includeMatches = true) {
  if (!includeMatches) {
    const result = await query(`
      SELECT
        id, name, brand, date, locked, scored, scored_at as "scoredAt",
        created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
      FROM events
      WHERE id = $1
    `, [id]);

    return result.rows[0] || null;
  }

  const result = await query(`
    SELECT
      e.id, e.name, e.brand, e.date, e.locked, e.scored, e.scored_at as "scoredAt",
      e.created_by as "createdBy", e.created_at as "createdAt", e.updated_at as "updatedAt",
      COALESCE(
        json_agg(
          json_build_object(
            'id', m.id,
            'matchId', m.match_id,
            'type', m.match_type,
            'titleMatch', m.title_match,
            'competitors', m.competitors,
            'winner', m.winner,
            'multiplier', m.multiplier
          ) ORDER BY m.match_order
        ) FILTER (WHERE m.id IS NOT NULL),
        '[]'
      ) as matches
    FROM events e
    LEFT JOIN matches m ON m.event_id = e.id
    WHERE e.id = $1
    GROUP BY e.id
  `, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

/**
 * Find all events
 * @param {Object} options - { includeMatches }
 * @returns {Promise<Array>} Array of events
 */
export async function findAllEvents({ includeMatches = true } = {}) {
  if (!includeMatches) {
    const result = await query(`
      SELECT
        id, name, brand, date, locked, scored, scored_at as "scoredAt",
        created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
      FROM events
      ORDER BY date DESC
    `);

    return result.rows;
  }

  const result = await query(`
    SELECT
      e.id, e.name, e.brand, e.date, e.locked, e.scored, e.scored_at as "scoredAt",
      e.created_by as "createdBy", e.created_at as "createdAt", e.updated_at as "updatedAt",
      COALESCE(
        json_agg(
          json_build_object(
            'id', m.id,
            'matchId', m.match_id,
            'type', m.match_type,
            'titleMatch', m.title_match,
            'competitors', m.competitors,
            'winner', m.winner,
            'multiplier', m.multiplier
          ) ORDER BY m.match_order
        ) FILTER (WHERE m.id IS NOT NULL),
        '[]'
      ) as matches
    FROM events e
    LEFT JOIN matches m ON m.event_id = e.id
    GROUP BY e.id
    ORDER BY e.date DESC
  `);

  return result.rows;
}

/**
 * Update event fields
 * @param {string} id - Event UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated event
 */
export async function updateEvent(id, updates) {
  const allowedFields = ['name', 'brand', 'date', 'locked'];
  const setFields = [];
  const values = [];
  let paramCount = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      setFields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  }

  if (setFields.length === 0) {
    return await findEventById(id, false);
  }

  values.push(id);

  const result = await query(`
    UPDATE events
    SET ${setFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCount}
    RETURNING id, name, brand, date, locked, scored, scored_at as "scoredAt",
              created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
  `, values);

  return result.rows[0];
}

/**
 * Update matches for an event
 * @param {string} eventId - Event UUID
 * @param {Array} matches - New matches array
 * @returns {Promise<void>}
 */
export async function updateMatches(eventId, matches) {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Delete existing matches
    await client.query('DELETE FROM matches WHERE event_id = $1', [eventId]);

    // Insert new matches
    for (const match of matches) {
      await client.query(`
        INSERT INTO matches (event_id, match_id, match_type, title_match, competitors, winner, multiplier, match_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        eventId,
        match.matchId,
        match.type || match.match_type || 'Singles',
        match.titleMatch || match.title_match || false,
        match.competitors,
        match.winner || null,
        match.multiplier || 1.0,
        match.match_order !== undefined ? match.match_order : matches.indexOf(match)
      ]);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Set winner for a specific match
 * @param {string} eventId - Event UUID
 * @param {string} matchId - Match ID
 * @param {string} winner - Winner name
 * @returns {Promise<void>}
 */
export async function setMatchWinner(eventId, matchId, winner) {
  await query(`
    UPDATE matches
    SET winner = $3
    WHERE event_id = $1 AND match_id = $2
  `, [eventId, matchId, winner]);
}

/**
 * Lock an event
 * @param {string} eventId - Event UUID
 * @returns {Promise<void>}
 */
export async function lockEvent(eventId) {
  await query(`
    UPDATE events
    SET locked = true, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `, [eventId]);
}

/**
 * Score an event
 * @param {string} eventId - Event UUID
 * @returns {Promise<void>}
 */
export async function scoreEvent(eventId) {
  await query(`
    UPDATE events
    SET scored = true, scored_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `, [eventId]);
}

/**
 * Delete an event (CASCADE deletes matches, picks, pick_choices)
 * @param {string} eventId - Event UUID
 * @returns {Promise<void>}
 */
export async function deleteEvent(eventId) {
  await query('DELETE FROM events WHERE id = $1', [eventId]);
}

/**
 * Check if event is locked
 * @param {string} eventId - Event UUID
 * @returns {Promise<boolean>}
 */
export async function isEventLocked(eventId) {
  const result = await query('SELECT locked FROM events WHERE id = $1', [eventId]);
  return result.rows[0]?.locked || false;
}

/**
 * Check if event is scored
 * @param {string} eventId - Event UUID
 * @returns {Promise<boolean>}
 */
export async function isEventScored(eventId) {
  const result = await query('SELECT scored FROM events WHERE id = $1', [eventId]);
  return result.rows[0]?.scored || false;
}
