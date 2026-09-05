import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedDatabase } from './services/seedService.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dealflow360';

async function runSeed() {
  try {
    console.log(`🔌 Connecting to local MongoDB: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log(`🌱 Seeding local database...`);
    await seedDatabase();
    console.log(`✨ Seeding completed successfully! You can now run the app offline.`);
    process.exit(0);
  } catch (err) {
    console.error(`❌ Seeding failed:`, err.message);
    process.exit(1);
  }
}

runSeed();
