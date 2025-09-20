const mongoose = require('mongoose');

const cropRecommendationSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true
  },
  inputData: {
    soilData: {
      ph: { type: Number, required: true },
      nitrogen: { type: Number, required: true },
      phosphorus: { type: Number, required: true },
      potassium: { type: Number, required: true },
      organicMatter: { type: Number, required: true },
      moisture: { type: Number, required: true },
      temperature: { type: Number, required: true }
    },
    weatherData: {
      location: String,
      temperature: {
        current: Number,
        min: Number,
        max: Number
      },
      humidity: Number,
      rainfall: Number,
      forecast: [{
        date: Date,
        temperature: { min: Number, max: Number },
        rainfall: Number,
        humidity: Number,
        conditions: String
      }]
    },
    marketData: [{
      crop: String,
      currentPrice: Number,
      predictedPrice: Number,
      demand: { type: String, enum: ['low', 'medium', 'high'] },
      marketTrend: { type: String, enum: ['rising', 'falling', 'stable'] }
    }],
    location: {
      state: String,
      district: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    season: {
      type: String,
      enum: ['kharif', 'rabi', 'zaid'],
      required: true
    },
    farmArea: Number
  },
  recommendations: [{
    cropName: {
      type: String,
      required: true
    },
    hindiName: {
      type: String,
      required: true
    },
    scientificName: {
      type: String
    },
    suitability: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    expectedYield: {
      type: Number, // kg per acre
      required: true
    },
    estimatedProfit: {
      type: Number, // INR per acre
      required: true
    },
    growthDuration: {
      type: Number, // days
      required: true
    },
    waterRequirement: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true
    },
    fertilizer: [{
      name: String,
      quantity: String,
      applicationTime: String
    }],
    benefits: [String],
    risks: [String],
    marketPrice: {
      current: Number,
      predicted: Number,
      trend: String
    },
    soilRequirements: {
      phRange: { min: Number, max: Number },
      nitrogenLevel: String,
      phosphorusLevel: String,
      potassiumLevel: String
    },
    seasonality: {
      plantingWindow: {
        start: String, // e.g., "June"
        end: String    // e.g., "July"
      },
      harvestWindow: {
        start: String,
        end: String
      }
    }
  }],
  modelVersion: {
    type: String,
    default: '1.0.0'
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    implemented: Boolean,
    actualYield: Number,
    actualProfit: Number,
    date: Date
  },
  status: {
    type: String,
    enum: ['pending', 'viewed', 'implemented', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes for better performance
cropRecommendationSchema.index({ farmerId: 1, createdAt: -1 });
cropRecommendationSchema.index({ farmId: 1, createdAt: -1 });
cropRecommendationSchema.index({ 'inputData.season': 1, 'inputData.location.state': 1 });
cropRecommendationSchema.index({ 'recommendations.cropName': 1 });
cropRecommendationSchema.index({ confidence: -1 });

// Get top N recommendations by suitability
cropRecommendationSchema.methods.getTopRecommendations = function(limit = 5) {
  return this.recommendations
    .sort((a, b) => b.suitability - a.suitability)
    .slice(0, limit);
};

// Calculate average confidence of all recommendations
cropRecommendationSchema.methods.getAverageConfidence = function() {
  if (this.recommendations.length === 0) return 0;
  const total = this.recommendations.reduce((sum, rec) => sum + rec.confidence, 0);
  return Math.round(total / this.recommendations.length);
};

// Update recommendation status
cropRecommendationSchema.methods.updateStatus = function(status, feedback = null) {
  this.status = status;
  if (feedback) {
    this.feedback = { ...feedback, date: new Date() };
  }
  return this.save();
};

// Static method to get recommendations by location and season
cropRecommendationSchema.statics.getRecommendationsByLocation = function(state, district, season, limit = 10) {
  return this.find({
    'inputData.location.state': state,
    'inputData.location.district': district,
    'inputData.season': season
  })
  .sort({ confidence: -1, createdAt: -1 })
  .limit(limit)
  .populate('farmerId', 'name location');
};

// Static method to get popular crops in a region
cropRecommendationSchema.statics.getPopularCrops = function(state, district, season) {
  return this.aggregate([
    {
      $match: {
        'inputData.location.state': state,
        'inputData.location.district': district,
        'inputData.season': season
      }
    },
    { $unwind: '$recommendations' },
    {
      $group: {
        _id: '$recommendations.cropName',
        count: { $sum: 1 },
        avgSuitability: { $avg: '$recommendations.suitability' },
        avgYield: { $avg: '$recommendations.expectedYield' },
        avgProfit: { $avg: '$recommendations.estimatedProfit' }
      }
    },
    { $sort: { count: -1, avgSuitability: -1 } },
    { $limit: 10 }
  ]);
};

module.exports = mongoose.model('CropRecommendation', cropRecommendationSchema);