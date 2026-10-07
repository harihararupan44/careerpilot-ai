const express = require('express');
const router = express.Router();

const {
  createApplication,
  getApplications,
  getApplicationStats,
  getApplicationById,
  updateApplication,
  updateApplicationStatus,
  deleteApplication
} = require('../controllers/applicationController');

const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/applications
 * @desc    Create a new application for authenticated user
 * @access  Private
 */
router.post('/', protect, createApplication);

/**
 * @route   GET /api/applications
 * @desc    Get user applications with search, filtering, sorting, pagination
 * @access  Private
 */
router.get('/', protect, getApplications);

/**
 * @route   GET /api/applications/stats
 * @desc    Get aggregated application metrics and rates (MUST BE BEFORE /:id)
 * @access  Private
 */
router.get('/stats', protect, getApplicationStats);

/**
 * @route   GET /api/applications/:id
 * @desc    Get single application by ID
 * @access  Private
 */
router.get('/:id', protect, getApplicationById);

/**
 * @route   PUT /api/applications/:id
 * @desc    Update an application
 * @access  Private
 */
router.put('/:id', protect, updateApplication);

/**
 * @route   PATCH /api/applications/:id/status
 * @desc    Update only the status of an application
 * @access  Private
 */
router.patch('/:id/status', protect, updateApplicationStatus);

/**
 * @route   DELETE /api/applications/:id
 * @desc    Delete an application
 * @access  Private
 */
router.delete('/:id', protect, deleteApplication);

module.exports = router;
