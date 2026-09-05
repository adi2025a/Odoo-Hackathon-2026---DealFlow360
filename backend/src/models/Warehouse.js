import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  shippingCostWeight: { type: Number, default: 10 }, // Shipping cost weighting factor
  inventory: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    stockLevel: { type: Number, default: 0 },
    minReplenishment: { type: Number, default: 10 }
  }]
}, { timestamps: true });

export default mongoose.model('Warehouse', warehouseSchema);
