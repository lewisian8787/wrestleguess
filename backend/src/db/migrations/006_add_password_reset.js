import { query } from '../../config/postgres.js';

export async function up() {
  await query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP DEFAULT NULL;
  `);
  console.log('Password reset columns added to users table');
}

export async function down() {
  await query(`
    ALTER TABLE users
      DROP COLUMN IF EXISTS password_reset_token,
      DROP COLUMN IF EXISTS password_reset_expires;
  `);
  console.log('Password reset columns removed from users table');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const action = process.argv[2] || 'up';
  if (action === 'up') await up();
  else if (action === 'down') await down();
  process.exit(0);
}
