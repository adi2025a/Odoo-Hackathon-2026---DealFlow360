import mongoose from 'mongoose';
import { seedDatabase } from '../services/seedService.js';

export async function connectDB() {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dealflow360';
    await mongoose.connect(mongoURI);
    console.log('🍃 MongoDB Connected Successfully!');
    
    // Auto-seed demo database if empty
    await seedDatabase();
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
  }
}
