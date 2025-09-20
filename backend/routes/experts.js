const express = require('express');
const { authorize } = require('../middleware/auth');
const CropImage = require('../models/CropImage');
const ChatHistory = require('../models/ChatHistory');

const router = express.Router();

// @route   GET /api/experts/dashboard
// @desc    Get expert dashboard data
// @access  Private (Expert only)
router.get('/dashboard', authorize('expert'), async (req, res, next) => {
  try {
    const recentImages = await CropImage.find({ 'analysis.status': 'completed' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('farmerId', 'name location');

    const pendingReviews = await CropImage.find({ 
      'analysis.status': 'completed',
      'expertReview.reviewedBy': { $exists: false }
    }).countDocuments();

    const recentChats = await ChatHistory.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name location');

    res.json({
      success: true,
      data: {
        recentImages,
        pendingReviews,
        recentChats,
        stats: {
          totalConsultations: await ChatHistory.countDocuments(),
          imagesAnalyzed: await CropImage.countDocuments(),
          avgRating: 4.5
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;