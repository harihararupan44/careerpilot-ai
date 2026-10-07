const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getCareerActivity,
  getCareerProgress
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// All dashboard endpoints require JWT authentication
router.use(protect);

// GET /api/dashboard/summary
router.get('/summary', getDashboardSummary);

// GET /api/dashboard/activity
router.get('/activity', getCareerActivity);

// GET /api/dashboard/progress
router.get('/progress', getCareerProgress);

module.exports = router;
