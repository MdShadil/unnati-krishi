const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  response: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'voice', 'image'],
    default: 'text'
  },
  language: {
    type: String,
    enum: ['hindi', 'english', 'tamil', 'bengali', 'marathi', 'gujarati', 'kannada', 'telugu', 'punjabi', 'malayalam'],
    default: 'hindi'
  },
  context: {
    location: {
      state: String,
      district: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    cropType: String,
    season: String,
    soilData: {
      ph: Number,
      nitrogen: Number,
      phosphorus: Number,
      potassium: Number,
      organicMatter: Number,
      moisture: Number
    },
    weatherData: {
      temperature: Number,
      humidity: Number,
      rainfall: Number
    },
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm'
    }
  },
  intent: {
    type: String,
    enum: [
      'crop_recommendation',
      'disease_identification',
      'market_price_inquiry',
      'weather_forecast',
      'soil_analysis',
      'fertilizer_advice',
      'irrigation_guidance',
      'pest_control',
      'general_query',
      'farm_management'
    ]
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100
  },
  attachments: [{
    type: String,
    url: String,
    description: String,
    analysis: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  feedback: {
    helpful: Boolean,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: Date
  },
  isVoice: {
    type: Boolean,
    default: false
  },
  voiceData: {
    audioUrl: String,
    transcription: String,
    responseAudioUrl: String,
    duration: Number // in seconds
  },
  processingTime: {
    type: Number // in milliseconds
  },
  modelVersion: {
    type: String,
    default: '1.0.0'
  }
}, {
  timestamps: true
});

// Indexes for better performance
chatMessageSchema.index({ userId: 1, createdAt: -1 });
chatMessageSchema.index({ sessionId: 1, createdAt: 1 });
chatMessageSchema.index({ intent: 1, createdAt: -1 });
chatMessageSchema.index({ 'context.location.state': 1, 'context.location.district': 1 });
chatMessageSchema.index({ messageType: 1 });

// Static method to get chat sessions for a user
chatMessageSchema.statics.getChatSessions = function(userId, limit = 20) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$sessionId',
        lastMessage: { $last: '$message' },
        lastResponse: { $last: '$response' },
        messageCount: { $sum: 1 },
        lastActivity: { $last: '$createdAt' },
        firstActivity: { $first: '$createdAt' }
      }
    },
    { $sort: { lastActivity: -1 } },
    { $limit: limit }
  ]);
};

// Static method to get messages for a specific session
chatMessageSchema.statics.getSessionMessages = function(sessionId, limit = 50) {
  return this.find({ sessionId })
    .sort({ createdAt: 1 })
    .limit(limit)
    .populate('userId', 'name role language');
};

// Static method to get popular queries by intent
chatMessageSchema.statics.getPopularQueries = function(timeframe = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframe);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$intent',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$confidence' },
        avgProcessingTime: { $avg: '$processingTime' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
};

// Method to add feedback
chatMessageSchema.methods.addFeedback = function(feedbackData) {
  this.feedback = {
    ...feedbackData,
    date: new Date()
  };
  return this.save();
};

// Static method to get analytics data
chatMessageSchema.statics.getAnalytics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: null,
        totalQueries: { $sum: 1 },
        voiceQueries: { $sum: { $cond: ['$isVoice', 1, 0] } },
        avgConfidence: { $avg: '$confidence' },
        avgProcessingTime: { $avg: '$processingTime' },
        uniqueUsers: { $addToSet: '$userId' },
        intentDistribution: {
          $push: '$intent'
        }
      }
    },
    {
      $addFields: {
        uniqueUserCount: { $size: '$uniqueUsers' }
      }
    }
  ]);
};

module.exports = mongoose.model('ChatHistory', chatMessageSchema);