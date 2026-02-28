/**
 * Seed: 200 realistic dummy users with picks for all events
 *
 * - Clears every non-admin user (CASCADE removes their picks / follows)
 * - Also clears the admin's own picks
 * - Creates 200 users spread across 5 skill tiers
 * - Generates picks for all 6 scored events (Crown Jewel → Worlds End)
 * - Generates picks for ~80% of users for the upcoming EC 2026 (unscored)
 * - Uses a seeded deterministic RNG → same output every run
 *
 * Run:  node src/db/seeds/005_large_user_seed.js
 * Prereqs: 001_admin_user.js, 003_leaderboard_data.js, 004_upcoming_events.js
 */

import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import * as userRepository from '../../repositories/userRepository.js';
import * as eventRepository from '../../repositories/eventRepository.js';
import { query, getClient, connectPostgres } from '../../config/postgres.js';

dotenv.config();

// ── Seeded deterministic RNG (linear congruential generator) ─────────────────
class RNG {
  constructor(seed = 42) { this.s = (seed >>> 0) || 1; }
  next() {
    this.s = (Math.imul(1664525, this.s) + 1013904223) >>> 0;
    return this.s / 0x100000000;
  }
  int(lo, hi) { return lo + Math.floor(this.next() * (hi - lo + 1)); }
  pick(arr)   { return arr[this.int(0, arr.length - 1)]; }
}

// ── Scored event definitions (match_id must match DB strings from seed 003) ───
const SCORED_EVENTS = [
  {
    name: 'Crown Jewel 2025',
    matches: [
      { id: 'cj25_m1', mult: 1.3, winner: 'Bronson Reed',
        losers: ['Roman Reigns'] },
      { id: 'cj25_m2', mult: 1.5, winner: 'John Cena',
        losers: ['AJ Styles'] },
      { id: 'cj25_m3', mult: 1.5, winner: 'Stephanie Vaquer',
        losers: ['Tiffany Stratton'] },
      { id: 'cj25_m4', mult: 1.5, winner: 'Seth Rollins',
        losers: ['Cody Rhodes'] },
    ],
  },
  {
    name: 'Survivor Series 2025',
    matches: [
      { id: 'ss25_m1', mult: 1.5, winner: 'Team AJ Lee',
        losers: ['Team Becky Lynch'] },
      { id: 'ss25_m2', mult: 1.5, winner: 'Dominik Mysterio',
        losers: ['John Cena'] },
      { id: 'ss25_m3', mult: 1.3, winner: 'Stephanie Vaquer',
        losers: ['Nikki Bella'] },
      { id: 'ss25_m4', mult: 1.5, winner: 'Team Drew McIntyre',
        losers: ['Team Cody Rhodes'] },
    ],
  },
  {
    name: 'Royal Rumble 2026',
    matches: [
      { id: 'rr26_m1', mult: 1.5, winner: 'Drew McIntyre',
        losers: ['Sami Zayn'] },
      { id: 'rr26_m2', mult: 1.3, winner: 'Gunther',
        losers: ['AJ Styles'] },
      { id: 'rr26_m3', mult: 2.0, winner: 'Roman Reigns',
        losers: ['CM Punk', 'Gunther', 'Cody Rhodes', 'Bron Breakker',
                 'Oba Femi', 'LA Knight', 'Sami Zayn', 'Seth Rollins', 'Logan Paul'] },
      { id: 'rr26_m4', mult: 2.0, winner: 'Liv Morgan',
        losers: ['Tiffany Stratton', 'Rhea Ripley', 'Becky Lynch',
                 'Bianca Belair', 'IYO SKY', 'Bayley', 'Jade Cargill',
                 'Naomi', 'Stephanie Vaquer'] },
    ],
  },
  {
    name: 'WrestleDream 2025',
    matches: [
      { id: 'wd25_m1', mult: 1.5, winner: '"Hangman" Adam Page',
        losers: ['Samoa Joe'] },
      { id: 'wd25_m2', mult: 1.3, winner: 'Darby Allin',
        losers: ['Jon Moxley'] },
      { id: 'wd25_m3', mult: 1.3, winner: 'Kris Statlander',
        losers: ['Toni Storm'] },
      { id: 'wd25_m4', mult: 1.3, winner: 'Kyle Fletcher',
        losers: ['Mark Briscoe'] },
    ],
  },
  {
    name: 'Full Gear 2025',
    matches: [
      { id: 'fg25_m1', mult: 1.5, winner: 'Samoa Joe',
        losers: ['"Hangman" Adam Page'] },
      { id: 'fg25_m2', mult: 1.3, winner: 'Kris Statlander',
        losers: ['Mercedes Moné'] },
      { id: 'fg25_m3', mult: 1.3, winner: 'Mark Briscoe',
        losers: ['Kyle Fletcher'] },
      { id: 'fg25_m4', mult: 1.3, winner: 'FTR',
        losers: ['Brodido (Bandido & Brody Lee)'] },
    ],
  },
  {
    name: 'Worlds End 2025',
    matches: [
      { id: 'we25_m1', mult: 2.0, winner: 'MJF',
        losers: ['Samoa Joe', 'Swerve Strickland', '"Hangman" Adam Page'] },
      { id: 'we25_m2', mult: 1.5, winner: 'Jon Moxley',
        losers: ['Kazuchika Okada'] },
      { id: 'we25_m3', mult: 1.3, winner: 'Kris Statlander',
        losers: ['Jamie Hayter'] },
      { id: 'we25_m4', mult: 1.3, winner: 'FTR',
        losers: ['Bang Bang Gang'] },
    ],
  },
];

