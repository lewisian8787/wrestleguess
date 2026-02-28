import { query } from '../../config/postgres.js';

export async function up() {
  await query(`
    CREATE TABLE IF NOT EXISTS follows (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(follower_id, following_id),
      CHECK (follower_id != following_id)
    );
    CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
    CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
  `);
}

export async function down() {
  await query(`DROP TABLE IF EXISTS follows CASCADE;`);
}
