import dotenv from 'dotenv';
import * as userRepository from '../../repositories/userRepository.js';
import * as leagueRepository from '../../repositories/leagueRepository.js';
import * as eventRepository from '../../repositories/eventRepository.js';
import * as pickRepository from '../../repositories/pickRepository.js';
import { connectPostgres } from '../../config/postgres.js';

dotenv.config();

async function seedTestData() {
  try {
    await connectPostgres();
    console.log('Seeding test data...\n');

    // 1. Get admin user
    const admin = await userRepository.findUserByEmail(
      process.env.ADMIN_EMAIL || 'admin@wrestleguess.com'
    );

    if (!admin) {
      console.error('Admin user not found. Run 001_admin_user.js first.');
      process.exit(1);
    }

    console.log('✓ Admin user found:', admin.email);

    // 2. Create test user
    let testUser;
    const testEmail = 'test@wrestleguess.com';
    const existingTestUser = await userRepository.findUserByEmail(testEmail);

    if (existingTestUser) {
      testUser = existingTestUser;
      console.log('✓ Test user already exists:', testUser.email);
    } else {
      testUser = await userRepository.createUser({
        email: testEmail,
        password: 'test123',
        displayName: 'Test User',
        isAdmin: false
      });
      console.log('✓ Test user created:', testUser.email);
    }

    console.log('  Test user UUID:', testUser.id);
    console.log('  Login credentials: test@wrestleguess.com / test123\n');

    // 3. Create test league
    let league;
    const existingLeagues = await leagueRepository.getLeaguesByCreator(admin.id);
    const testLeague = existingLeagues.find(l => l.name === 'Test League');

    if (testLeague) {
      league = testLeague;
      console.log('✓ Test league already exists:', league.name);
    } else {
      league = await leagueRepository.createLeague({
        name: 'Test League',
        description: 'A test league for trying out WrestleGuess',
        createdBy: admin.id,
        settings: {
          public: true,
          allowJoinRequests: true
        }
      });
      console.log('✓ Test league created:', league.name);
    }

    console.log('  League UUID:', league.id);

    // 4. Add test user to league (if not already a member)
    const leagueMembers = await leagueRepository.getLeagueMembers(league.id);
    const testUserIsMember = leagueMembers.some(m => m.userId === testUser.id);

    if (!testUserIsMember) {
      await leagueRepository.addMemberToLeague({
        leagueId: league.id,
        userId: testUser.id,
        role: 'member'
      });
      console.log('✓ Test user added to league\n');
    } else {
      console.log('✓ Test user already in league\n');
    }

    // 5. Create upcoming wrestling event (Royal Rumble 2026)
    const existingEvents = await eventRepository.findAllEvents({ includeMatches: true });
    const royalRumble = existingEvents.find(e => e.name === 'Royal Rumble 2026');

    let event;
    if (royalRumble) {
      event = royalRumble;
      console.log('✓ Royal Rumble event already exists');
    } else {
      event = await eventRepository.createEvent({
        name: 'Royal Rumble 2026',
        brand: 'WWE',
        date: new Date('2026-02-28'),
        createdBy: admin.id,
        matches: [
          {
            matchId: 'match1',
            type: 'Singles',
            titleMatch: true,
            competitors: ['Roman Reigns', 'Cody Rhodes'],
            multiplier: 1.5,
            match_order: 0
          },
          {
            matchId: 'match2',
            type: 'Singles',
            titleMatch: true,
            competitors: ['Rhea Ripley', 'Becky Lynch'],
            multiplier: 1.5,
            match_order: 1
          },
          {
            matchId: 'match3',
            type: 'Tag Team',
            titleMatch: true,
            competitors: ['The Usos', 'Judgment Day'],
            multiplier: 1.3,
            match_order: 2
          },
          {
            matchId: 'match4',
            type: 'Royal Rumble',
            titleMatch: false,
            competitors: [
              'CM Punk', 'Drew McIntyre', 'Seth Rollins', 'Gunther',
              'LA Knight', 'Randy Orton', 'Kevin Owens', 'Sami Zayn',
              'Damian Priest', 'Finn Balor', 'plus 20 more'
            ],
            multiplier: 2.0,
            match_order: 3
          },
          {
            matchId: 'match5',
            type: 'Royal Rumble',
            titleMatch: false,
            competitors: [
              'Liv Morgan', 'Bianca Belair', 'Jade Cargill', 'Bayley',
              'Iyo Sky', 'Naomi', 'Tiffany Stratton', 'Chelsea Green',
              'Piper Niven', 'Zoey Stark', 'plus 20 more'
            ],
            multiplier: 2.0,
            match_order: 4
          }
        ]
      });
      console.log('✓ Royal Rumble 2026 event created');
    }

    console.log('  Event UUID:', event.id);
    console.log('  Event date:', new Date(event.date).toLocaleDateString());
    console.log('  Matches:', event.matches.length, '\n');

    // 6. Create sample picks for test user
    const existingPick = await pickRepository.findPickByEventAndUser(event.id, testUser.id)
      .catch(() => null);

    if (existingPick) {
      console.log('✓ Test user picks already exist for this event\n');
    } else {
      await pickRepository.createOrUpdatePick({
        eventId: event.id,
        userId: testUser.id,
        totalConfidence: 100,
        choices: {
          match1: { winner: 'Cody Rhodes', confidence: 25 },
          match2: { winner: 'Rhea Ripley', confidence: 20 },
          match3: { winner: 'The Usos', confidence: 15 },
          match4: { winner: 'CM Punk', confidence: 30 },
          match5: { winner: 'Bianca Belair', confidence: 10 }
        }
      });
      console.log('✓ Sample picks created for test user\n');
    }

    // 7. Create admin picks
    const existingAdminPick = await pickRepository.findPickByEventAndUser(event.id, admin.id)
      .catch(() => null);

    if (existingAdminPick) {
      console.log('✓ Admin picks already exist for this event\n');
    } else {
      await pickRepository.createOrUpdatePick({
        eventId: event.id,
        userId: admin.id,
        totalConfidence: 100,
        choices: {
          match1: { winner: 'Roman Reigns', confidence: 30 },
          match2: { winner: 'Becky Lynch', confidence: 15 },
          match3: { winner: 'Judgment Day', confidence: 20 },
          match4: { winner: 'Drew McIntyre', confidence: 25 },
          match5: { winner: 'Liv Morgan', confidence: 10 }
        }
      });
      console.log('✓ Sample picks created for admin\n');
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('✓ Test data seeding complete!\n');
    console.log('Test User Login:');
    console.log('  Email: test@wrestleguess.com');
    console.log('  Password: test123\n');
    console.log('Admin Login:');
    console.log('  Email:', process.env.ADMIN_EMAIL || 'admin@wrestleguess.com');
    console.log('  Password:', process.env.ADMIN_PASSWORD || 'admin123\n');
    console.log('Database Access (on VPS):');
    console.log('  sudo -u postgres psql wrestleguess');
    console.log('  \\dt                    -- list tables');
    console.log('  SELECT * FROM users;   -- view users');
    console.log('  SELECT * FROM events;  -- view events');
    console.log('  \\q                     -- quit\n');
    console.log('═══════════════════════════════════════════════════════');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedTestData();
