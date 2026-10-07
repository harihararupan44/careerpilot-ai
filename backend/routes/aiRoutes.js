const express = require('express');
const router = express.Router();
const {
  analyzeResumeHandler,
  improveResumeHandler,
  analyzeJobHandler,
  matchResumeJobHandler,
  analyzeSkillGapHandler,
  getCareerRecommendationsHandler,
  generateInterviewQuestionsHandler,
  evaluateInterviewFeedbackHandler,
  evaluateMockInterviewSessionHandler
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// All AI intelligence routes require authentication
router.use(protect);

// 1. Resume AI Endpoints
router.post('/resume/analyze', analyzeResumeHandler);
router.post('/resume/improve', improveResumeHandler);

// 2. Job Description & Matching AI Endpoints
router.post('/job/analyze', analyzeJobHandler);
router.post('/job/match', matchResumeJobHandler);

// 3. Career Intelligence & Skill Gap Endpoints
router.post('/career/skill-gap', analyzeSkillGapHandler);
router.post('/career/recommendations', getCareerRecommendationsHandler);

// 4. Interview Preparation & Feedback Endpoints
router.post('/interview/questions', generateInterviewQuestionsHandler);
router.post('/interview/feedback', evaluateInterviewFeedbackHandler);
router.post('/mock-interview/feedback', evaluateMockInterviewSessionHandler);

module.exports = router;
