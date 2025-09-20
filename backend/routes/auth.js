const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { upload, processImage } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const signupValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid Indian phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['farmer', 'expert'])
    .withMessage('Role must be either farmer or expert'),
  body('state')
    .notEmpty()
    .withMessage('State is required'),
  body('district')
    .notEmpty()
    .withMessage('District is required'),
  body('language')
    .isIn(['hindi', 'english', 'tamil', 'bengali', 'marathi', 'gujarati', 'kannada', 'telugu', 'punjabi', 'malayalam'])
    .withMessage('Please select a valid language')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', signupValidation, async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      email,
      phone,
      password,
      role,
      state,
      district,
      language,
      farmingExperience,
      farmSize,
      expertise,
      certification
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email is already registered' 
          : 'Phone number is already registered'
      });
    }

    // Create user object
    const userData = {
      name,
      email,
      phone,
      password,
      role,
      location: { state, district },
      language
    };

    // Add role-specific fields
    if (role === 'farmer') {
      if (farmingExperience) userData.farmingExperience = farmingExperience;
      if (farmSize) userData.farmSize = farmSize;
    } else if (role === 'expert') {
      if (expertise) userData.expertise = expertise;
      if (certification) userData.certification = certification;
    }

    // Create user
    const user = new User(userData);
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.getPublicProfile(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and return token
// @access  Public
router.post('/login', loginValidation, async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last active
    await user.updateLastActive();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.getPublicProfile(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  // In a more advanced implementation, you might maintain a blacklist of tokens
  // For now, we'll rely on client-side token removal
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user.getPublicProfile()
    }
  });
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', 
  authenticateToken,
  upload.single('avatar'),
  processImage,
  [
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('phone').optional().matches(/^[6-9]\d{9}$/),
    body('language').optional().isIn(['hindi', 'english', 'tamil', 'bengali', 'marathi', 'gujarati', 'kannada', 'telugu', 'punjabi', 'malayalam'])
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const allowedFields = ['name', 'phone', 'language', 'farmingExperience', 'farmSize', 'expertise', 'certification', 'consultationRate'];
      const updates = {};

      // Filter allowed fields
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      // Handle location updates
      if (req.body.state || req.body.district) {
        updates.location = {
          ...req.user.location,
          ...(req.body.state && { state: req.body.state }),
          ...(req.body.district && { district: req.body.district })
        };
      }

      // Handle avatar upload
      if (req.file) {
        updates.avatar = `/uploads/avatars/${req.file.filename}`;
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: updatedUser.getPublicProfile()
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await User.findById(req.user._id).select('+password');

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/auth/verify-token
// @desc    Verify if token is valid
// @access  Private
router.get('/verify-token', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user.getPublicProfile()
    }
  });
});

module.exports = router;