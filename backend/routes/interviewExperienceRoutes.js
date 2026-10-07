const express = require('express');
const router = express.Router();
const {
  createExperience,
  getExperiences,
  getMyExperiences,
  getExperienceById,
  updateExperience,
  deleteExperience,
  toggleHelpful
} = require('../controllers/interviewExperienceController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// Create experience (Protected)
router.post('/', protect, createExperience);

// Get all public experiences with filters and search (Public / Optional Auth for user states)
router.get('/', optionalAuth, getExperiences);

// Get current user's experiences (Protected) - Must be defined BEFORE /:id
router.get('/me', protect, getMyExperiences);

// Get single experience by ID (Public / Optional Auth)
router.get('/:id', optionalAuth, getExperienceById);

// Update experience (Protected - Owner only)
router.put('/:id', protect, updateExperience);

// Delete experience (Protected - Owner only)
router.delete('/:id', protect, deleteExperience);

// Toggle helpful vote (Protected)
router.post('/:id/helpful', protect, toggleHelpful);

module.exports = router;
