import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { query } from '../../config/postgres.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

export async function up() {
  const schemaSQL = fs.readFileSync(
    path.join(__dirname, '../schema.sql'),
    'utf8'
  );

  try {
    await query(schemaSQL);
    console.log('Schema created successfully');
  } catch (error) {
    console.error('Error creating schema:', error);
    throw error;
  }
}

export async function down() {
  await query('DROP TABLE IF EXISTS league_members CASCADE');
  await query('DROP TABLE IF EXISTS leagues CASCADE');
  await query('DROP TABLE IF EXISTS users CASCADE');
  await query('DROP FUNCTION IF EXISTS update_updated_at_column CASCADE');
  console.log('Schema dropped successfully');
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
