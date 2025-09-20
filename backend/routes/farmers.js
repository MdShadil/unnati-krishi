const express = require('express');
const { body, validationResult } = require('express-validator');
const Farm = require('../models/Farm');
const CropRecommendation = require('../models/CropRecommendation');
const CropImage = require('../models/CropImage');
const { authorize } = require('../middleware/auth');
const { upload, processImage } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/farmers/dashboard
// @desc    Get farmer dashboard data
// @access  Private (Farmer only)
router.get('/dashboard', authorize('farmer'), async (req, res, next) => {
  try {
    const farmerId = req.user._id;
    
    // Get farmer's farms
    const farms = await Farm.find({ farmerId, isActive: true });
    
    // Get latest crop recommendations
    const recommendations = await CropRecommendation.find({ farmerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('farmId', 'name');
    
    // Get recent crop images
    const recentImages = await CropImage.find({ farmerId })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Calculate dashboard statistics
    const totalFarms = farms.length;
    const totalArea = farms.reduce((sum, farm) => sum + farm.totalArea, 0);
    const totalInvestment = farms.reduce((sum, farm) => sum + farm.totalInvestment, 0);
    const expectedRevenue = farms.reduce((sum, farm) => sum + farm.expectedRevenue, 0);
    const totalCrops = farms.reduce((sum, farm) => sum + farm.currentCrops.length, 0);
    
    // Get crops by health status
    const cropHealthStats = {};
    farms.forEach(farm => {
      farm.currentCrops.forEach(crop => {
        cropHealthStats[crop.healthStatus] = (cropHealthStats[crop.healthStatus] || 0) + 1;
      });
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalFarms,
          totalArea,
          totalCrops,
          totalInvestment,
          expectedRevenue,
          profitMargin: expectedRevenue - totalInvestment,
          cropHealthStats
        },
        farms,
        recentRecommendations: recommendations,
        recentImages
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/farmers/farms
// @desc    Get all farms for farmer
// @access  Private (Farmer only)
router.get('/farms', authorize('farmer'), async (req, res, next) => {
  try {
    const farms = await Farm.find({ 
      farmerId: req.user._id,
      isActive: true 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: farms
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/farmers/farms
// @desc    Create a new farm
// @access  Private (Farmer only)
router.post('/farms',
  authorize('farmer'),
  [
    body('name').trim().notEmpty().withMessage('Farm name is required'),
    body('totalArea').isFloat({ min: 0.1 }).withMessage('Total area must be at least 0.1 acres'),
    body('location.address').notEmpty().withMessage('Address is required'),
    body('location.coordinates.lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('location.coordinates.lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    body('location.state').notEmpty().withMessage('State is required'),
    body('location.district').notEmpty().withMessage('District is required'),
    body('soilType').isIn(['clay', 'sandy', 'loamy', 'black', 'red', 'alluvial', 'laterite']).withMessage('Invalid soil type')
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

      const farmData = {
        ...req.body,
        farmerId: req.user._id
      };

      const farm = new Farm(farmData);
      await farm.save();

      res.status(201).json({
        success: true,
        message: 'Farm created successfully',
        data: farm
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/farmers/farms/:id
// @desc    Get specific farm details
// @access  Private (Farmer only)
router.get('/farms/:id', authorize('farmer'), async (req, res, next) => {
  try {
    const farm = await Farm.findOne({
      _id: req.params.id,
      farmerId: req.user._id
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    res.json({
      success: true,
      data: farm
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/farmers/farms/:id
// @desc    Update farm details
// @access  Private (Farmer only)
router.put('/farms/:id', authorize('farmer'), async (req, res, next) => {
  try {
    const farm = await Farm.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    res.json({
      success: true,
      message: 'Farm updated successfully',
      data: farm
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/farmers/farms/:id/crops
// @desc    Add crop to farm
// @access  Private (Farmer only)
router.post('/farms/:id/crops',
  authorize('farmer'),
  [
    body('cropName').trim().notEmpty().withMessage('Crop name is required'),
    body('variety').trim().notEmpty().withMessage('Crop variety is required'),
    body('area').isFloat({ min: 0.1 }).withMessage('Area must be at least 0.1 acres'),
    body('plantingDate').isISO8601().withMessage('Invalid planting date'),
    body('expectedHarvest').isISO8601().withMessage('Invalid expected harvest date'),
    body('estimatedYield').isFloat({ min: 0 }).withMessage('Estimated yield must be positive')
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

      const farm = await Farm.findOne({
        _id: req.params.id,
        farmerId: req.user._id
      });

      if (!farm) {
        return res.status(404).json({
          success: false,
          message: 'Farm not found'
        });
      }

      // Check if total crop area doesn't exceed farm area
      const currentCropArea = farm.currentCrops.reduce((sum, crop) => sum + crop.area, 0);
      if (currentCropArea + req.body.area > farm.totalArea) {
        return res.status(400).json({
          success: false,
          message: 'Total crop area cannot exceed farm area'
        });
      }

      farm.currentCrops.push(req.body);
      await farm.save();

      res.status(201).json({
        success: true,
        message: 'Crop added successfully',
        data: farm
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/farmers/farms/:farmId/crops/:cropId/expenses
// @desc    Add expense to crop
// @access  Private (Farmer only)
router.post('/farms/:farmId/crops/:cropId/expenses',
  authorize('farmer'),
  upload.single('receipt'),
  processImage,
  [
    body('type').isIn(['seeds', 'fertilizer', 'pesticide', 'labor', 'irrigation', 'machinery', 'other']).withMessage('Invalid expense type'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
    body('quantity').optional().isFloat({ min: 0 }).withMessage('Quantity must be positive')
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

      const farm = await Farm.findOne({
        _id: req.params.farmId,
        farmerId: req.user._id
      });

      if (!farm) {
        return res.status(404).json({
          success: false,
          message: 'Farm not found'
        });
      }

      const crop = farm.currentCrops.id(req.params.cropId);
      if (!crop) {
        return res.status(404).json({
          success: false,
          message: 'Crop not found'
        });
      }

      const expenseData = {
        ...req.body,
        ...(req.file && { receipt: `/uploads/receipts/${req.file.filename}` })
      };

      crop.expenses.push(expenseData);
      await farm.save();

      res.status(201).json({
        success: true,
        message: 'Expense added successfully',
        data: farm
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/farmers/:id/recommendations
// @desc    Get crop recommendations for farmer
// @access  Private (Farmer only)
router.get('/:id/recommendations', authorize('farmer'), async (req, res, next) => {
  try {
    // Ensure farmer can only access their own recommendations
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const recommendations = await CropRecommendation.find({ farmerId: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('farmId', 'name location');

    const total = await CropRecommendation.countDocuments({ farmerId: req.params.id });

    res.json({
      success: true,
      data: {
        recommendations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/farmers/:id/farm-diary
// @desc    Get farm diary (all farm activities)
// @access  Private (Farmer only)
router.get('/:id/farm-diary', authorize('farmer'), async (req, res, next) => {
  try {
    // Ensure farmer can only access their own farm diary
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { startDate, endDate, farmId, cropName } = req.query;
    
    let filter = { farmerId: req.params.id };
    if (farmId) filter._id = farmId;

    const farms = await Farm.find(filter);
    
    // Prepare farm diary data
    const farmDiary = farms.map(farm => ({
      farm: {
        id: farm._id,
        name: farm.name,
        location: farm.location,
        totalArea: farm.totalArea,
        soilType: farm.soilType
      },
      crops: farm.currentCrops
        .filter(crop => !cropName || crop.cropName.toLowerCase().includes(cropName.toLowerCase()))
        .map(crop => ({
          id: crop._id,
          cropName: crop.cropName,
          variety: crop.variety,
          area: crop.area,
          stage: crop.stage,
          healthStatus: crop.healthStatus,
          plantingDate: crop.plantingDate,
          expectedHarvest: crop.expectedHarvest,
          expenses: crop.expenses.filter(expense => {
            if (!startDate && !endDate) return true;
            const expenseDate = new Date(expense.date);
            const start = startDate ? new Date(startDate) : new Date('1900-01-01');
            const end = endDate ? new Date(endDate) : new Date();
            return expenseDate >= start && expenseDate <= end;
          }),
          totalExpenses: crop.expenses.reduce((sum, exp) => sum + exp.amount, 0),
          estimatedYield: crop.estimatedYield,
          actualYield: crop.actualYield,
          images: crop.images
        }))
    }));

    res.json({
      success: true,
      data: farmDiary
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;