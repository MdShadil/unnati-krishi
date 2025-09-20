const mongoose = require('mongoose');

const cropImageSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm'
  },
  cropFieldId: {
    type: mongoose.Schema.Types.ObjectId
  },
  imageUrl: {
    type: String,
    required: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  cropType: {
    type: String,
    required: true,
    trim: true
  },
  imageMetadata: {
    width: Number,
    height: Number,
    capturedAt: Date,
    location: {
      lat: Number,
      lng: Number
    },
    weather: {
      temperature: Number,
      humidity: Number,
      conditions: String
    }
  },
  analysis: {
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    health: {
      type: String,
      enum: ['healthy', 'diseased', 'pest_damage', 'nutrient_deficiency', 'water_stress', 'unknown'],
      default: 'unknown'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    detectedIssues: [{
      type: {
        type: String,
        enum: [
          'fungal_disease',
          'bacterial_disease',
          'viral_disease',
          'insect_damage',
          'nutrient_deficiency',
          'water_stress',
          'weed_infestation',
          'physical_damage'
        ]
      },
      name: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      },
      confidence: {
        type: Number,
        min: 0,
        max: 100
      },
      description: String,
      affectedArea: {
        type: Number, // percentage of image showing the issue
        min: 0,
        max: 100
      }
    }],
    recommendations: [{
      category: {
        type: String,
        enum: ['treatment', 'prevention', 'fertilizer', 'irrigation', 'immediate_action']
      },
      action: String,
      description: String,
      urgency: {
        type: String,
        enum: ['low', 'medium', 'high', 'immediate'],
        default: 'medium'
      },
      cost: {
        min: Number,
        max: Number,
        currency: { type: String, default: 'INR' }
      },
      timeline: String // e.g., "Apply within 2-3 days"
    }],
    nutritionalStatus: {
      nitrogen: { type: String, enum: ['deficient', 'adequate', 'excess'] },
      phosphorus: { type: String, enum: ['deficient', 'adequate', 'excess'] },
      potassium: { type: String, enum: ['deficient', 'adequate', 'excess'] },
      micronutrients: [{
        nutrient: String,
        status: { type: String, enum: ['deficient', 'adequate', 'excess'] }
      }]
    },
    processingTime: Number, // milliseconds
    modelVersion: {
      type: String,
      default: '1.0.0'
    },
    processedAt: Date
  },
  expertReview: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    diagnosis: String,
    recommendations: [String],
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    notes: String,
    reviewedAt: Date
  },
  feedback: {
    farmerRating: {
      type: Number,
      min: 1,
      max: 5
    },
    accuracyRating: {
      type: Number,
      min: 1,
      max: 5
    },
    helpfulnessRating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    actionTaken: Boolean,
    outcome: String,
    submittedAt: Date
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
cropImageSchema.index({ farmerId: 1, createdAt: -1 });
cropImageSchema.index({ cropType: 1, 'analysis.health': 1 });
cropImageSchema.index({ 'analysis.status': 1 });
cropImageSchema.index({ 'analysis.detectedIssues.type': 1 });
cropImageSchema.index({ farmId: 1, cropFieldId: 1 });

// Method to update analysis results
cropImageSchema.methods.updateAnalysis = function(analysisResults) {
  this.analysis = {
    ...this.analysis,
    ...analysisResults,
    status: 'completed',
    processedAt: new Date()
  };
  return this.save();
};

// Method to add expert review
cropImageSchema.methods.addExpertReview = function(expertId, review) {
  this.expertReview = {
    reviewedBy: expertId,
    ...review,
    reviewedAt: new Date()
  };
  return this.save();
};

// Static method to get images by health status
cropImageSchema.statics.getImagesByHealth = function(healthStatus, limit = 20) {
  return this.find({ 'analysis.health': healthStatus })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('farmerId', 'name location');
};

// Static method to get analytics for crop health
cropImageSchema.statics.getCropHealthAnalytics = function(timeframe = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframe);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          cropType: '$cropType',
          health: '$analysis.health'
        },
        count: { $sum: 1 },
        avgConfidence: { $avg: '$analysis.confidence' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Static method to get disease trends
cropImageSchema.statics.getDiseaseTrends = function(cropType, region) {
  const matchConditions = { 'analysis.detectedIssues.0': { $exists: true } };
  
  if (cropType) {
    matchConditions.cropType = cropType;
  }
  
  return this.aggregate([
    { $match: matchConditions },
    { $unwind: '$analysis.detectedIssues' },
    {
      $group: {
        _id: {
          issueType: '$analysis.detectedIssues.type',
          issueName: '$analysis.detectedIssues.name',
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' }
        },
        count: { $sum: 1 },
        avgSeverity: { $avg: '$analysis.detectedIssues.severity' },
        avgConfidence: { $avg: '$analysis.detectedIssues.confidence' }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1, count: -1 } }
  ]);
};

// Method to get similar images
cropImageSchema.methods.getSimilarImages = function(limit = 5) {
  const conditions = {
    _id: { $ne: this._id },
    cropType: this.cropType
  };
  
  if (this.analysis.detectedIssues.length > 0) {
    conditions['analysis.detectedIssues.type'] = {
      $in: this.analysis.detectedIssues.map(issue => issue.type)
    };
  }
  
  return this.constructor.find(conditions)
    .sort({ 'analysis.confidence': -1, createdAt: -1 })
    .limit(limit)
    .populate('farmerId', 'name location');
};

module.exports = mongoose.model('CropImage', cropImageSchema);