/**
 * Reset: Wipes all data from every table, preserving schema and migrations.
 * Run before reseed.js.
 *
 *   node src/db/seeds/reset.js
 */

import dotenv from 'dotenv';
import { query, connectPostgres } from '../../config/postgres.js';

dotenv.config();

async function reset() {
  try {
    await connectPostgres();
    console.log('Connected. Wiping all data...\n');

    await query(`
      TRUNCATE follows, pick_choices, picks, matches, events,
               league_members, leagues, users
      RESTART IDENTITY CASCADE
    `);

    console.log('✓ All data tables cleared (schema and migrations preserved)');
    console.log('  Wiped: users, leagues, league_members, events, matches, picks, pick_choices, follows');
    console.log('\nDone. Run reseed.js to repopulate.');
    process.exit(0);
  } catch (err) {
    console.error('Reset failed:', err);
    process.exit(1);
  }
}

reset();
