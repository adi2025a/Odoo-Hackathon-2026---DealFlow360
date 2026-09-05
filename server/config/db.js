import mongoose from 'mongoose';
import { seedDatabase } from '../services/seedService.js';

export async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dealflow360';

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`✅ Connected to MongoDB Database at: ${conn.connection.host}/${conn.connection.name}`);

    // Auto-seed initial enterprise demo data if empty
    await seedDatabase();
    return conn;
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    console.warn(`💡 Tip: Ensure MONGO_URI environment variable is correctly configured.`);
  }
}
