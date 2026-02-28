/**
 * Seed: Leaderboard demo data — real events
 * Uses the last 3 WWE PLEs and last 3 AEW PPVs before February 28, 2026.
 * Run AFTER 001_admin_user.js (admin user required).
 * Safe to re-run — idempotent.
 *
 * WWE events:
 *   Crown Jewel 2025        — 11 Oct 2025, Perth, Australia
 *   Survivor Series 2025    — 29 Nov 2025, San Diego, CA
 *   Royal Rumble 2026       — 31 Jan 2026, Riyadh, Saudi Arabia
 *
 * AEW events:
 *   WrestleDream 2025       — 18 Oct 2025, St. Louis, MO
 *   Full Gear 2025          — 22 Nov 2025, Newark, NJ
 *   Worlds End 2025         — 27 Dec 2025, Hoffman Estates, IL
 *
 * NOTE: If "Royal Rumble 2026" was previously created by 002_test_data.js with
 * placeholder matches, this seed deletes and recreates it with the real card.
 */

import dotenv from 'dotenv';
import * as userRepository from '../../repositories/userRepository.js';
import * as eventRepository from '../../repositories/eventRepository.js';
import { query, getClient, connectPostgres } from '../../config/postgres.js';

dotenv.config();

// ---------------------------------------------------------------------------
// Real event definitions (all 6 events, with correct results)
// ---------------------------------------------------------------------------

