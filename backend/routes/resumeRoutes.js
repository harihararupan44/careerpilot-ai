const express = require('express');
const router = express.Router();
const {
  createResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume,
  setActiveResume
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/resumes
 * @desc    Create a new resume for authenticated user
 * @access  Private
 */
router.post('/', protect, createResume);

/**
 * @route   GET /api/resumes
 * @desc    Get all resumes belonging to the authenticated user
 * @access  Private
 */
router.get('/', protect, getResumes);

/**
 * @route   GET /api/resumes/:id
 * @desc    Get single resume by ID
 * @access  Private
 */
router.get('/:id', protect, getResumeById);

/**
 * @route   PUT /api/resumes/:id
 * @desc    Update a resume
 * @access  Private
 */
router.put('/:id', protect, updateResume);

/**
 * @route   DELETE /api/resumes/:id
 * @desc    Delete a resume
 * @access  Private
 */
router.delete('/:id', protect, deleteResume);

/**
 * @route   PUT /api/resumes/:id/active
 * @desc    Set a resume as active
 * @access  Private
 */
router.put('/:id/active', protect, setActiveResume);

module.exports = router;
