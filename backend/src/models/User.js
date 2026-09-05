import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, default: 'password123' },
  role: { 
    type: String, 
    enum: ['sales_rep', 'sales_manager', 'finance', 'customer', 'admin'],
    default: 'sales_rep'
  },
  customerTier: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'N/A'],
    default: 'Bronze'
  },
  company: { type: String, default: 'Internal Corp' },
  avatar: { type: String }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
