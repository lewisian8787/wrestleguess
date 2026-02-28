import { query } from '../../config/postgres.js';

export async function up() {
  await query(`
    ALTER TABLE picks
      ADD COLUMN IF NOT EXISTS points_earned DECIMAL(10, 2) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS correct_picks INTEGER DEFAULT NULL;

    CREATE INDEX IF NOT EXISTS idx_picks_points_earned ON picks(points_earned DESC NULLS LAST);
  `);

  console.log('Added points_earned and correct_picks columns to picks table');
}

export async function down() {
  await query(`
    ALTER TABLE picks
      DROP COLUMN IF EXISTS points_earned,
      DROP COLUMN IF EXISTS correct_picks;
  `);
  console.log('Removed points_earned and correct_picks columns from picks table');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const action = process.argv[2] || 'up';

  if (action === 'up') {
    await up();
  } else if (action === 'down') {
    await down();
  }

  process.exit(0);
}
