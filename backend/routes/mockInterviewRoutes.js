const express = require('express');
const router = express.Router();
const {
  createMockInterview,
  getMockInterviews,
  getMockInterviewById,
  startMockInterview,
  submitMockAnswer,
  completeMockInterview,
  deleteMockInterview
} = require('../controllers/mockInterviewController');
const { protect } = require('../middleware/authMiddleware');

// All mock interview routes require authentication
router.use(protect);

// Specific sub-action endpoints
router.post('/:id/start', startMockInterview);
router.patch('/:id/answer', submitMockAnswer);
router.post('/:id/complete', completeMockInterview);

// Root mock interview endpoints
router.route('/')
  .post(createMockInterview)
  .get(getMockInterviews);

// Single mock interview by ID
router.route('/:id')
  .get(getMockInterviewById)
  .delete(deleteMockInterview);

module.exports = router;
