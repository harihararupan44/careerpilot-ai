const express = require('express');
const router = express.Router();
const { getProfile, createOrUpdateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/users/profile
 * @desc    Get currently logged in user's profile
 * @access  Private
 */
router.get('/profile', protect, getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Create or update user profile
 * @access  Private
 */
router.put('/profile', protect, createOrUpdateProfile);

module.exports = router;
