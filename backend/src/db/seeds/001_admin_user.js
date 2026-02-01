import dotenv from 'dotenv';
import * as userRepository from '../../repositories/userRepository.js';
import { connectPostgres } from '../../config/postgres.js';

dotenv.config();

async function seedAdminUser() {
  try {
    await connectPostgres();
    console.log('Seeding admin user...');

    // Check if admin already exists
    const existingAdmin = await userRepository.findUserByEmail(
      process.env.ADMIN_EMAIL || 'admin@wrestleguess.com'
    );

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      console.log('Admin UUID:', existingAdmin.id);
    } else {
      // Create new admin in PostgreSQL
      const admin = await userRepository.createUser({
        email: process.env.ADMIN_EMAIL || 'admin@wrestleguess.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        displayName: 'Admin',
        isAdmin: true
      });

      console.log('Admin user created:', admin.email);
      console.log('Admin UUID:', admin.id);
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedAdminUser();
