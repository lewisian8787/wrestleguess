import { query } from '../config/postgres.js';
import { up as migration001 } from './migrations/001_initial_schema.js';
import { up as migration003 } from './migrations/003_add_events_and_picks.js';
import { up as migration004 } from './migrations/004_add_scoring_to_picks.js';
import { up as migration005 } from './migrations/005_add_follows.js';

const migrations = [
  { id: '001_initial_schema', run: migration001 },
  { id: '003_add_events_and_picks', run: migration003 },
  { id: '004_add_scoring_to_picks', run: migration004 },
  { id: '005_add_follows', run: migration005 },
];

export async function runMigrations() {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id VARCHAR(255) PRIMARY KEY,
      run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  for (const migration of migrations) {
    const { rows } = await query(
      'SELECT id FROM schema_migrations WHERE id = $1',
      [migration.id]
    );

    if (rows.length === 0) {
      console.log(`Running migration: ${migration.id}`);
      await migration.run();
      await query('INSERT INTO schema_migrations (id) VALUES ($1)', [migration.id]);
      console.log(`Migration complete: ${migration.id}`);
    } else {
      console.log(`Skipping migration (already run): ${migration.id}`);
    }
  }
}
