const analyticsService = require('../services/analyticsService');

/**
 * @route   GET /api/analytics/overview
 * @desc    Get complete analytics overview for logged-in user
 * @access  Private (JWT Auth)
 */
const getAnalyticsOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const overview = await analyticsService.getAnalyticsOverview(userId);

    return res.status(200).json({
      success: true,
      data: overview
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/applications
 * @desc    Get detailed application statistics, conversion rates, and timeline
 * @access  Private (JWT Auth)
 */
const getApplicationAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const appAnalytics = await analyticsService.getApplicationAnalytics(userId);

    return res.status(200).json({
      success: true,
      data: appAnalytics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/interviews
 * @desc    Get interview analytics, round breakdowns, and preparation stats
 * @access  Private (JWT Auth)
 */
const getInterviewAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const interviewAnalytics = await analyticsService.getInterviewAnalytics(userId);

    return res.status(200).json({
      success: true,
      data: interviewAnalytics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/profile
 * @desc    Get profile completion percentage, skill counts, and resume status
 * @access  Private (JWT Auth)
 */
const getProfileAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profileAnalytics = await analyticsService.getProfileAndResumeAnalytics(userId);

    return res.status(200).json({
      success: true,
      data: profileAnalytics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/analytics/saved-jobs
 * @desc    Get saved jobs breakdown by work mode, job type, and location
 * @access  Private (JWT Auth)
 */
const getSavedJobAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const savedJobAnalytics = await analyticsService.getSavedJobAnalytics(userId);

    return res.status(200).json({
      success: true,
      data: savedJobAnalytics
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalyticsOverview,
  getApplicationAnalytics,
  getInterviewAnalytics,
  getProfileAnalytics,
  getSavedJobAnalytics
};
