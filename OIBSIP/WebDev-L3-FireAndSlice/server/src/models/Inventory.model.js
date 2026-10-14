import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['base', 'sauce', 'cheese', 'vegetable']
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    default: 'units'
  },
  threshold: {
    type: Number,
    required: true,
    default: 20
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

inventorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Inventory', inventorySchema);
