/**
 * Reseed: Creates admin + all events + 500 realistic users with picks.
 * Run AFTER reset.js.
 *
 *   node src/db/seeds/reset.js
 *   node src/db/seeds/reseed.js
 *
 * Scored events (7):
 *   Crown Jewel 2025       — Oct 11 2025  (WWE)
 *   WrestleDream 2025      — Oct 18 2025  (AEW)
 *   Survivor Series 2025   — Nov 29 2025  (WWE)
 *   Full Gear 2025         — Nov 22 2025  (AEW)
 *   Worlds End 2025        — Dec 27 2025  (AEW)
 *   Royal Rumble 2026      — Jan 31 2026  (WWE)
 *   Elimination Chamber    — Feb 28 2026  (WWE) ← tonight's results
 *
 * Upcoming events (2):
 *   AEW Revolution 2026    — Mar 15 2026  (AEW)
 *   WrestleMania 42        — Apr 18 2026  (WWE)
 */

import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import * as userRepository from '../../repositories/userRepository.js';
import * as eventRepository from '../../repositories/eventRepository.js';
import { query, getClient, connectPostgres } from '../../config/postgres.js';

dotenv.config();

// ── Seeded deterministic RNG ──────────────────────────────────────────────────
class RNG {
  constructor(seed = 42) { this.s = (seed >>> 0) || 1; }
  next() {
    this.s = (Math.imul(1664525, this.s) + 1013904223) >>> 0;
    return this.s / 0x100000000;
  }
  int(lo, hi) { return lo + Math.floor(this.next() * (hi - lo + 1)); }
  pick(arr)   { return arr[this.int(0, arr.length - 1)]; }
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

// ── Name pools (80 first × 40 last = 3200 unique combos, take 500) ────────────
const FIRST = [
  // Male
  'Jake',     'Tyler',    'Connor',   'Alex',     'Sam',
  'Chris',    'Kyle',     'Dylan',    'Adam',     'Ryan',
  'Sean',     'Mike',     'Nick',     'Matt',     'Josh',
  'Dave',     'Tony',     'Rick',     'Zach',     'Evan',
  'James',    'John',     'Robert',   'William',  'Daniel',
  'Marcus',   'Andre',    'Darius',   'Jamal',    'Jordan',
  'Justin',   'Kevin',    'Aaron',    'Brendan',  'Nathan',
  'Brian',    'Scott',    'Patrick',  'Derek',    'Brett',
  'Cameron',  'Travis',   'Logan',    'Mason',    'Ethan',
  'Liam',     'Noah',     'Owen',     'Caleb',    'Ian',
  // Female
  'Jennifer', 'Ashley',   'Sarah',    'Emily',    'Jessica',
  'Amanda',   'Lauren',   'Stephanie','Rachel',   'Megan',
  'Hannah',   'Samantha', 'Amber',    'Taylor',   'Alexis',
  'Natalie',  'Kayla',    'Morgan',   'Courtney', 'Madison',
  'Alyssa',   'Brianna',  'Danielle', 'Christina','Lisa',
  'Rebecca',  'Melissa',  'Heather',  'Michelle', 'Tiffany',
];

const LAST = [
  'Smith',    'Jones',    'Williams', 'Brown',    'Davis',
  'Miller',   'Wilson',   'Moore',    'Taylor',   'Anderson',
  'Thomas',   'Jackson',  'White',    'Harris',   'Martin',
  'Garcia',   'Martinez', 'Robinson', 'Clark',    'Rodriguez',
  'Lewis',    'Lee',      'Walker',   'Hall',     'Allen',
  'Young',    'King',     'Wright',   'Hill',     'Scott',
  'Green',    'Adams',    'Baker',    'Nelson',   'Carter',
  'Mitchell', 'Reed',     'Evans',    'Collins',  'Brooks',
];

// ── Scored event definitions ──────────────────────────────────────────────────
const SCORED_EVENTS = [
  {
    name: 'Crown Jewel 2025',
    brand: 'WWE',
    date: new Date('2025-10-11T15:00:00Z'),
    scoredAt: new Date('2025-10-11T22:00:00Z'),
    matches: [
      {
        matchId: 'cj25_m1', type: 'Street Fight', titleMatch: false,
        match_order: 0, multiplier: 1.3,
        competitors: ['Bronson Reed', 'Roman Reigns'],
        winner: 'Bronson Reed', losers: ['Roman Reigns'],
      },
      {
        matchId: 'cj25_m2', type: 'Singles', titleMatch: false,
        match_order: 1, multiplier: 1.5,
        competitors: ['John Cena', 'AJ Styles'],
        winner: 'John Cena', losers: ['AJ Styles'],
      },
      {
        matchId: 'cj25_m3', type: 'Singles', titleMatch: true,
        match_order: 2, multiplier: 1.5,
        competitors: ['Stephanie Vaquer', 'Tiffany Stratton'],
        winner: 'Stephanie Vaquer', losers: ['Tiffany Stratton'],
      },
      {
        matchId: 'cj25_m4', type: 'Singles', titleMatch: true,
        match_order: 3, multiplier: 1.5,
        competitors: ['Seth Rollins', 'Cody Rhodes'],
        winner: 'Seth Rollins', losers: ['Cody Rhodes'],
      },
    ],
  },
  {
    name: 'WrestleDream 2025',
    brand: 'AEW',
    date: new Date('2025-10-18T23:00:00Z'),
    scoredAt: new Date('2025-10-19T03:00:00Z'),
    matches: [
      {
        matchId: 'wd25_m1', type: 'Singles', titleMatch: true,
        match_order: 0, multiplier: 1.5,
        competitors: ['"Hangman" Adam Page', 'Samoa Joe'],
        winner: '"Hangman" Adam Page', losers: ['Samoa Joe'],
      },
      {
        matchId: 'wd25_m2', type: 'Singles', titleMatch: false,
        match_order: 1, multiplier: 1.3,
        competitors: ['Darby Allin', 'Jon Moxley'],
        winner: 'Darby Allin', losers: ['Jon Moxley'],
      },
      {
        matchId: 'wd25_m3', type: 'Singles', titleMatch: true,
        match_order: 2, multiplier: 1.3,
        competitors: ['Kris Statlander', 'Toni Storm'],
        winner: 'Kris Statlander', losers: ['Toni Storm'],
      },
      {
        matchId: 'wd25_m4', type: 'Singles', titleMatch: true,
        match_order: 3, multiplier: 1.3,
        competitors: ['Kyle Fletcher', 'Mark Briscoe'],
        winner: 'Kyle Fletcher', losers: ['Mark Briscoe'],
      },
    ],
  },
  {
    name: 'Full Gear 2025',
    brand: 'AEW',
    date: new Date('2025-11-22T23:00:00Z'),
    scoredAt: new Date('2025-11-23T03:30:00Z'),
    matches: [
      {
        matchId: 'fg25_m1', type: 'Steel Cage', titleMatch: true,
        match_order: 0, multiplier: 1.5,
        competitors: ['Samoa Joe', '"Hangman" Adam Page'],
        winner: 'Samoa Joe', losers: ['"Hangman" Adam Page'],
      },
      {
        matchId: 'fg25_m2', type: 'Singles', titleMatch: true,
        match_order: 1, multiplier: 1.3,
        competitors: ['Kris Statlander', 'Mercedes Moné'],
        winner: 'Kris Statlander', losers: ['Mercedes Moné'],
      },
      {
        matchId: 'fg25_m3', type: 'No DQ', titleMatch: true,
        match_order: 2, multiplier: 1.3,
        competitors: ['Mark Briscoe', 'Kyle Fletcher'],
        winner: 'Mark Briscoe', losers: ['Kyle Fletcher'],
      },
      {
        matchId: 'fg25_m4', type: 'Tag Team', titleMatch: true,
        match_order: 3, multiplier: 1.3,
        competitors: ['FTR', 'Brodido (Bandido & Brody Lee)'],
        winner: 'FTR', losers: ['Brodido (Bandido & Brody Lee)'],
      },
    ],
  },
  {
    name: 'Survivor Series 2025',
    brand: 'WWE',
    date: new Date('2025-11-29T23:00:00Z'),
    scoredAt: new Date('2025-11-30T04:00:00Z'),
    matches: [
      {
        matchId: 'ss25_m1', type: 'WarGames', titleMatch: false,
        match_order: 0, multiplier: 1.5,
        competitors: ['Team AJ Lee', 'Team Becky Lynch'],
        winner: 'Team AJ Lee', losers: ['Team Becky Lynch'],
      },
      {
        matchId: 'ss25_m2', type: 'Singles', titleMatch: true,
        match_order: 1, multiplier: 1.5,
        competitors: ['Dominik Mysterio', 'John Cena'],
        winner: 'Dominik Mysterio', losers: ['John Cena'],
      },
      {
        matchId: 'ss25_m3', type: 'Singles', titleMatch: true,
        match_order: 2, multiplier: 1.3,
        competitors: ['Stephanie Vaquer', 'Nikki Bella'],
        winner: 'Stephanie Vaquer', losers: ['Nikki Bella'],
      },
      {
        matchId: 'ss25_m4', type: 'WarGames', titleMatch: false,
        match_order: 3, multiplier: 1.5,
        competitors: ['Team Drew McIntyre', 'Team Cody Rhodes'],
        winner: 'Team Drew McIntyre', losers: ['Team Cody Rhodes'],
      },
    ],
  },
  {
    name: 'Worlds End 2025',
    brand: 'AEW',
    date: new Date('2025-12-27T23:00:00Z'),
    scoredAt: new Date('2025-12-28T03:00:00Z'),
    matches: [
      {
        matchId: 'we25_m1', type: 'Fatal Four-Way', titleMatch: true,
        match_order: 0, multiplier: 2.0,
        competitors: ['MJF', 'Samoa Joe', 'Swerve Strickland', '"Hangman" Adam Page'],
        winner: 'MJF', losers: ['Samoa Joe', 'Swerve Strickland', '"Hangman" Adam Page'],
      },
      {
        matchId: 'we25_m2', type: 'Singles', titleMatch: true,
        match_order: 1, multiplier: 1.5,
        competitors: ['Jon Moxley', 'Kazuchika Okada'],
        winner: 'Jon Moxley', losers: ['Kazuchika Okada'],
      },
      {
        matchId: 'we25_m3', type: 'Singles', titleMatch: true,
        match_order: 2, multiplier: 1.3,
        competitors: ['Kris Statlander', 'Jamie Hayter'],
        winner: 'Kris Statlander', losers: ['Jamie Hayter'],
      },
      {
        matchId: 'we25_m4', type: 'Tag Team', titleMatch: true,
        match_order: 3, multiplier: 1.3,
        competitors: ['FTR', 'Bang Bang Gang'],
        winner: 'FTR', losers: ['Bang Bang Gang'],
      },
    ],
  },
  {
    name: 'Royal Rumble 2026',
    brand: 'WWE',
    date: new Date('2026-01-31T20:00:00Z'),
    scoredAt: new Date('2026-02-01T02:00:00Z'),
    matches: [
      {
        matchId: 'rr26_m1', type: 'Singles', titleMatch: true,
        match_order: 0, multiplier: 1.5,
        competitors: ['Drew McIntyre', 'Sami Zayn'],
        winner: 'Drew McIntyre', losers: ['Sami Zayn'],
      },
      {
        matchId: 'rr26_m2', type: 'Singles', titleMatch: false,
        match_order: 1, multiplier: 1.3,
        competitors: ['Gunther', 'AJ Styles'],
        winner: 'Gunther', losers: ['AJ Styles'],
      },
      {
        matchId: 'rr26_m3', type: 'Royal Rumble', titleMatch: false,
        match_order: 2, multiplier: 2.0,
        competitors: [
          'Roman Reigns', 'Gunther', 'CM Punk', 'Bron Breakker', 'Oba Femi',
          'Cody Rhodes', 'LA Knight', 'Sami Zayn', 'Seth Rollins', 'Logan Paul', '...+20 more',
        ],
        winner: 'Roman Reigns',
        losers: ['Gunther', 'CM Punk', 'Bron Breakker', 'Oba Femi',
                 'Cody Rhodes', 'LA Knight', 'Sami Zayn', 'Seth Rollins', 'Logan Paul'],
      },
      {
        matchId: 'rr26_m4', type: 'Royal Rumble', titleMatch: false,
        match_order: 3, multiplier: 2.0,
        competitors: [
          'Liv Morgan', 'Tiffany Stratton', 'Rhea Ripley', 'Becky Lynch',
          'Bianca Belair', 'IYO SKY', 'Bayley', 'Jade Cargill', 'Naomi',
          'Stephanie Vaquer', '...+20 more',
        ],
        winner: 'Liv Morgan',
        losers: ['Tiffany Stratton', 'Rhea Ripley', 'Becky Lynch',
                 'Bianca Belair', 'IYO SKY', 'Bayley', 'Jade Cargill',
                 'Naomi', 'Stephanie Vaquer'],
      },
    ],
  },
  {
    // Tonight's results — Feb 28 2026
    name: 'WWE Elimination Chamber 2026',
    brand: 'WWE',
    date: new Date('2026-02-28T00:00:00Z'),
    scoredAt: new Date('2026-02-28T05:00:00Z'),
    matches: [
      {
        matchId: 'ec26_m1', type: 'Elimination Chamber', titleMatch: false,
        match_order: 0, multiplier: 2.0,
        competitors: ['Randy Orton', 'Cody Rhodes', "Je'Von Evans", 'Trick Williams', 'Logan Paul', 'LA Knight'],
        winner: 'Randy Orton',
        losers: ['Cody Rhodes', "Je'Von Evans", 'Trick Williams', 'Logan Paul', 'LA Knight'],
      },
      {
        matchId: 'ec26_m2', type: 'Elimination Chamber', titleMatch: false,
        match_order: 1, multiplier: 2.0,
        competitors: ['Tiffany Stratton', 'Asuka', 'Alexa Bliss', 'Rhea Ripley', 'Raquel Rodriguez', 'Kiana James'],
        winner: 'Rhea Ripley',
        losers: ['Tiffany Stratton', 'Asuka', 'Alexa Bliss', 'Raquel Rodriguez', 'Kiana James'],
      },
      {
        matchId: 'ec26_m3', type: 'Singles', titleMatch: true,
        match_order: 2, multiplier: 1.5,
        competitors: ['CM Punk', 'Finn Balor'],
        winner: 'CM Punk', losers: ['Finn Balor'],
      },
      {
        matchId: 'ec26_m4', type: 'Singles', titleMatch: true,
        match_order: 3, multiplier: 1.3,
        competitors: ['Becky Lynch', 'AJ Lee'],
        winner: 'AJ Lee', losers: ['Becky Lynch'],
      },
    ],
  },
];

// ── Upcoming event definitions ────────────────────────────────────────────────
const UPCOMING_EVENTS = [
  {
    name: 'AEW Revolution 2026',
    brand: 'AEW',
    date: new Date('2026-03-15T23:00:00Z'),
    matches: [
      {
        matchId: 'rev26_m1', type: 'Texas Death Match', titleMatch: true,
        match_order: 0, multiplier: 1.5,
        competitors: ['MJF', '"Hangman" Adam Page'],
      },
      {
        matchId: 'rev26_m2', type: 'Tag Team', titleMatch: true,
        match_order: 1, multiplier: 1.3,
        competitors: ['FTR', 'The Young Bucks'],
      },
      {
        matchId: 'rev26_m3', type: 'No Time Limit', titleMatch: true,
        match_order: 2, multiplier: 1.5,
        competitors: ['Jon Moxley', 'Konosuke Takeshita'],
      },
    ],
  },
  {
    name: 'WrestleMania 42',
    brand: 'WWE',
    date: new Date('2026-04-18T23:00:00Z'),
    matches: [
      {
        matchId: 'wm42_m1', type: 'Singles', titleMatch: true,
        match_order: 0, multiplier: 1.5,
        competitors: ['Drew McIntyre', 'Randy Orton'],
      },
      {
        matchId: 'wm42_m2', type: 'Singles', titleMatch: true,
        match_order: 1, multiplier: 1.5,
        competitors: ['CM Punk', 'Roman Reigns'],
      },
      {
        matchId: 'wm42_m3', type: 'Singles', titleMatch: true,
        match_order: 2, multiplier: 1.3,
        competitors: ['Jade Cargill', 'Rhea Ripley'],
      },
      {
        matchId: 'wm42_m4', type: 'Singles', titleMatch: true,
        match_order: 3, multiplier: 1.3,
        competitors: ['Stephanie Vaquer', 'Liv Morgan'],
      },
    ],
  },
];

// ── Skill rate by user index ──────────────────────────────────────────────────
function skillRate(idx) {
  if (idx < 50)  return 0.88;  // elite
  if (idx < 150) return 0.72;  // good
  if (idx < 300) return 0.55;  // average
  if (idx < 400) return 0.35;  // below average
  return 0.20;                  // poor
}

// ── Confidence split: n integers summing to 100, each >= 10 ──────────────────
function splitConf(rng, n) {
  const min = 10;
  const pool = 100 - n * min;
  const raw = Array.from({ length: n }, () => rng.next() + 0.001);
  const sum = raw.reduce((a, b) => a + b, 0);
  const conf = raw.map(v => min + Math.floor((v / sum) * pool));
  conf[0] += 100 - conf.reduce((a, b) => a + b, 0); // fix rounding drift
  return conf;
}

// ── Generate scored picks (calculates points + correct count) ─────────────────
function genScoredPicks(rng, skill, matches) {
  const confs = splitConf(rng, matches.length);
  const choices = {};
  let pts = 0, correct = 0;
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const isCorrect = rng.next() < skill;
    const picked = isCorrect ? m.winner : rng.pick(m.losers);
    choices[m.matchId] = { winner: picked, confidence: confs[i] };
    if (isCorrect) { pts += confs[i] * m.multiplier; correct++; }
  }
  return { choices, pointsEarned: pts, correctPicks: correct };
}

