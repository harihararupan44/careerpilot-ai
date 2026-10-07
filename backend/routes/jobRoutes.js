const express = require('express');
const router = express.Router();

const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
} = require('../controllers/jobController');

const {
  saveJob,
  unsaveJob,
  getSavedJobs,
  checkSavedJob
} = require('../controllers/savedJobController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// ==========================================
// 1. Saved Jobs Routes (MUST be before /:id)
// ==========================================

/**
 * @route   GET /api/jobs/saved
 * @desc    Get all saved jobs for current user
 * @access  Private
 */
router.get('/saved', protect, getSavedJobs);

/**
 * @route   GET /api/jobs/:id/saved
 * @desc    Check if a job is saved by current user
 * @access  Private
 */
router.get('/:id/saved', protect, checkSavedJob);

/**
 * @route   POST /api/jobs/:id/save
 * @desc    Save/bookmark a job
 * @access  Private
 */
router.post('/:id/save', protect, saveJob);

/**
 * @route   DELETE /api/jobs/:id/save
 * @desc    Unsave/remove bookmark for a job
 * @access  Private
 */
router.delete('/:id/save', protect, unsaveJob);

// ==========================================
// 2. Core Job Search, Detail & Admin Routes
// ==========================================

/**
 * @route   GET /api/jobs
 * @desc    Get active jobs with search, filtering, sorting, pagination
 * @access  Private
 */
router.get('/', protect, getJobs);

/**
 * @route   GET /api/jobs/:id
 * @desc    Get single job details by ID
 * @access  Private
 */
router.get('/:id', protect, getJobById);

/**
 * @route   POST /api/jobs
 * @desc    Create a new job (Admin only)
 * @access  Private (Admin)
 */
router.post('/', protect, adminOnly, createJob);

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update a job (Admin only)
 * @access  Private (Admin)
 */
router.put('/:id', protect, adminOnly, updateJob);

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete / deactivate a job (Admin only)
 * @access  Private (Admin)
 */
router.delete('/:id', protect, adminOnly, deleteJob);

module.exports = router;
