const analyticsService = require('../services/analyticsService');

/**
 * @route   GET /api/dashboard/summary
 * @desc    Get dashboard summary metrics for logged-in user
 * @access  Private (JWT Auth)
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const summaryData = await analyticsService.getDashboardSummary(userId);

    return res.status(200).json({
      success: true,
      data: summaryData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/dashboard/activity
 * @desc    Get chronological career activity feed for logged-in user
 * @access  Private (JWT Auth)
 */
const getCareerActivity = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit, 10) || 15;
    const activities = await analyticsService.getCareerActivity(userId, limit);

    return res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/dashboard/progress
 * @desc    Get career progress & milestone metrics for logged-in user
 * @access  Private (JWT Auth)
 */
const getCareerProgress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const progressData = await analyticsService.getCareerProgress(userId);

    return res.status(200).json({
      success: true,
      data: progressData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getCareerActivity,
  getCareerProgress
};