// Upcoming event (picks only, no scoring yet)
const UPCOMING_EVENT_NAME = 'WWE Elimination Chamber 2026';
const UPCOMING_MATCHES = [
  { id: 'ec26_m1', competitors: ['Randy Orton', 'Cody Rhodes', "Je'Von Evans",
                                  'Trick Williams', 'Logan Paul', 'LA Knight'] },
  { id: 'ec26_m2', competitors: ['Tiffany Stratton', 'Asuka', 'Alexa Bliss',
                                  'Rhea Ripley', 'Raquel Rodriguez', 'Kiana James'] },
  { id: 'ec26_m3', competitors: ['CM Punk', 'Finn Balor'] },
  { id: 'ec26_m4', competitors: ['Becky Lynch', 'AJ Lee'] },
];

// ── 200 display names: 20 first × 10 last ────────────────────────────────────
const FIRST = [
  'Jake',  'Tyler',  'Connor', 'Alex',  'Sam',
  'Chris', 'Kyle',   'Dylan',  'Adam',  'Ryan',
  'Sean',  'Mike',   'Nick',   'Matt',  'Josh',
  'Dave',  'Tony',   'Rick',   'Zach',  'Evan',
];
const LAST = [
  'Hart', 'Austin', 'Rhodes', 'Rollins', 'Styles',
  'Orton', 'Jericho', 'Punk', 'Reigns', 'Hunter',
];

// ── Skill tiers ───────────────────────────────────────────────────────────────
// idx 0-19   → elite   (~88% correct per match)
// idx 20-59  → good    (~72%)
// idx 60-139 → average (~53%)
// idx 140-179→ below   (~35%)
// idx 180-199→ poor    (~18%)
function skillRate(idx) {
  if (idx < 20)  return 0.88;
  if (idx < 60)  return 0.72;
  if (idx < 140) return 0.53;
  if (idx < 180) return 0.35;
  return 0.18;
}

// ── Confidence splitter ───────────────────────────────────────────────────────
// Returns n integers that sum to exactly 100, each >= minVal.
function splitConf(rng, n, minVal = 15) {
  const pool = 100 - n * minVal;
  const raw  = Array.from({ length: n }, () => rng.next() + 0.001);
  const sum  = raw.reduce((a, b) => a + b, 0);
  const conf = raw.map(v => minVal + Math.floor((v / sum) * pool));
  // Correct rounding drift on the first slot
  conf[0] += 100 - conf.reduce((a, b) => a + b, 0);
  return conf;
}

// ── Pick generators ───────────────────────────────────────────────────────────
function genScoredPicks(rng, skill, matches) {
  const confs   = splitConf(rng, matches.length);
  const choices = {};
  let pts = 0, correct = 0;
  for (let i = 0; i < matches.length; i++) {
    const m          = matches[i];
    const isCorrect  = rng.next() < skill;
    const pickedWin  = isCorrect ? m.winner : rng.pick(m.losers);
    choices[m.id]    = { winner: pickedWin, confidence: confs[i] };
    if (isCorrect) { pts += confs[i] * m.mult; correct++; }
  }
  return { choices, pointsEarned: pts, correctPicks: correct };
}

