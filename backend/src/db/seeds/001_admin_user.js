import dotenv from 'dotenv';
import * as userRepository from '../../repositories/userRepository.js';
import { connectPostgres } from '../../config/postgres.js';
import User from '../../models/User.js';
import connectMongoDB from '../../config/mongodb.js';

dotenv.config();

async function seedAdminUser() {
  try {
    // Connect to databases
    await connectPostgres();
    await connectMongoDB();

    console.log('Seeding admin user...');

    // Find existing admin in MongoDB
    const mongoAdmin = await User.findOne({ isAdmin: true }).select('+password');

    if (!mongoAdmin) {
      console.log('No admin user found in MongoDB. Creating new admin.');

      // Create new admin in PostgreSQL
      const admin = await userRepository.createUser({
        email: process.env.ADMIN_EMAIL || 'admin@wrestleguess.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        displayName: 'Admin',
        isAdmin: true
      });

      console.log('Admin user created:', admin.email);
      console.log('Admin UUID:', admin.id);
    } else {
      console.log('Found MongoDB admin:', mongoAdmin.email);

      // Check if already exists in PostgreSQL
      const pgAdmin = await userRepository.findUserByEmail(mongoAdmin.email);

      if (pgAdmin) {
        console.log('Admin already exists in PostgreSQL:', pgAdmin.id);
      } else {
        // Create admin in PostgreSQL with same credentials
        const admin = await userRepository.createUser({
          email: mongoAdmin.email,
          password: process.env.ADMIN_PASSWORD || 'admin123', // Need to reset password
          displayName: mongoAdmin.displayName,
          isAdmin: true
        });

        console.log('Migrated admin user to PostgreSQL');
        console.log('Email:', admin.email);
        console.log('UUID:', admin.id);
        console.log('NOTE: Password has been reset. Please use:', process.env.ADMIN_PASSWORD || 'admin123');
      }
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedAdminUser();
