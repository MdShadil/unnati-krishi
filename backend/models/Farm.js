const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['seeds', 'fertilizer', 'pesticide', 'labor', 'irrigation', 'machinery', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    default: 1
  },
  unit: {
    type: String,
    default: 'piece'
  },
  date: {
    type: Date,
    default: Date.now
  },
  supplier: {
    type: String,
    trim: true
  },
  receipt: {
    type: String // file path for receipt image
  },
  notes: {
    type: String,
    trim: true
  }
}, { _id: true });

const cropFieldSchema = new mongoose.Schema({
  cropName: {
    type: String,
    required: true,
    trim: true
  },
  variety: {
    type: String,
    required: true,
    trim: true
  },
  area: {
    type: Number,
    required: true,
    min: 0.1 // minimum 0.1 acre
  },
  plantingDate: {
    type: Date,
    required: true
  },
  expectedHarvest: {
    type: Date,
    required: true
  },
  actualHarvest: {
    type: Date
  },
  stage: {
    type: String,
    enum: ['planted', 'germination', 'vegetative', 'flowering', 'maturity', 'harvested'],
    default: 'planted'
  },
  expenses: [expenseSchema],
  estimatedYield: {
    type: Number, // kg per acre
    required: true,
    min: 0
  },
  actualYield: {
    type: Number // kg per acre
  },
  marketPrice: {
    type: Number, // INR per kg
    default: 0
  },
  healthStatus: {
    type: String,
    enum: ['healthy', 'warning', 'disease', 'pest', 'drought'],
    default: 'healthy'
  },
  healthNotes: {
    type: String,
    trim: true
  },
  images: [{
    url: String,
    description: String,
    date: { type: Date, default: Date.now },
    analysis: {
      disease: String,
      confidence: Number,
      recommendations: [String]
    }
  }],
  soilData: {
    ph: Number,
    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
    organicMatter: Number,
    moisture: Number
  }
}, { _id: true, timestamps: true });

const farmSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  totalArea: {
    type: Number, // in acres
    required: true,
    min: 0.1
  },
  location: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: true,
        min: -90,
        max: 90
      },
      lng: {
        type: Number,
        required: true,
        min: -180,
        max: 180
      }
    },
    state: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      match: [/^[1-9][0-9]{5}$/, 'Please enter a valid Indian pincode']
    }
  },
  soilType: {
    type: String,
    enum: ['clay', 'sandy', 'loamy', 'black', 'red', 'alluvial', 'laterite'],
    required: true
  },
  irrigationType: {
    type: String,
    enum: ['rainfed', 'drip', 'sprinkler', 'flood', 'mixed'],
    default: 'rainfed'
  },
  waterSource: [{
    type: String,
    enum: ['borewell', 'canal', 'river', 'pond', 'rainwater']
  }],
  currentCrops: [cropFieldSchema],
  totalInvestment: {
    type: Number,
    default: 0
  },
  expectedRevenue: {
    type: Number,
    default: 0
  },
  actualRevenue: {
    type: Number,
    default: 0
  },
  profitMargin: {
    type: Number,
    default: 0
  },
  season: {
    type: String,
    enum: ['kharif', 'rabi', 'zaid'],
    default: 'kharif'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
farmSchema.index({ farmerId: 1 });
farmSchema.index({ 'location.state': 1, 'location.district': 1 });
farmSchema.index({ soilType: 1 });
farmSchema.index({ 'currentCrops.cropName': 1 });

// Calculate total investment from all crop expenses
farmSchema.methods.calculateTotalInvestment = function() {
  let total = 0;
  this.currentCrops.forEach(crop => {
    crop.expenses.forEach(expense => {
      total += expense.amount;
    });
  });
  this.totalInvestment = total;
  return total;
};

// Calculate expected revenue
farmSchema.methods.calculateExpectedRevenue = function() {
  let total = 0;
  this.currentCrops.forEach(crop => {
    const yieldValue = crop.estimatedYield * crop.area * (crop.marketPrice || 0);
    total += yieldValue;
  });
  this.expectedRevenue = total;
  return total;
};

// Calculate profit margin
farmSchema.methods.calculateProfitMargin = function() {
  const investment = this.calculateTotalInvestment();
  const revenue = this.calculateExpectedRevenue();
  this.profitMargin = revenue - investment;
  return this.profitMargin;
};

// Update profit calculations before saving
farmSchema.pre('save', function(next) {
  this.calculateTotalInvestment();
  this.calculateExpectedRevenue();
  this.calculateProfitMargin();
  next();
});

module.exports = mongoose.model('Farm', farmSchema);