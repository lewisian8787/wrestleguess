/**
 * Seed: Upcoming real events (open for picks, not yet scored)
 *
 * WWE Elimination Chamber 2026
 *   February 28, 2026 — United Center, Chicago, IL
 *   4 matches: Men's Chamber, Women's Chamber, WHC, Women's IC Title
 *
 * Safe to re-run — skips if event already exists.
 */

import dotenv from 'dotenv';
import * as userRepository from '../../repositories/userRepository.js';
import * as eventRepository from '../../repositories/eventRepository.js';
import { query, connectPostgres } from '../../config/postgres.js';

dotenv.config();

const UPCOMING_EVENTS = [
  {
    name: 'WWE Elimination Chamber 2026',
    brand: 'WWE',
    date: new Date('2026-02-28T00:00:00Z'),
    matches: [
      {
        matchId: 'ec26_m1',
        type: 'Elimination Chamber',
        titleMatch: false,
        competitors: ['Randy Orton', 'Cody Rhodes', "Je'Von Evans", 'Trick Williams', 'Logan Paul', 'LA Knight'],
        multiplier: 2.0,
        match_order: 0,
      },
      {
        matchId: 'ec26_m2',
        type: 'Elimination Chamber',
        titleMatch: false,
        competitors: ['Tiffany Stratton', 'Asuka', 'Alexa Bliss', 'Rhea Ripley', 'Raquel Rodriguez', 'Kiana James'],
        multiplier: 2.0,
        match_order: 1,
      },
      {
        matchId: 'ec26_m3',
        type: 'Singles',
        titleMatch: true,
        competitors: ['CM Punk', 'Finn Balor'],
        multiplier: 1.5,
        match_order: 2,
      },
      {
        matchId: 'ec26_m4',
        type: 'Singles',
        titleMatch: true,
        competitors: ['Becky Lynch', 'AJ Lee'],
        multiplier: 1.3,
        match_order: 3,
      },
    ],
  },
];

async function seedUpcomingEvents() {
  await connectPostgres();

  const admin = await userRepository.findUserByEmail(process.env.ADMIN_EMAIL);
  if (!admin) {
    console.error('Admin user not found — run 001_admin_user.js first');
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;

  for (const eventDef of UPCOMING_EVENTS) {
    // Check if event already exists by name
    const existing = await query(
      'SELECT id FROM events WHERE name = $1',
      [eventDef.name]
    );

    if (existing.rows.length > 0) {
      console.log(`⏭  Skipping (already exists): ${eventDef.name}`);
      skipped++;
      continue;
    }

    await eventRepository.createEvent({
      name: eventDef.name,
      brand: eventDef.brand,
      date: eventDef.date,
      matches: eventDef.matches,
      createdBy: admin.id,
    });

    console.log(`✓ Created: ${eventDef.name}`);
    created++;
  }

  console.log(`\nUpcoming events seed complete — created: ${created}, skipped: ${skipped}`);
  process.exit(0);
}

seedUpcomingEvents().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
