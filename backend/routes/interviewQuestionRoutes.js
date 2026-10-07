const express = require('express');
const router = express.Router();
const {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion
} = require('../controllers/interviewQuestionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All interview question bank routes require authentication
router.use(protect);

// Public student read routes, Admin-only modification routes
router.route('/')
  .get(getQuestions)
  .post(adminOnly, createQuestion);

router.route('/:id')
  .get(getQuestionById)
  .put(adminOnly, updateQuestion)
  .delete(adminOnly, deleteQuestion);

module.exports = router;