function genUpcomingPicks(rng, matches) {
  const confs   = splitConf(rng, matches.length);
  const choices = {};
  for (let i = 0; i < matches.length; i++) {
    const m       = matches[i];
    choices[m.id] = { winner: rng.pick(m.competitors), confidence: confs[i] };
  }
  return choices;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  try {
    await connectPostgres();
    console.log('Connected to database.\n');

    // 1. Find admin
    const admin = await userRepository.findUserByEmail(
      process.env.ADMIN_EMAIL || 'admin@wrestleguess.com',
    );
    if (!admin) {
      console.error('Admin user not found. Run 001_admin_user.js first.');
      process.exit(1);
    }
    console.log('✓ Admin found:', admin.email);

    // 2. Clear all non-admin users (CASCADE removes picks, follows)
    //    Also clear admin's own picks so the leaderboard is clean
    const { rowCount: deletedUsers } = await query(
      'DELETE FROM users WHERE id != $1', [admin.id],
    );
    const { rowCount: deletedAdminPicks } = await query(
      'DELETE FROM picks WHERE user_id = $1', [admin.id],
    );
    console.log(`✓ Cleared ${deletedUsers} existing users and ${deletedAdminPicks} admin picks`);

    // 3. Load events from DB (need IDs and dates)
    const allEvents = await eventRepository.findAllEvents({ includeMatches: false });
    const eventById  = {}; // name → { id, date }
    for (const e of allEvents) eventById[e.name] = { id: e.id, date: e.date };

    for (const ed of SCORED_EVENTS) {
      if (!eventById[ed.name]) {
        console.error(`Missing event: "${ed.name}". Run 003_leaderboard_data.js first.`);
        process.exit(1);
      }
    }
    const upcomingEntry = eventById[UPCOMING_EVENT_NAME] || null;
    if (!upcomingEntry) {
      console.warn(`⚠  "${UPCOMING_EVENT_NAME}" not found — upcoming picks will be skipped.`);
    }
    console.log(`✓ Found ${allEvents.length} events in DB\n`);

    // 4. Hash shared password once (all 200 users share "Demo1234!")
    console.log('Hashing shared password (this takes a moment)...');
    const pwHash = await bcrypt.hash('Demo1234!', 10);
    console.log('✓ Password hashed\n');

    // 5. Build user list
    const userDefs = [];
    for (let fi = 0; fi < FIRST.length; fi++) {
      for (let li = 0; li < LAST.length; li++) {
        const idx = fi * LAST.length + li;
        userDefs.push({
          idx,
          displayName: `${FIRST[fi]}${LAST[li]}`,
          email: `${FIRST[fi].toLowerCase()}.${LAST[li].toLowerCase()}@wrestlefan.test`,
        });
      }
    }

    // 6. Insert users + picks in one big transaction
    console.log(`Inserting ${userDefs.length} users and their picks...`);
    const client = await getClient();
    let picksCreated = 0;

    try {
      await client.query('BEGIN');

      for (const u of userDefs) {
        // Insert user
        const userRow = await client.query(
          `INSERT INTO users (email, password, display_name, is_admin)
           VALUES ($1, $2, $3, false) RETURNING id`,
          [u.email, pwHash, u.displayName],
        );
        const userId = userRow.rows[0].id;
        const skill  = skillRate(u.idx);

        // Use a per-user sub-seed for independence between users
        const rng = new RNG(u.idx * 7919 + 1);

        // Scored events
        for (const ed of SCORED_EVENTS) {
          const { id: eventId, date: rawDate } = eventById[ed.name];
          const eventDate  = new Date(rawDate);
          const submittedAt = new Date(eventDate.getTime() - 3_600_000); // 1 hr before

          const picks = genScoredPicks(rng, skill, ed.matches);

          const pickRow = await client.query(
            `INSERT INTO picks
               (event_id, user_id, total_confidence, version,
                points_earned, correct_picks, submitted_at, created_at, updated_at)
             VALUES ($1, $2, 100, 2, $3, $4, $5, $5, $5) RETURNING id`,
            [eventId, userId, picks.pointsEarned, picks.correctPicks, submittedAt],
          );
          const pickId = pickRow.rows[0].id;

          for (const [matchId, choice] of Object.entries(picks.choices)) {
            await client.query(
              `INSERT INTO pick_choices (pick_id, match_id, winner, confidence)
               VALUES ($1, $2, $3, $4)`,
              [pickId, matchId, choice.winner, choice.confidence],
            );
          }
          picksCreated++;
        }

        // Upcoming event (~80% of users submit picks)
        if (upcomingEntry && rng.next() < 0.80) {
          const choices = genUpcomingPicks(rng, UPCOMING_MATCHES);
          const pickRow = await client.query(
            `INSERT INTO picks
               (event_id, user_id, total_confidence, version,
                submitted_at, created_at, updated_at)
             VALUES ($1, $2, 100, 2, NOW(), NOW(), NOW()) RETURNING id`,
            [upcomingEntry.id, userId],
          );
          const pickId = pickRow.rows[0].id;

          for (const [matchId, choice] of Object.entries(choices)) {
            await client.query(
              `INSERT INTO pick_choices (pick_id, match_id, winner, confidence)
               VALUES ($1, $2, $3, $4)`,
              [pickId, matchId, choice.winner, choice.confidence],
            );
          }
          picksCreated++;
        }
      }

      await client.query('COMMIT');
      console.log(`✓ Created ${userDefs.length} users`);
      console.log(`✓ Created ${picksCreated} picks`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    // 7. Quick leaderboard preview
    const top = await query(`
      SELECT u.display_name, SUM(p.points_earned) AS total, COUNT(p.id) AS events
      FROM users u
      JOIN picks p ON p.user_id = u.id AND p.points_earned IS NOT NULL
      GROUP BY u.id, u.display_name
      ORDER BY total DESC
      LIMIT 10
    `);

    console.log('\n══════════════════════════════════════════════');
    console.log('Top 10 leaderboard (live from DB):');
    top.rows.forEach((r, i) => {
      const pts = parseFloat(r.total).toFixed(1);
      console.log(`  ${String(i + 1).padStart(2)}. ${r.display_name.padEnd(18)} ${pts} pts  (${r.events} events)`);
    });
    console.log('══════════════════════════════════════════════');
    console.log('\nSeed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

run();
