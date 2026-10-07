const express = require('express');
const router = express.Router();
const {
  getAnalyticsOverview,
  getApplicationAnalytics,
  getInterviewAnalytics,
  getProfileAnalytics,
  getSavedJobAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// All analytics endpoints require JWT authentication
router.use(protect);

// GET /api/analytics/overview
router.get('/overview', getAnalyticsOverview);

// GET /api/analytics/applications
router.get('/applications', getApplicationAnalytics);

// GET /api/analytics/interviews
router.get('/interviews', getInterviewAnalytics);

// GET /api/analytics/profile
router.get('/profile', getProfileAnalytics);

// GET /api/analytics/saved-jobs
router.get('/saved-jobs', getSavedJobAnalytics);

module.exports = router;
