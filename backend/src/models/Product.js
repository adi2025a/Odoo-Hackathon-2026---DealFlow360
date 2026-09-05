import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Hardware', 'Services', 'Subscriptions'],
    required: true 
  },
  unitPrice: { type: Number, required: true },
  unitCost: { type: Number, required: true },
  unit: { type: String, default: 'unit' },
  taxPercent: { type: Number, default: 18 },
  description: { type: String },
  isPromoted: { type: Boolean, default: false },
  promoTag: { type: String, default: '' },
  pairedProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  minMarginThreshold: { type: Number, default: 20 }, // Min 20% margin for upsell eligibility
  variants: [{
    attribute: String,
    value: String,
    extraPrice: Number
  }]
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