const EVENTS = [
  // ─── WWE ────────────────────────────────────────────────────────────────
  {
    name: 'Crown Jewel 2025',
    brand: 'WWE',
    date: new Date('2025-10-11T15:00:00Z'),  // Perth evening
    scoredAt: new Date('2025-10-11T22:00:00Z'),
    matches: [
      {
        matchId: 'cj25_m1', type: 'Street Fight', titleMatch: false,
        competitors: ['Bronson Reed', 'Roman Reigns'],
        multiplier: 1.3, match_order: 0, winner: 'Bronson Reed',
      },
      {
        matchId: 'cj25_m2', type: 'Singles', titleMatch: false,
        competitors: ['John Cena', 'AJ Styles'],
        multiplier: 1.5, match_order: 1, winner: 'John Cena',
      },
      {
        matchId: 'cj25_m3', type: 'Singles', titleMatch: true,
        competitors: ['Stephanie Vaquer', 'Tiffany Stratton'],
        multiplier: 1.5, match_order: 2, winner: 'Stephanie Vaquer',
      },
      {
        matchId: 'cj25_m4', type: 'Singles', titleMatch: true,
        competitors: ['Seth Rollins', 'Cody Rhodes'],
        multiplier: 1.5, match_order: 3, winner: 'Seth Rollins',
      },
    ],
  },
  {
    name: 'Survivor Series 2025',
    brand: 'WWE',
    date: new Date('2025-11-29T23:00:00Z'),  // San Diego evening
    scoredAt: new Date('2025-11-30T04:00:00Z'),
    matches: [
      {
        matchId: 'ss25_m1', type: 'WarGames', titleMatch: false,
        competitors: ['Team AJ Lee', 'Team Becky Lynch'],
        multiplier: 1.5, match_order: 0, winner: 'Team AJ Lee',
      },
      {
        matchId: 'ss25_m2', type: 'Singles', titleMatch: true,
        competitors: ['Dominik Mysterio', 'John Cena'],
        multiplier: 1.5, match_order: 1, winner: 'Dominik Mysterio',
      },
      {
        matchId: 'ss25_m3', type: 'Singles', titleMatch: true,
        competitors: ['Stephanie Vaquer', 'Nikki Bella'],
        multiplier: 1.3, match_order: 2, winner: 'Stephanie Vaquer',
      },
      {
        matchId: 'ss25_m4', type: 'WarGames', titleMatch: false,
        competitors: ['Team Drew McIntyre', 'Team Cody Rhodes'],
        multiplier: 1.5, match_order: 3, winner: 'Team Drew McIntyre',
      },
    ],
  },
  {
    name: 'Royal Rumble 2026',
    brand: 'WWE',
    date: new Date('2026-01-31T20:00:00Z'),  // Riyadh evening
    scoredAt: new Date('2026-02-01T02:00:00Z'),
    matches: [
      {
        matchId: 'rr26_m1', type: 'Singles', titleMatch: true,
        competitors: ['Drew McIntyre', 'Sami Zayn'],
        multiplier: 1.5, match_order: 0, winner: 'Drew McIntyre',
      },
      {
        matchId: 'rr26_m2', type: 'Singles', titleMatch: false,
        competitors: ['Gunther', 'AJ Styles'],
        multiplier: 1.3, match_order: 1, winner: 'Gunther',
      },
      {
        matchId: 'rr26_m3', type: 'Royal Rumble', titleMatch: false,
        competitors: [
          'Roman Reigns', 'Gunther', 'CM Punk', 'Bron Breakker', 'Oba Femi',
          'Cody Rhodes', 'LA Knight', 'Sami Zayn', 'Seth Rollins',
          'Logan Paul', '...+20 more',
        ],
        multiplier: 2.0, match_order: 2, winner: 'Roman Reigns',
      },
      {
        matchId: 'rr26_m4', type: 'Royal Rumble', titleMatch: false,
        competitors: [
          'Liv Morgan', 'Tiffany Stratton', 'Rhea Ripley', 'Becky Lynch',
          'Bianca Belair', 'IYO SKY', 'Bayley', 'Jade Cargill',
          'Naomi', 'Stephanie Vaquer', '...+20 more',
        ],
        multiplier: 2.0, match_order: 3, winner: 'Liv Morgan',
      },
    ],
  },

  // ─── AEW ────────────────────────────────────────────────────────────────
  {
    name: 'WrestleDream 2025',
    brand: 'AEW',
    date: new Date('2025-10-18T23:00:00Z'),  // St. Louis evening
    scoredAt: new Date('2025-10-19T03:00:00Z'),
    matches: [
      {
        matchId: 'wd25_m1', type: 'Singles', titleMatch: true,
        competitors: ['"Hangman" Adam Page', 'Samoa Joe'],
        multiplier: 1.5, match_order: 0, winner: '"Hangman" Adam Page',
      },
      {
        matchId: 'wd25_m2', type: 'Singles', titleMatch: false,
        competitors: ['Darby Allin', 'Jon Moxley'],
        multiplier: 1.3, match_order: 1, winner: 'Darby Allin',
      },
      {
        matchId: 'wd25_m3', type: 'Singles', titleMatch: true,
        competitors: ['Kris Statlander', 'Toni Storm'],
        multiplier: 1.3, match_order: 2, winner: 'Kris Statlander',
      },
      {
        matchId: 'wd25_m4', type: 'Singles', titleMatch: true,
        competitors: ['Kyle Fletcher', 'Mark Briscoe'],
        multiplier: 1.3, match_order: 3, winner: 'Kyle Fletcher',
      },
    ],
  },
  {
    name: 'Full Gear 2025',
    brand: 'AEW',
    date: new Date('2025-11-22T23:00:00Z'),  // Newark evening
    scoredAt: new Date('2025-11-23T03:30:00Z'),
    matches: [
      {
        matchId: 'fg25_m1', type: 'Steel Cage', titleMatch: true,
        competitors: ['Samoa Joe', '"Hangman" Adam Page'],
        multiplier: 1.5, match_order: 0, winner: 'Samoa Joe',
      },
      {
        matchId: 'fg25_m2', type: 'Singles', titleMatch: true,
        competitors: ['Kris Statlander', 'Mercedes Moné'],
        multiplier: 1.3, match_order: 1, winner: 'Kris Statlander',
      },
      {
        matchId: 'fg25_m3', type: 'No DQ', titleMatch: true,
        competitors: ['Mark Briscoe', 'Kyle Fletcher'],
        multiplier: 1.3, match_order: 2, winner: 'Mark Briscoe',
      },
      {
        matchId: 'fg25_m4', type: 'Tag Team', titleMatch: true,
        competitors: ['FTR', 'Brodido (Bandido & Brody Lee)'],
        multiplier: 1.3, match_order: 3, winner: 'FTR',
      },
    ],
  },
  {
    name: 'Worlds End 2025',
    brand: 'AEW',
    date: new Date('2025-12-27T23:00:00Z'),  // Hoffman Estates evening
    scoredAt: new Date('2025-12-28T03:00:00Z'),
    matches: [
      {
        matchId: 'we25_m1', type: 'Fatal Four-Way', titleMatch: true,
        competitors: ['MJF', 'Samoa Joe', 'Swerve Strickland', '"Hangman" Adam Page'],
        multiplier: 2.0, match_order: 0, winner: 'MJF',
      },
      {
        matchId: 'we25_m2', type: 'Singles', titleMatch: true,
        competitors: ['Jon Moxley', 'Kazuchika Okada'],
        multiplier: 1.5, match_order: 1, winner: 'Jon Moxley',
      },
      {
        matchId: 'we25_m3', type: 'Singles', titleMatch: true,
        competitors: ['Kris Statlander', 'Jamie Hayter'],
        multiplier: 1.3, match_order: 2, winner: 'Kris Statlander',
      },
      {
        matchId: 'we25_m4', type: 'Tag Team', titleMatch: true,
        competitors: ['FTR', 'Bang Bang Gang'],
        multiplier: 1.3, match_order: 3, winner: 'FTR',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Per-user picks with pre-calculated points
//
// Results summary:
//   Crown Jewel:   Bronson Reed(x1.3)*, Cena(x1.5), Vaquer(x1.5), Seth*(x1.5)
//   Survivor Ser.: TeamAJLee(x1.5), Dominik(x1.5), Vaquer(x1.3), TeamDrew(x1.5)
//   Royal Rumble:  McIntyre(x1.5), Gunther(x1.3), RomanReigns*(x2.0), LivMorgan(x2.0)
//   WrestleDream:  AdamPage(x1.5), Darby(x1.3), Statlander(x1.3), KFletcher(x1.3)
//   Full Gear:     SamoaJoe*(x1.5), Statlander(x1.3), Briscoe*(x1.3), FTR*(x1.3)
//   Worlds End:    MJF*(x2.0), Moxley(x1.5), Statlander(x1.3), FTR(x1.3)
//  (* marks upsets / less-expected results)
// ---------------------------------------------------------------------------

// confidence sums to 100 per event per user
const USER_PICKS = {

  // ── MachoFan — excellent picker, strong on both promotions ─────────────
  MachoFan: {
    'Crown Jewel 2025': {
      choices: {
        cj25_m1: { winner: 'Bronson Reed',     confidence: 20 }, // ✓ 26
        cj25_m2: { winner: 'John Cena',         confidence: 25 }, // ✓ 37.5
        cj25_m3: { winner: 'Stephanie Vaquer',  confidence: 30 }, // ✓ 45
        cj25_m4: { winner: 'Seth Rollins',      confidence: 25 }, // ✓ 37.5
      },
      pointsEarned: 146,
      correctPicks: 4,
    },
    'Survivor Series 2025': {
      choices: {
        ss25_m1: { winner: 'Team AJ Lee',        confidence: 25 }, // ✓ 37.5
        ss25_m2: { winner: 'Dominik Mysterio',   confidence: 20 }, // ✓ 30
        ss25_m3: { winner: 'Stephanie Vaquer',   confidence: 25 }, // ✓ 32.5
        ss25_m4: { winner: 'Team Drew McIntyre', confidence: 30 }, // ✓ 45
      },
      pointsEarned: 145,
      correctPicks: 4,
    },
    'Royal Rumble 2026': {
      choices: {
        rr26_m1: { winner: 'Drew McIntyre',   confidence: 25 }, // ✓ 37.5
        rr26_m2: { winner: 'Gunther',          confidence: 25 }, // ✓ 32.5
        rr26_m3: { winner: 'Roman Reigns',     confidence: 30 }, // ✓ 60
        rr26_m4: { winner: 'Liv Morgan',       confidence: 20 }, // ✓ 40
      },
      pointsEarned: 170,
      correctPicks: 4,
    },
    'WrestleDream 2025': {
      choices: {
        wd25_m1: { winner: '"Hangman" Adam Page', confidence: 30 }, // ✓ 45
        wd25_m2: { winner: 'Darby Allin',         confidence: 25 }, // ✓ 32.5
        wd25_m3: { winner: 'Kris Statlander',     confidence: 25 }, // ✓ 32.5
        wd25_m4: { winner: 'Kyle Fletcher',       confidence: 20 }, // ✓ 26
      },
      pointsEarned: 136,
      correctPicks: 4,
    },
    'Full Gear 2025': {
      choices: {
        fg25_m1: { winner: '"Hangman" Adam Page', confidence: 30 }, // ✗ 0
        fg25_m2: { winner: 'Kris Statlander',     confidence: 25 }, // ✓ 32.5
        fg25_m3: { winner: 'Kyle Fletcher',       confidence: 25 }, // ✗ 0
        fg25_m4: { winner: 'Brodido (Bandido & Brody Lee)', confidence: 20 }, // ✗ 0
      },
      pointsEarned: 32.5,
      correctPicks: 1,
    },
    'Worlds End 2025': {
      choices: {
        we25_m1: { winner: 'MJF',              confidence: 25 }, // ✓ 50
        we25_m2: { winner: 'Jon Moxley',       confidence: 25 }, // ✓ 37.5
        we25_m3: { winner: 'Kris Statlander',  confidence: 25 }, // ✓ 32.5
        we25_m4: { winner: 'FTR',              confidence: 25 }, // ✓ 32.5
      },
      pointsEarned: 152.5,
      correctPicks: 4,
    },
  },

  // ── DeanDelisle — great at WWE, solid at AEW ────────────────────────────
  DeanDelisle: {
    'Crown Jewel 2025': {
      choices: {
        cj25_m1: { winner: 'Roman Reigns',     confidence: 25 }, // ✗ 0
        cj25_m2: { winner: 'John Cena',         confidence: 30 }, // ✓ 45
        cj25_m3: { winner: 'Stephanie Vaquer',  confidence: 25 }, // ✓ 37.5
        cj25_m4: { winner: 'Cody Rhodes',       confidence: 20 }, // ✗ 0
      },
      pointsEarned: 82.5,
      correctPicks: 2,
    },
    'Survivor Series 2025': {
      choices: {
        ss25_m1: { winner: 'Team AJ Lee',        confidence: 30 }, // ✓ 45
        ss25_m2: { winner: 'Dominik Mysterio',   confidence: 25 }, // ✓ 37.5
        ss25_m3: { winner: 'Stephanie Vaquer',   confidence: 25 }, // ✓ 32.5
        ss25_m4: { winner: 'Team Drew McIntyre', confidence: 20 }, // ✓ 30
      },
      pointsEarned: 145,
      correctPicks: 4,
    },
    'Royal Rumble 2026': {
      choices: {
        rr26_m1: { winner: 'Drew McIntyre',   confidence: 30 }, // ✓ 45
        rr26_m2: { winner: 'Gunther',          confidence: 25 }, // ✓ 32.5
        rr26_m3: { winner: 'Roman Reigns',     confidence: 20 }, // ✓ 40
        rr26_m4: { winner: 'Liv Morgan',       confidence: 25 }, // ✓ 50
      },
      pointsEarned: 167.5,
      correctPicks: 4,
    },
    'WrestleDream 2025': {
      choices: {
        wd25_m1: { winner: '"Hangman" Adam Page', confidence: 30 }, // ✓ 45
        wd25_m2: { winner: 'Darby Allin',         confidence: 25 }, // ✓ 32.5
        wd25_m3: { winner: 'Kris Statlander',     confidence: 25 }, // ✓ 32.5
        wd25_m4: { winner: 'Mark Briscoe',        confidence: 20 }, // ✗ 0
      },
      pointsEarned: 110,
      correctPicks: 3,
    },
    'Full Gear 2025': {
      choices: {
        fg25_m1: { winner: 'Samoa Joe',        confidence: 30 }, // ✓ 45
        fg25_m2: { winner: 'Kris Statlander',  confidence: 25 }, // ✓ 32.5
        fg25_m3: { winner: 'Mark Briscoe',     confidence: 25 }, // ✓ 32.5
        fg25_m4: { winner: 'FTR',              confidence: 20 }, // ✓ 26
      },
      pointsEarned: 136,
      correctPicks: 4,
    },
    'Worlds End 2025': {
      choices: {
        we25_m1: { winner: 'Swerve Strickland', confidence: 25 }, // ✗ 0
        we25_m2: { winner: 'Jon Moxley',         confidence: 30 }, // ✓ 45
        we25_m3: { winner: 'Kris Statlander',    confidence: 25 }, // ✓ 32.5
        we25_m4: { winner: 'FTR',                confidence: 20 }, // ✓ 26
      },
      pointsEarned: 103.5,
      correctPicks: 3,
    },
  },

  // ── GunterFan99 — WWE fan, decent at WWE, struggles with AEW ────────────
  GunterFan99: {
    'Crown Jewel 2025': {
      choices: {
        cj25_m1: { winner: 'Bronson Reed',     confidence: 20 }, // ✓ 26
        cj25_m2: { winner: 'John Cena',         confidence: 25 }, // ✓ 37.5
        cj25_m3: { winner: 'Tiffany Stratton',  confidence: 30 }, // ✗ 0
        cj25_m4: { winner: 'Seth Rollins',      confidence: 25 }, // ✓ 37.5
      },
      pointsEarned: 101,
      correctPicks: 3,
    },
    'Survivor Series 2025': {
      choices: {
        ss25_m1: { winner: 'Team AJ Lee',        confidence: 25 }, // ✓ 37.5
        ss25_m2: { winner: 'Dominik Mysterio',   confidence: 30 }, // ✓ 45
        ss25_m3: { winner: 'Stephanie Vaquer',   confidence: 25 }, // ✓ 32.5
        ss25_m4: { winner: 'Team Cody Rhodes',   confidence: 20 }, // ✗ 0
      },
      pointsEarned: 115,
      correctPicks: 3,
    },
    'Royal Rumble 2026': {
      choices: {
        rr26_m1: { winner: 'Drew McIntyre',   confidence: 35 }, // ✓ 52.5
        rr26_m2: { winner: 'Gunther',          confidence: 25 }, // ✓ 32.5
        rr26_m3: { winner: 'Gunther',          confidence: 25 }, // ✗ 0
        rr26_m4: { winner: 'Tiffany Stratton', confidence: 15 }, // ✗ 0
      },
      pointsEarned: 85,
      correctPicks: 2,
    },
    'WrestleDream 2025': {
      choices: {
        wd25_m1: { winner: '"Hangman" Adam Page', confidence: 25 }, // ✓ 37.5
        wd25_m2: { winner: 'Jon Moxley',          confidence: 30 }, // ✗ 0
        wd25_m3: { winner: 'Kris Statlander',     confidence: 25 }, // ✓ 32.5
        wd25_m4: { winner: 'Kyle Fletcher',       confidence: 20 }, // ✓ 26
      },
      pointsEarned: 96,
      correctPicks: 3,
    },
    'Full Gear 2025': {
      choices: {
        fg25_m1: { winner: '"Hangman" Adam Page', confidence: 30 }, // ✗ 0
        fg25_m2: { winner: 'Kris Statlander',     confidence: 25 }, // ✓ 32.5
        fg25_m3: { winner: 'Kyle Fletcher',       confidence: 25 }, // ✗ 0
        fg25_m4: { winner: 'Brodido (Bandido & Brody Lee)', confidence: 20 }, // ✗ 0
      },
      pointsEarned: 32.5,
      correctPicks: 1,
    },
    'Worlds End 2025': {
      choices: {
        we25_m1: { winner: 'Swerve Strickland', confidence: 25 }, // ✗ 0
        we25_m2: { winner: 'Kazuchika Okada',    confidence: 30 }, // ✗ 0
        we25_m3: { winner: 'Kris Statlander',    confidence: 25 }, // ✓ 32.5
        we25_m4: { winner: 'FTR',                confidence: 20 }, // ✓ 26
      },
      pointsEarned: 58.5,
      correctPicks: 2,
    },
  },

  // ── KaydenBryant — good all-rounder, strong on AEW ──────────────────────
  KaydenBryant: {
    'Crown Jewel 2025': {
      choices: {
        cj25_m1: { winner: 'Roman Reigns',     confidence: 25 }, // ✗ 0
        cj25_m2: { winner: 'John Cena',         confidence: 25 }, // ✓ 37.5
        cj25_m3: { winner: 'Stephanie Vaquer',  confidence: 30 }, // ✓ 45
        cj25_m4: { winner: 'Cody Rhodes',       confidence: 20 }, // ✗ 0
      },
      pointsEarned: 82.5,
      correctPicks: 2,
    },
    'Survivor Series 2025': {
      choices: {
        ss25_m1: { winner: 'Team Becky Lynch',   confidence: 25 }, // ✗ 0
        ss25_m2: { winner: 'Dominik Mysterio',   confidence: 25 }, // ✓ 37.5
        ss25_m3: { winner: 'Stephanie Vaquer',   confidence: 30 }, // ✓ 39
        ss25_m4: { winner: 'Team Drew McIntyre', confidence: 20 }, // ✓ 30
      },
      pointsEarned: 106.5,
      correctPicks: 3,
    },
    'Royal Rumble 2026': {
      choices: {
        rr26_m1: { winner: 'Drew McIntyre',   confidence: 30 }, // ✓ 45
        rr26_m2: { winner: 'AJ Styles',        confidence: 20 }, // ✗ 0
        rr26_m3: { winner: 'Roman Reigns',     confidence: 25 }, // ✓ 50
        rr26_m4: { winner: 'Tiffany Stratton', confidence: 25 }, // ✗ 0
      },
      pointsEarned: 95,
      correctPicks: 2,
    },
    'WrestleDream 2025': {
      choices: {
        wd25_m1: { winner: 'Samoa Joe',           confidence: 25 }, // ✗ 0
        wd25_m2: { winner: 'Darby Allin',         confidence: 30 }, // ✓ 39
        wd25_m3: { winner: 'Kris Statlander',     confidence: 25 }, // ✓ 32.5
        wd25_m4: { winner: 'Kyle Fletcher',       confidence: 20 }, // ✓ 26
      },
      pointsEarned: 97.5,
      correctPicks: 3,
    },
    'Full Gear 2025': {
      choices: {
        fg25_m1: { winner: 'Samoa Joe',        confidence: 30 }, // ✓ 45
        fg25_m2: { winner: 'Kris Statlander',  confidence: 25 }, // ✓ 32.5
        fg25_m3: { winner: 'Mark Briscoe',     confidence: 25 }, // ✓ 32.5
        fg25_m4: { winner: 'Brodido (Bandido & Brody Lee)', confidence: 20 }, // ✗ 0
      },
      pointsEarned: 110,
      correctPicks: 3,
    },
    'Worlds End 2025': {
      choices: {
        we25_m1: { winner: 'MJF',              confidence: 30 }, // ✓ 60
        we25_m2: { winner: 'Jon Moxley',       confidence: 25 }, // ✓ 37.5
        we25_m3: { winner: 'Kris Statlander',  confidence: 25 }, // ✓ 32.5
        we25_m4: { winner: 'Bang Bang Gang',   confidence: 20 }, // ✗ 0
      },
      pointsEarned: 130,
      correctPicks: 3,
    },
  },

  // ── WrestlingWatcher — below average, guesses wrong on big calls ─────────
  WrestlingWatcher: {
    'Crown Jewel 2025': {
      choices: {
        cj25_m1: { winner: 'Roman Reigns',     confidence: 30 }, // ✗ 0
        cj25_m2: { winner: 'John Cena',         confidence: 25 }, // ✓ 37.5
        cj25_m3: { winner: 'Stephanie Vaquer',  confidence: 25 }, // ✓ 37.5
        cj25_m4: { winner: 'Cody Rhodes',       confidence: 20 }, // ✗ 0
      },
      pointsEarned: 75,
      correctPicks: 2,
    },
    'Survivor Series 2025': {
      choices: {
        ss25_m1: { winner: 'Team Becky Lynch',   confidence: 30 }, // ✗ 0
        ss25_m2: { winner: 'Dominik Mysterio',   confidence: 25 }, // ✓ 37.5
        ss25_m3: { winner: 'Stephanie Vaquer',   confidence: 25 }, // ✓ 32.5
        ss25_m4: { winner: 'Team Cody Rhodes',   confidence: 20 }, // ✗ 0
      },
      pointsEarned: 70,
      correctPicks: 2,
    },
    'Royal Rumble 2026': {
      choices: {
        rr26_m1: { winner: 'Drew McIntyre',   confidence: 25 }, // ✓ 37.5
        rr26_m2: { winner: 'Gunther',          confidence: 25 }, // ✓ 32.5
        rr26_m3: { winner: 'CM Punk',          confidence: 30 }, // ✗ 0
        rr26_m4: { winner: 'Bianca Belair',    confidence: 20 }, // ✗ 0
      },
      pointsEarned: 70,
      correctPicks: 2,
    },
    'WrestleDream 2025': {
      choices: {
        wd25_m1: { winner: 'Samoa Joe',           confidence: 25 }, // ✗ 0
        wd25_m2: { winner: 'Darby Allin',         confidence: 30 }, // ✓ 39
        wd25_m3: { winner: 'Toni Storm',          confidence: 25 }, // ✗ 0
        wd25_m4: { winner: 'Mark Briscoe',        confidence: 20 }, // ✗ 0
      },
      pointsEarned: 39,
      correctPicks: 1,
    },
    'Full Gear 2025': {
      choices: {
        fg25_m1: { winner: '"Hangman" Adam Page', confidence: 25 }, // ✗ 0
        fg25_m2: { winner: 'Kris Statlander',     confidence: 30 }, // ✓ 39
        fg25_m3: { winner: 'Kyle Fletcher',       confidence: 25 }, // ✗ 0
        fg25_m4: { winner: 'Brodido (Bandido & Brody Lee)', confidence: 20 }, // ✗ 0
      },
      pointsEarned: 39,
      correctPicks: 1,
    },
    'Worlds End 2025': {
      choices: {
        we25_m1: { winner: 'Samoa Joe',        confidence: 30 }, // ✗ 0
        we25_m2: { winner: 'Kazuchika Okada',  confidence: 25 }, // ✗ 0
        we25_m3: { winner: 'Kris Statlander',  confidence: 25 }, // ✓ 32.5
        we25_m4: { winner: 'FTR',              confidence: 20 }, // ✓ 26
      },
      pointsEarned: 58.5,
      correctPicks: 2,
    },
  },

  // ── ThunderLiz — average picker, strong on later AEW events ─────────────
  ThunderLiz: {
    'Crown Jewel 2025': {
      choices: {
        cj25_m1: { winner: 'Bronson Reed',    confidence: 20 }, // ✓ 26
        cj25_m2: { winner: 'AJ Styles',        confidence: 30 }, // ✗ 0
        cj25_m3: { winner: 'Stephanie Vaquer', confidence: 25 }, // ✓ 37.5
        cj25_m4: { winner: 'Cody Rhodes',      confidence: 25 }, // ✗ 0
      },
      pointsEarned: 63.5,
      correctPicks: 2,
    },
    'Survivor Series 2025': {
      choices: {
        ss25_m1: { winner: 'Team AJ Lee',        confidence: 25 }, // ✓ 37.5
        ss25_m2: { winner: 'John Cena',          confidence: 30 }, // ✗ 0
        ss25_m3: { winner: 'Stephanie Vaquer',   confidence: 25 }, // ✓ 32.5
        ss25_m4: { winner: 'Team Drew McIntyre', confidence: 20 }, // ✓ 30
      },
      pointsEarned: 100,
      correctPicks: 3,
    },
    'Royal Rumble 2026': {
      choices: {
        rr26_m1: { winner: 'Sami Zayn',       confidence: 30 }, // ✗ 0
        rr26_m2: { winner: 'Gunther',          confidence: 25 }, // ✓ 32.5
        rr26_m3: { winner: 'Roman Reigns',     confidence: 25 }, // ✓ 50
        rr26_m4: { winner: 'Tiffany Stratton', confidence: 20 }, // ✗ 0
      },
      pointsEarned: 82.5,
      correctPicks: 2,
    },
    'WrestleDream 2025': {
      choices: {
        wd25_m1: { winner: '"Hangman" Adam Page', confidence: 30 }, // ✓ 45
        wd25_m2: { winner: 'Jon Moxley',          confidence: 25 }, // ✗ 0
        wd25_m3: { winner: 'Kris Statlander',     confidence: 25 }, // ✓ 32.5
        wd25_m4: { winner: 'Mark Briscoe',        confidence: 20 }, // ✗ 0
      },
      pointsEarned: 77.5,
      correctPicks: 2,
    },
    'Full Gear 2025': {
      choices: {
        fg25_m1: { winner: '"Hangman" Adam Page', confidence: 30 }, // ✗ 0
        fg25_m2: { winner: 'Kris Statlander',     confidence: 25 }, // ✓ 32.5
        fg25_m3: { winner: 'Kyle Fletcher',       confidence: 25 }, // ✗ 0
        fg25_m4: { winner: 'FTR',                 confidence: 20 }, // ✓ 26
      },
      pointsEarned: 58.5,
      correctPicks: 2,
    },
    'Worlds End 2025': {
      choices: {
        we25_m1: { winner: 'MJF',              confidence: 25 }, // ✓ 50
        we25_m2: { winner: 'Jon Moxley',       confidence: 25 }, // ✓ 37.5
        we25_m3: { winner: 'Kris Statlander',  confidence: 30 }, // ✓ 39
        we25_m4: { winner: 'Bang Bang Gang',   confidence: 20 }, // ✗ 0
      },
      pointsEarned: 126.5,
      correctPicks: 3,
    },
  },

  // ── PhilippPaulius — always picks wrong ──────────────────────────────────
  PhilippPaulius: {
    'Crown Jewel 2025': {
      choices: {
        cj25_m1: { winner: 'Roman Reigns',     confidence: 35 }, // ✗ 0
        cj25_m2: { winner: 'AJ Styles',         confidence: 25 }, // ✗ 0
        cj25_m3: { winner: 'Tiffany Stratton',  confidence: 25 }, // ✗ 0
        cj25_m4: { winner: 'Cody Rhodes',       confidence: 15 }, // ✗ 0
      },
      pointsEarned: 0,
      correctPicks: 0,
    },
    'Survivor Series 2025': {
      choices: {
        ss25_m1: { winner: 'Team Becky Lynch',   confidence: 30 }, // ✗ 0
        ss25_m2: { winner: 'John Cena',          confidence: 25 }, // ✗ 0
        ss25_m3: { winner: 'Nikki Bella',        confidence: 25 }, // ✗ 0
        ss25_m4: { winner: 'Team Cody Rhodes',   confidence: 20 }, // ✗ 0
      },
      pointsEarned: 0,
      correctPicks: 0,
    },
    'Royal Rumble 2026': {
      choices: {
        rr26_m1: { winner: 'Sami Zayn',       confidence: 30 }, // ✗ 0
        rr26_m2: { winner: 'AJ Styles',        confidence: 25 }, // ✗ 0
        rr26_m3: { winner: 'CM Punk',          confidence: 25 }, // ✗ 0
        rr26_m4: { winner: 'Bianca Belair',    confidence: 20 }, // ✗ 0
      },
      pointsEarned: 0,
      correctPicks: 0,
    },
    'WrestleDream 2025': {
      choices: {
        wd25_m1: { winner: 'Samoa Joe',        confidence: 25 }, // ✗ 0
        wd25_m2: { winner: 'Jon Moxley',       confidence: 30 }, // ✗ 0
        wd25_m3: { winner: 'Toni Storm',       confidence: 25 }, // ✗ 0
        wd25_m4: { winner: 'Mark Briscoe',     confidence: 20 }, // ✗ 0
      },
      pointsEarned: 0,
      correctPicks: 0,
    },
    'Full Gear 2025': {
      choices: {
        fg25_m1: { winner: '"Hangman" Adam Page', confidence: 25 }, // ✗ 0
        fg25_m2: { winner: 'Mercedes Moné',       confidence: 30 }, // ✗ 0
        fg25_m3: { winner: 'Kyle Fletcher',       confidence: 25 }, // ✗ 0
        fg25_m4: { winner: 'Brodido (Bandido & Brody Lee)', confidence: 20 }, // ✗ 0
      },
      pointsEarned: 0,
      correctPicks: 0,
    },
    'Worlds End 2025': {
      choices: {
        we25_m1: { winner: 'Samoa Joe',        confidence: 30 }, // ✗ 0
        we25_m2: { winner: 'Kazuchika Okada',  confidence: 25 }, // ✗ 0
        we25_m3: { winner: 'Jamie Hayter',     confidence: 25 }, // ✗ 0
        we25_m4: { winner: 'Bang Bang Gang',   confidence: 20 }, // ✗ 0
      },
      pointsEarned: 0,
      correctPicks: 0,
    },
  },
};

// Admin picks (solid but not perfect)
const ADMIN_PICKS = {
  'Crown Jewel 2025': {
    choices: {
      cj25_m1: { winner: 'Roman Reigns',     confidence: 25 }, // ✗ 0
      cj25_m2: { winner: 'John Cena',         confidence: 30 }, // ✓ 45
      cj25_m3: { winner: 'Stephanie Vaquer',  confidence: 25 }, // ✓ 37.5
      cj25_m4: { winner: 'Cody Rhodes',       confidence: 20 }, // ✗ 0
    },
    pointsEarned: 82.5,
    correctPicks: 2,
  },
  'Survivor Series 2025': {
    choices: {
      ss25_m1: { winner: 'Team AJ Lee',        confidence: 25 }, // ✓ 37.5
      ss25_m2: { winner: 'Dominik Mysterio',   confidence: 25 }, // ✓ 37.5
      ss25_m3: { winner: 'Stephanie Vaquer',   confidence: 25 }, // ✓ 32.5
      ss25_m4: { winner: 'Team Drew McIntyre', confidence: 25 }, // ✓ 37.5
    },
    pointsEarned: 145,
    correctPicks: 4,
  },
  'Royal Rumble 2026': {
    choices: {
      rr26_m1: { winner: 'Drew McIntyre',   confidence: 30 }, // ✓ 45
      rr26_m2: { winner: 'Gunther',          confidence: 25 }, // ✓ 32.5
      rr26_m3: { winner: 'CM Punk',          confidence: 25 }, // ✗ 0
      rr26_m4: { winner: 'Tiffany Stratton', confidence: 20 }, // ✗ 0
    },
    pointsEarned: 77.5,
    correctPicks: 2,
  },
  'WrestleDream 2025': {
    choices: {
      wd25_m1: { winner: '"Hangman" Adam Page', confidence: 30 }, // ✓ 45
      wd25_m2: { winner: 'Darby Allin',         confidence: 25 }, // ✓ 32.5
      wd25_m3: { winner: 'Kris Statlander',     confidence: 25 }, // ✓ 32.5
      wd25_m4: { winner: 'Kyle Fletcher',       confidence: 20 }, // ✓ 26
    },
    pointsEarned: 136,
    correctPicks: 4,
  },
  'Full Gear 2025': {
    choices: {
      fg25_m1: { winner: 'Samoa Joe',        confidence: 30 }, // ✓ 45
      fg25_m2: { winner: 'Kris Statlander',  confidence: 25 }, // ✓ 32.5
      fg25_m3: { winner: 'Mark Briscoe',     confidence: 25 }, // ✓ 32.5
      fg25_m4: { winner: 'FTR',              confidence: 20 }, // ✓ 26
    },
    pointsEarned: 136,
    correctPicks: 4,
  },
  'Worlds End 2025': {
    choices: {
      we25_m1: { winner: 'MJF',              confidence: 30 }, // ✓ 60
      we25_m2: { winner: 'Jon Moxley',       confidence: 25 }, // ✓ 37.5
      we25_m3: { winner: 'Kris Statlander',  confidence: 25 }, // ✓ 32.5
      we25_m4: { winner: 'FTR',              confidence: 20 }, // ✓ 26
    },
    pointsEarned: 156,
    correctPicks: 4,
  },
};

// Test user picks (average)
const TEST_PICKS = {
  'Crown Jewel 2025': {
    choices: {
      cj25_m1: { winner: 'Bronson Reed',     confidence: 20 }, // ✓ 26
      cj25_m2: { winner: 'John Cena',         confidence: 25 }, // ✓ 37.5
      cj25_m3: { winner: 'Stephanie Vaquer',  confidence: 30 }, // ✓ 45
      cj25_m4: { winner: 'Cody Rhodes',       confidence: 25 }, // ✗ 0
    },
    pointsEarned: 108.5,
    correctPicks: 3,
  },
  'Survivor Series 2025': {
    choices: {
      ss25_m1: { winner: 'Team Becky Lynch',   confidence: 25 }, // ✗ 0
      ss25_m2: { winner: 'John Cena',          confidence: 30 }, // ✗ 0
      ss25_m3: { winner: 'Stephanie Vaquer',   confidence: 25 }, // ✓ 32.5
      ss25_m4: { winner: 'Team Drew McIntyre', confidence: 20 }, // ✓ 30
    },
    pointsEarned: 62.5,
    correctPicks: 2,
  },
  'Royal Rumble 2026': {
    choices: {
      rr26_m1: { winner: 'Drew McIntyre',   confidence: 30 }, // ✓ 45
      rr26_m2: { winner: 'Gunther',          confidence: 25 }, // ✓ 32.5
      rr26_m3: { winner: 'CM Punk',          confidence: 25 }, // ✗ 0
      rr26_m4: { winner: 'Tiffany Stratton', confidence: 20 }, // ✗ 0
    },
    pointsEarned: 77.5,
    correctPicks: 2,
  },
  'WrestleDream 2025': {
    choices: {
      wd25_m1: { winner: '"Hangman" Adam Page', confidence: 25 }, // ✓ 37.5
      wd25_m2: { winner: 'Jon Moxley',          confidence: 30 }, // ✗ 0
      wd25_m3: { winner: 'Kris Statlander',     confidence: 25 }, // ✓ 32.5
      wd25_m4: { winner: 'Kyle Fletcher',       confidence: 20 }, // ✓ 26
    },
    pointsEarned: 96,
    correctPicks: 3,
  },
  'Full Gear 2025': {
    choices: {
      fg25_m1: { winner: '"Hangman" Adam Page', confidence: 25 }, // ✗ 0
      fg25_m2: { winner: 'Kris Statlander',     confidence: 30 }, // ✓ 39
      fg25_m3: { winner: 'Kyle Fletcher',       confidence: 25 }, // ✗ 0
      fg25_m4: { winner: 'Brodido (Bandido & Brody Lee)', confidence: 20 }, // ✗ 0
    },
    pointsEarned: 39,
    correctPicks: 1,
  },
  'Worlds End 2025': {
    choices: {
      we25_m1: { winner: 'Swerve Strickland', confidence: 25 }, // ✗ 0
      we25_m2: { winner: 'Jon Moxley',         confidence: 25 }, // ✓ 37.5
      we25_m3: { winner: 'Kris Statlander',    confidence: 30 }, // ✓ 39
      we25_m4: { winner: 'FTR',                confidence: 20 }, // ✓ 26
    },
    pointsEarned: 102.5,
    correctPicks: 3,
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function ensureUser(email, password, displayName) {
  const existing = await userRepository.findUserByEmail(email);
  if (existing) return existing;
  return await userRepository.createUser({ email, password, displayName, isAdmin: false });
}

async function ensureEvent(admin, eventDef) {
  const allEvents = await eventRepository.findAllEvents({ includeMatches: false });
  const existing = allEvents.find(e => e.name === eventDef.name);

  if (existing) {
    if (existing.scored) {
      // Already properly seeded — return as is
      return await eventRepository.findEventById(existing.id, true);
    }
    // Unscored (e.g. created by 002_test_data.js with placeholder data)
    // Delete and recreate with correct match data
    await eventRepository.deleteEvent(existing.id);
  }

  const event = await eventRepository.createEvent({
    name: eventDef.name,
    brand: eventDef.brand,
    date: eventDef.date,
    createdBy: admin.id,
    matches: eventDef.matches,
  });

  // Set winners on matches (they were created via createEvent above, which
  // passes winner from match definition directly)
  await query(
    `UPDATE events SET locked = true, scored = true, scored_at = $2, updated_at = $2 WHERE id = $1`,
    [event.id, eventDef.scoredAt],
  );

  return await eventRepository.findEventById(event.id, true);
}

async function seedPickForUser(client, eventId, userId, pickData, submittedAt) {
  const pickResult = await client.query(`
    INSERT INTO picks (event_id, user_id, total_confidence, version, points_earned, correct_picks, submitted_at, created_at, updated_at)
    VALUES ($1, $2, 100, 2, $3, $4, $5, $5, $5)
    ON CONFLICT (event_id, user_id) DO NOTHING
    RETURNING id
  `, [eventId, userId, pickData.pointsEarned, pickData.correctPicks, submittedAt]);

  const pickId = pickResult.rows[0]?.id;
  if (!pickId) return false; // Already existed

  for (const [matchId, choice] of Object.entries(pickData.choices)) {
    await client.query(`
      INSERT INTO pick_choices (pick_id, match_id, winner, confidence)
      VALUES ($1, $2, $3, $4)
    `, [pickId, matchId, choice.winner, choice.confidence]);
  }

  return true;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function seedLeaderboardData() {
  try {
    await connectPostgres();
    console.log('Seeding leaderboard demo data (real events)...\n');

    // Admin user (required)
    const admin = await userRepository.findUserByEmail(
      process.env.ADMIN_EMAIL || 'admin@wrestleguess.com',
    );
    if (!admin) {
      console.error('Admin user not found. Run 001_admin_user.js first.');
      process.exit(1);
    }
    console.log('✓ Admin user found:', admin.email);

    // Test user (optional — created by 002_test_data.js)
    const testUser = await userRepository.findUserByEmail('test@wrestleguess.com');
    if (testUser) console.log('✓ Test user found:', testUser.email);

    // Fake users
    const fakeUserDefs = [
      { email: 'gunter.fan99@example.com',      password: 'Demo1234!', displayName: 'GunterFan99' },
      { email: 'wrestling.watcher@example.com', password: 'Demo1234!', displayName: 'WrestlingWatcher' },
      { email: 'kayden.bryant@example.com',     password: 'Demo1234!', displayName: 'KaydenBryant' },
      { email: 'philipp.paulus@example.com',    password: 'Demo1234!', displayName: 'PhilippPaulius' },
      { email: 'macho.fan@example.com',         password: 'Demo1234!', displayName: 'MachoFan' },
      { email: 'dean.delisle@example.com',      password: 'Demo1234!', displayName: 'DeanDelisle' },
      { email: 'thunder.liz@example.com',       password: 'Demo1234!', displayName: 'ThunderLiz' },
    ];

    const fakeUsers = {};
    for (const def of fakeUserDefs) {
      const user = await ensureUser(def.email, def.password, def.displayName);
      fakeUsers[def.displayName] = user;
      console.log(`✓ User ready: ${user.display_name}`);
    }
    console.log();

    // Events
    const events = {};
    for (const eventDef of EVENTS) {
      const event = await ensureEvent(admin, eventDef);
      events[eventDef.name] = event;
      const status = event.scored ? 'scored' : 'NOT scored!';
      console.log(`✓ Event ready: ${event.name} (${status})`);
    }
    console.log();

    // Picks (one transaction per user per event for atomicity)
    const client = await getClient();
    let picksCreated = 0;
    let picksSkipped = 0;

    try {
      await client.query('BEGIN');

      for (const eventDef of EVENTS) {
        const event = events[eventDef.name];
        // 1 hour before event start
        const submittedAt = new Date(eventDef.date.getTime() - 3600_000);

        // Admin
        const adminPickData = ADMIN_PICKS[eventDef.name];
        if (adminPickData) {
          const ok = await seedPickForUser(client, event.id, admin.id, adminPickData, submittedAt);
          ok ? picksCreated++ : picksSkipped++;
        }

        // Test user
        if (testUser) {
          const testPickData = TEST_PICKS[eventDef.name];
          if (testPickData) {
            const ok = await seedPickForUser(client, event.id, testUser.id, testPickData, submittedAt);
            ok ? picksCreated++ : picksSkipped++;
          }
        }

        // Fake users
        for (const [displayName, picksByEvent] of Object.entries(USER_PICKS)) {
          const user = fakeUsers[displayName];
          if (!user) continue;
          const pickData = picksByEvent[eventDef.name];
          if (!pickData) continue;
          const ok = await seedPickForUser(client, event.id, user.id, pickData, submittedAt);
          ok ? picksCreated++ : picksSkipped++;
        }
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    console.log(`✓ Picks created: ${picksCreated}  skipped (already existed): ${picksSkipped}`);
    console.log();
    console.log('════════════════════════════════════════════════════════════');
    console.log('✓ Leaderboard seed complete!\n');
    console.log('Expected global standings (approximate):');
    console.log('  1. MachoFan          ~782 pts  (6 events, avg ~130)');
    console.log('  2. DeanDelisle       ~744 pts  (6 events, avg ~124)');
    console.log('  3. Admin             ~733 pts  (6 events, avg ~122)');
    console.log('  4. KaydenBryant      ~621 pts  (6 events, avg ~104)');
    console.log('  5. ThunderLiz        ~508 pts  (6 events, avg ~85)');
    console.log('  6. GunterFan99       ~488 pts  (6 events, avg ~81)');
    console.log('  7. Test User         ~486 pts  (6 events, avg ~81)');
    console.log('  8. WrestlingWatcher  ~352 pts  (6 events, avg ~59)');
    console.log('  9. PhilippPaulius      0 pts  (6 events, avg   0)');
    console.log('════════════════════════════════════════════════════════════');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedLeaderboardData();
