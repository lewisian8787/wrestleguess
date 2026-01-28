import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

console.log('=== Debug PostgreSQL Connection ===');
console.log('POSTGRES_URI from env:', process.env.POSTGRES_URI);
console.log('POSTGRES_URI length:', process.env.POSTGRES_URI?.length);
console.log('POSTGRES_URI (JSON):', JSON.stringify(process.env.POSTGRES_URI));

// Try to parse the connection string manually
if (process.env.POSTGRES_URI) {
  const url = process.env.POSTGRES_URI;
  console.log('\n=== Parsing Connection String ===');

  try {
    const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (match) {
      console.log('Username:', match[1]);
      console.log('Password (raw):', match[2]);
      console.log('Password (decoded):', decodeURIComponent(match[2]));
      console.log('Host:', match[3]);
      console.log('Port:', match[4]);
      console.log('Database:', match[5]);
    }
  } catch (e) {
    console.error('Error parsing:', e);
  }
}

// Try connection with pg
console.log('\n=== Testing Connection ===');
const pool = new pg.Pool({
  connectionString: process.env.POSTGRES_URI,
});

try {
  const client = await pool.connect();
  console.log('✓ Connection successful!');
  console.log('Connected to:', client.host);
  client.release();
  await pool.end();
  process.exit(0);
} catch (error) {
  console.error('✗ Connection failed:', error.message);
  console.error('Error details:', error);
  process.exit(1);
}