// ── Generate upcoming event picks (no scoring yet) ────────────────────────────
function genUpcomingPicks(rng, matches) {
  const confs = splitConf(rng, matches.length);
  const choices = {};
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    choices[m.matchId] = { winner: rng.pick(m.competitors), confidence: confs[i] };
  }
  return choices;
}

// ── Display name: "First Last" (70%) or "First L" initial (30%) ───────────────
function buildDisplayName(rng, first, last, usedNames) {
  if (rng.next() < 0.30) {
    const withInitial = `${first} ${last[0]}`;
    if (!usedNames.has(withInitial)) {
      usedNames.add(withInitial);
      return withInitial;
    }
  }
  const full = `${first} ${last}`;
  usedNames.add(full);
  return full;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  try {
    await connectPostgres();
    console.log('Connected to database.\n');

    const rng = new RNG(2026);

    // 1. Create admin
    const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@wrestleguess.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const admin = await userRepository.createUser({
      email: adminEmail,
      password: adminPassword,
      displayName: 'Admin',
      isAdmin: true,
    });
    console.log(`✓ Admin created: ${admin.email}`);

    // 2. Create scored events
    const eventMap = {}; // name → id
    for (const ed of SCORED_EVENTS) {
      const event = await eventRepository.createEvent({
        name: ed.name,
        brand: ed.brand,
        date: ed.date,
        createdBy: admin.id,
        matches: ed.matches,
      });
      await query(
        `UPDATE events SET locked = true, scored = true, scored_at = $2, updated_at = $2 WHERE id = $1`,
        [event.id, ed.scoredAt],
      );
      eventMap[ed.name] = event.id;
      console.log(`✓ Scored:   ${ed.name}`);
    }

    // 3. Create upcoming events
    for (const ed of UPCOMING_EVENTS) {
      const event = await eventRepository.createEvent({
        name: ed.name,
        brand: ed.brand,
        date: ed.date,
        createdBy: admin.id,
        matches: ed.matches,
      });
      eventMap[ed.name] = event.id;
      console.log(`✓ Upcoming: ${ed.name}`);
    }
    console.log();

    // 4. Hash shared password (all 500 users share "Demo1234!")
    console.log('Hashing shared password...');
    const pwHash = await bcrypt.hash('Demo1234!', 10);
    console.log('✓ Done\n');

    // 5. Build 500 unique (first, last) pairs via shuffle
    const allCombos = [];
    for (const f of FIRST) {
      for (const l of LAST) allCombos.push([f, l]);
    }
    const userCombos = rng.shuffle(allCombos).slice(0, 500);

    // 6. Insert 500 users + their picks in one transaction
    console.log('Inserting 500 users and picks...');
    const client = await getClient();
    let picksCreated = 0;

    try {
      await client.query('BEGIN');

      const usedDisplayNames = new Set(['Admin']);

      for (let idx = 0; idx < 500; idx++) {
        const [first, last] = userCombos[idx];
        const email    = `${first.toLowerCase()}.${last.toLowerCase()}@wrestlefan.test`;
        const dispName = buildDisplayName(rng, first, last, usedDisplayNames);
        const skill    = skillRate(idx);
        const urng     = new RNG(idx * 7919 + 2026); // per-user deterministic RNG

        // Insert user
        const userRow = await client.query(
          `INSERT INTO users (email, password, display_name, is_admin)
           VALUES ($1, $2, $3, false) RETURNING id`,
          [email, pwHash, dispName],
        );
        const userId = userRow.rows[0].id;

        // Determine which scored events this user participates in.
        // startIdx 0 = joined from the beginning, 6 = only the latest event.
        const r = urng.next();
        const startIdx =
          r < 0.15 ? 0 :
          r < 0.30 ? 1 :
          r < 0.50 ? 2 :
          r < 0.65 ? 3 :
          r < 0.80 ? 4 :
          r < 0.92 ? 5 : 6;

        for (let ei = startIdx; ei < SCORED_EVENTS.length; ei++) {
          // ~15% chance to skip any single event after the first one they joined
          if (ei > startIdx && urng.next() < 0.15) continue;

          const ed       = SCORED_EVENTS[ei];
          const eventId  = eventMap[ed.name];
          const picks    = genScoredPicks(urng, skill, ed.matches);
          const submittedAt = new Date(ed.date.getTime() - 3_600_000); // 1 hr before

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

        // Upcoming events: ~70% of users submit picks for each (independently)
        for (const ued of UPCOMING_EVENTS) {
          if (urng.next() > 0.70) continue;
          const choices = genUpcomingPicks(urng, ued.matches);
          const pickRow = await client.query(
            `INSERT INTO picks
               (event_id, user_id, total_confidence, version,
                submitted_at, created_at, updated_at)
             VALUES ($1, $2, 100, 2, NOW(), NOW(), NOW()) RETURNING id`,
            [eventMap[ued.name], userId],
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
      console.log(`✓ 500 users created`);
      console.log(`✓ ${picksCreated} pick submissions created\n`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    // 7. Leaderboard preview
    const top = await query(`
      SELECT u.display_name, SUM(p.points_earned) AS total, COUNT(p.id) AS events
      FROM users u
      JOIN picks p ON p.user_id = u.id AND p.points_earned IS NOT NULL
      GROUP BY u.id, u.display_name
      ORDER BY total DESC
      LIMIT 10
    `);
    console.log('══════════════════════════════════════════════════');
    console.log('Top 10 leaderboard:');
    top.rows.forEach((r, i) => {
      const pts = parseFloat(r.total).toFixed(1);
      console.log(`  ${String(i + 1).padStart(2)}. ${r.display_name.padEnd(22)} ${pts.padStart(7)} pts  (${r.events} events)`);
    });
    console.log('══════════════════════════════════════════════════');
    console.log('\nReseed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Reseed error:', err);
    process.exit(1);
  }
}

run();
