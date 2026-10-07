const express = require('express');
const router = express.Router();
const {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  updateInterviewStatus,
  updatePreparationProgress
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

// All interview routes require authentication
router.use(protect);

// Specific sub-resource actions before generic /:id to prevent shadowing
router.patch('/:id/status', updateInterviewStatus);
router.patch('/:id/progress', updatePreparationProgress);

// Root interview routes
router.route('/')
  .post(createInterview)
  .get(getInterviews);

// Single interview routes
router.route('/:id')
  .get(getInterviewById)
  .put(updateInterview)
  .delete(deleteInterview);

module.exports = router;
