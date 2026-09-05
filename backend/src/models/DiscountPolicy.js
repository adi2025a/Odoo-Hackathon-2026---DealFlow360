import mongoose from 'mongoose';

const discountPolicySchema = new mongoose.Schema({
  customerTier: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold'],
    required: true,
    unique: true
  },
  maxOverallTierDiscount: { type: Number, required: true }, // e.g. Bronze=5%, Silver=10%, Gold=15%
  categoryCeilings: {
    Hardware: { type: Number, default: 15 },
    Services: { type: Number, default: 10 },
    Subscriptions: { type: Number, default: 20 }
  },
  managerApprovalScoreThreshold: { type: Number, default: 1 }, // Blended score > 0 -> Manager approval
  financeApprovalScoreThreshold: { type: Number, default: 25 }  // Blended score > 25 -> Manager + Finance
}, { timestamps: true });

export default mongoose.model('DiscountPolicy', discountPolicySchema);
