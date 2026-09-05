import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { resetAndSeedDatabase } from './services/seedService.js';

dotenv.config();

async function runSeed() {
  console.log('🚀 Running manual database reset and seed...');
  await connectDB();
  await resetAndSeedDatabase();
  console.log('🎉 Manual seed finished!');
  process.exit(0);
}

runSeed();
