const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxLength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['farmer', 'expert'],
    required: [true, 'Role is required'],
    default: 'farmer'
  },
  location: {
    state: {
      type: String,
      required: [true, 'State is required']
    },
    district: {
      type: String,
      required: [true, 'District is required']
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  language: {
    type: String,
    enum: ['hindi', 'english', 'tamil', 'bengali', 'marathi', 'gujarati', 'kannada', 'telugu', 'punjabi', 'malayalam'],
    default: 'hindi'
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  // Farmer-specific fields
  farmingExperience: {
    type: Number, // years of experience
    min: 0,
    max: 80
  },
  farmSize: {
    type: Number, // in acres
    min: 0
  },
  // Expert-specific fields
  expertise: [{
    type: String,
    enum: ['soil', 'crops', 'disease', 'market', 'weather', 'organic', 'irrigation']
  }],
  certification: {
    type: String
  },
  consultationRate: {
    type: Number, // per hour in INR
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1, 'location.state': 1, 'location.district': 1 });
userSchema.index({ role: 1, expertise: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last active timestamp
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Get public profile (excluding sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);