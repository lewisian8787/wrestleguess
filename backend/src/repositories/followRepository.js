import { query } from '../config/postgres.js';

export async function followUser(followerId, followingId) {
  await query(
    `INSERT INTO follows (follower_id, following_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [followerId, followingId]
  );
}

export async function unfollowUser(followerId, followingId) {
  await query(
    `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`,
    [followerId, followingId]
  );
}

export async function isFollowing(followerId, followingId) {
  const result = await query(
    `SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2`,
    [followerId, followingId]
  );
  return result.rows.length > 0;
}

export async function getFollowing(followerId) {
  const result = await query(`
    SELECT
      u.id as user_id,
      u.display_name,
      COALESCE(SUM(p.points_earned), 0) as total_score,
      COUNT(p.id) as events_played,
      COALESCE(AVG(p.points_earned), 0) as avg_per_event,
      ranked.global_rank
    FROM follows f
    JOIN users u ON u.id = f.following_id
    LEFT JOIN picks p ON p.user_id = u.id AND p.points_earned IS NOT NULL
    LEFT JOIN (
      SELECT u2.id,
        RANK() OVER (ORDER BY COALESCE(SUM(p2.points_earned), 0) DESC) as global_rank
      FROM users u2
      LEFT JOIN picks p2 ON p2.user_id = u2.id AND p2.points_earned IS NOT NULL
      GROUP BY u2.id
    ) ranked ON ranked.id = u.id
    WHERE f.follower_id = $1
    GROUP BY u.id, u.display_name, ranked.global_rank
    ORDER BY total_score DESC
  `, [followerId]);
  return result.rows;
}
