const express = require('express');
const { body, validationResult } = require('express-validator');
const { optionalAuth } = require('../middleware/auth');
const { upload, processImage } = require('../middleware/upload');
const aiService = require('../services/aiService');
const weatherService = require('../services/weatherService');
const marketService = require('../services/marketService');
const CropRecommendation = require('../models/CropRecommendation');
const CropImage = require('../models/CropImage');
const ChatHistory = require('../models/ChatHistory');

const router = express.Router();

// @route   POST /api/ai/soil-predict
// @desc    Predict soil health based on location and other factors
// @access  Public (with optional auth)
router.post('/soil-predict',
  optionalAuth,
  [
    body('location.lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('location.lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    body('location.state').notEmpty().withMessage('State is required'),
    body('location.district').notEmpty().withMessage('District is required')
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

      const { location, season, soilType } = req.body;

      // Get weather data for the location
      const weatherData = await weatherService.getCurrentWeather(location.lat, location.lng);

      // Predict soil health using AI model
      const soilPrediction = await aiService.predictSoilHealth({
        location,
        weather: weatherData,
        season: season || 'kharif',
        soilType: soilType || 'loamy',
        historicalData: true
      });

      res.json({
        success: true,
        data: {
          location,
          prediction: soilPrediction,
          weather: weatherData,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/ai/crop-recommend
// @desc    Get AI-powered crop recommendations
// @access  Public (with optional auth)
router.post('/crop-recommend',
  optionalAuth,
  [
    body('soilData.ph').isFloat({ min: 0, max: 14 }).withMessage('pH must be between 0 and 14'),
    body('soilData.nitrogen').isFloat({ min: 0 }).withMessage('Nitrogen level must be positive'),
    body('soilData.phosphorus').isFloat({ min: 0 }).withMessage('Phosphorus level must be positive'),
    body('soilData.potassium').isFloat({ min: 0 }).withMessage('Potassium level must be positive'),
    body('location.state').notEmpty().withMessage('State is required'),
    body('location.district').notEmpty().withMessage('District is required'),
    body('season').isIn(['kharif', 'rabi', 'zaid']).withMessage('Invalid season')
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

      const { soilData, location, season, farmArea } = req.body;

      // Get weather data
      let weatherData = {};
      if (location.lat && location.lng) {
        weatherData = await weatherService.getForecast(location.lat, location.lng);
      }

      // Get market data for popular crops in the region
      const marketData = await marketService.getRegionalMarketData(location.state, location.district);

      // Generate crop recommendations using AI
      const recommendations = await aiService.generateCropRecommendations({
        soilData,
        weatherData,
        marketData,
        location,
        season,
        farmArea: farmArea || 1
      });

      // Save recommendation if user is authenticated
      let savedRecommendation = null;
      if (req.user && req.body.farmId) {
        const recommendationData = {
          farmerId: req.user._id,
          farmId: req.body.farmId,
          inputData: {
            soilData,
            weatherData,
            marketData,
            location,
            season,
            farmArea
          },
          recommendations: recommendations.crops,
          confidence: recommendations.confidence
        };

        savedRecommendation = new CropRecommendation(recommendationData);
        await savedRecommendation.save();
      }

      res.json({
        success: true,
        data: {
          recommendations: recommendations.crops,
          confidence: recommendations.confidence,
          inputSummary: {
            soilData,
            weather: weatherData.current || {},
            marketTrend: marketData.summary || {},
            location,
            season
          },
          ...(savedRecommendation && { recommendationId: savedRecommendation._id })
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/ai/market-predict
// @desc    Predict market prices for crops
// @access  Public (with optional auth)
router.post('/market-predict',
  optionalAuth,
  [
    body('crops').isArray().withMessage('Crops must be an array'),
    body('crops.*').notEmpty().withMessage('Crop names cannot be empty'),
    body('location.state').notEmpty().withMessage('State is required'),
    body('location.district').notEmpty().withMessage('District is required')
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

      const { crops, location, timeframe = 30 } = req.body;

      // Get current market data
      const currentMarketData = await marketService.getRegionalMarketData(location.state, location.district);

      // Predict future prices using AI
      const predictions = await aiService.predictMarketPrices({
        crops,
        location,
        timeframe,
        currentMarketData
      });

      res.json({
        success: true,
        data: {
          predictions,
          location,
          timeframe,
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/ai/image-analyze
// @desc    Analyze crop images for disease detection
// @access  Public (with optional auth)
router.post('/image-analyze',
  optionalAuth,
  upload.single('cropImage'),
  processImage,
  [
    body('cropType').trim().notEmpty().withMessage('Crop type is required')
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

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Crop image is required'
        });
      }

      const { cropType, location } = req.body;
      const imageUrl = `/uploads/crops/${req.file.filename}`;

      // Analyze image using AI model
      const analysis = await aiService.analyzeCropImage({
        imagePath: req.file.path,
        cropType,
        location
      });

      // Save image analysis if user is authenticated
      let savedImage = null;
      if (req.user) {
        const imageData = {
          farmerId: req.user._id,
          farmId: req.body.farmId,
          cropFieldId: req.body.cropFieldId,
          imageUrl,
          originalFilename: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          cropType,
          analysis: {
            ...analysis,
            status: 'completed',
            processedAt: new Date()
          }
        };

        if (location) {
          imageData.imageMetadata = { location };
        }

        savedImage = new CropImage(imageData);
        await savedImage.save();
      }

      res.json({
        success: true,
        data: {
          analysis,
          imageUrl,
          cropType,
          ...(savedImage && { imageId: savedImage._id })
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/ai/chat
// @desc    AI-powered agricultural chat support
// @access  Public (with optional auth)
router.post('/chat',
  optionalAuth,
  [
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('sessionId').optional().isString().withMessage('Session ID must be a string'),
    body('language').optional().isIn(['hindi', 'english', 'tamil', 'bengali', 'marathi', 'gujarati', 'kannada', 'telugu', 'punjabi', 'malayalam']).withMessage('Invalid language')
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

      const {
        message,
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        language = 'english',
        context,
        isVoice = false
      } = req.body;

      const startTime = Date.now();

      // Process message with AI
      const aiResponse = await aiService.processChat({
        message,
        language,
        context,
        userProfile: req.user ? req.user.getPublicProfile() : null
      });

      const processingTime = Date.now() - startTime;

      // Save chat history if user is authenticated
      if (req.user) {
        const chatData = {
          userId: req.user._id,
          sessionId,
          message,
          response: aiResponse.response,
          messageType: isVoice ? 'voice' : 'text',
          language,
          context,
          intent: aiResponse.intent,
          confidence: aiResponse.confidence,
          isVoice,
          processingTime
        };

        const chatHistory = new ChatHistory(chatData);
        await chatHistory.save();
      }

      res.json({
        success: true,
        data: {
          response: aiResponse.response,
          intent: aiResponse.intent,
          confidence: aiResponse.confidence,
          suggestions: aiResponse.suggestions || [],
          sessionId,
          language,
          processingTime
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/ai/voice-process
// @desc    Process voice input for agricultural queries
// @access  Private
router.post('/voice-process',
  optionalAuth,
  upload.single('audioFile'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Audio file is required'
        });
      }

      const { language = 'hindi', context } = req.body;

      // Convert speech to text
      const transcription = await aiService.speechToText({
        audioPath: req.file.path,
        language
      });

      // Process the transcribed text
      const aiResponse = await aiService.processChat({
        message: transcription.text,
        language,
        context,
        userProfile: req.user ? req.user.getPublicProfile() : null
      });

      // Convert response to speech
      const audioResponse = await aiService.textToSpeech({
        text: aiResponse.response,
        language
      });

      res.json({
        success: true,
        data: {
          transcription: transcription.text,
          response: aiResponse.response,
          audioResponse: audioResponse.audioUrl,
          confidence: transcription.confidence,
          intent: aiResponse.intent,
          language
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/ai/popular-queries
// @desc    Get popular agricultural queries and trends
// @access  Public
router.get('/popular-queries', async (req, res, next) => {
  try {
    const { timeframe = 7 } = req.query;
    
    const popularQueries = await ChatHistory.getPopularQueries(parseInt(timeframe));
    
    res.json({
      success: true,
      data: {
        queries: popularQueries,
        timeframe: parseInt(timeframe)
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;