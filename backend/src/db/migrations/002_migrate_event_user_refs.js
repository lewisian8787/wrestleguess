import dotenv from 'dotenv';
import connectMongoDB from '../../config/mongodb.js';
import { connectPostgres } from '../../config/postgres.js';
import * as userRepository from '../../repositories/userRepository.js';
import Event from '../../models/Event.js';
import Pick from '../../models/Pick.js';

dotenv.config();

async function migrateEventReferences() {
  try {
    await connectPostgres();
    await connectMongoDB();

    console.log('Migrating Event and Pick user references...');

    // Get all PostgreSQL users
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@wrestleguess.com';
    const admin = await userRepository.findUserByEmail(adminEmail);

    if (!admin) {
      throw new Error('Admin user not found in PostgreSQL. Run seed first.');
    }

    console.log('Admin UUID:', admin.id);

    // Update all events to use admin UUID
    const events = await Event.find({ createdBy: { $exists: true } });
    console.log(`Found ${events.length} events to migrate`);

    for (const event of events) {
      event.createdBy = admin.id; // Set to UUID
      await event.save();
      console.log(`Updated event: ${event.name}`);
    }

    // Update all picks to use UUID (if any exist)
    const picks = await Pick.find({});
    console.log(`Found ${picks.length} picks to migrate`);

    for (const pick of picks) {
      // For now, set to admin UUID (you'll need to map old ObjectIds to new UUIDs)
      pick.user = admin.id;
      await pick.save();
      console.log(`Updated pick for event: ${pick.event}`);
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrateEventReferences();
