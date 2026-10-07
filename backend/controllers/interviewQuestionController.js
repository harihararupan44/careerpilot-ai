const mongoose = require('mongoose');
const InterviewQuestion = require('../models/InterviewQuestion');

/**
 * @route   GET /api/interview-questions
 * @desc    Get reusable interview questions with filtering & search
 * @access  Private (Protected)
 */
const getQuestions = async (req, res, next) => {
  try {
    const {
      category,
      difficulty,
      jobTitle,
      company,
      skills,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const query = { isActive: true };

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    // Company filter
    if (company && company !== 'All') {
      query.company = new RegExp(company.trim(), 'i');
    }

    // Job title filter
    if (jobTitle && jobTitle !== 'All') {
      query.jobTitle = new RegExp(jobTitle.trim(), 'i');
    }

    // Skills filter (comma separated or array)
    if (skills) {
      const skillsArray = Array.isArray(skills)
        ? skills
        : String(skills)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
      if (skillsArray.length > 0) {
        query.skills = { $in: skillsArray.map((s) => new RegExp(s, 'i')) };
      }
    }

    // Search query on question text
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { question: searchRegex },
        { company: searchRegex },
        { jobTitle: searchRegex },
        { sampleAnswer: searchRegex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [questions, total] = await Promise.all([
      InterviewQuestion.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      InterviewQuestion.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      count: questions.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      questions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/interview-questions/:id
 * @desc    Get single interview question by ID
 * @access  Private (Protected)
 */
const getQuestionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question ID format'
      });
    }

    const question = await InterviewQuestion.findById(id);

    if (!question || !question.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Interview question not found'
      });
    }

    return res.status(200).json({
      success: true,
      question
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/interview-questions
 * @desc    Create new question in question bank (Admin Only)
 * @access  Private (Admin)
 */
const createQuestion = async (req, res, next) => {
  try {
    const {
      question,
      category,
      difficulty,
      jobTitle,
      company,
      skills,
      sampleAnswer,
      tips,
      isActive
    } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Question text is required'
      });
    }

    const questionDoc = await InterviewQuestion.create({
      question: question.trim(),
      category: ['Technical', 'Behavioral', 'HR', 'Managerial', 'General'].includes(category)
        ? category
        : 'General',
      difficulty: ['Easy', 'Medium', 'Hard'].includes(difficulty)
        ? difficulty
        : 'Medium',
      jobTitle: jobTitle ? String(jobTitle).trim() : '',
      company: company ? String(company).trim() : '',
      skills: Array.isArray(skills)
        ? skills.map((s) => String(s).trim()).filter(Boolean)
        : [],
      sampleAnswer: sampleAnswer ? String(sampleAnswer).trim() : '',
      tips: Array.isArray(tips)
        ? tips.map((t) => String(t).trim()).filter(Boolean)
        : [],
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });

    return res.status(201).json({
      success: true,
      message: 'Interview question created successfully',
      question: questionDoc
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/interview-questions/:id
 * @desc    Update interview question (Admin Only)
 * @access  Private (Admin)
 */
const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question ID format'
      });
    }

    const questionDoc = await InterviewQuestion.findById(id);

    if (!questionDoc) {
      return res.status(404).json({
        success: false,
        message: 'Interview question not found'
      });
    }

    const {
      question,
      category,
      difficulty,
      jobTitle,
      company,
      skills,
      sampleAnswer,
      tips,
      isActive
    } = req.body;

    if (question !== undefined) questionDoc.question = String(question).trim();
    if (category !== undefined && ['Technical', 'Behavioral', 'HR', 'Managerial', 'General'].includes(category)) {
      questionDoc.category = category;
    }
    if (difficulty !== undefined && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      questionDoc.difficulty = difficulty;
    }
    if (jobTitle !== undefined) questionDoc.jobTitle = String(jobTitle).trim();
    if (company !== undefined) questionDoc.company = String(company).trim();
    if (skills !== undefined && Array.isArray(skills)) {
      questionDoc.skills = skills.map((s) => String(s).trim()).filter(Boolean);
    }
    if (sampleAnswer !== undefined) questionDoc.sampleAnswer = String(sampleAnswer).trim();
    if (tips !== undefined && Array.isArray(tips)) {
      questionDoc.tips = tips.map((t) => String(t).trim()).filter(Boolean);
    }
    if (isActive !== undefined) questionDoc.isActive = Boolean(isActive);

    await questionDoc.save();

    return res.status(200).json({
      success: true,
      message: 'Interview question updated successfully',
      question: questionDoc
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/interview-questions/:id
 * @desc    Delete/Deactivate interview question (Admin Only)
 * @access  Private (Admin)
 */
const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question ID format'
      });
    }

    // Soft delete by setting isActive to false (or hard delete if permanent query specified)
    const question = await InterviewQuestion.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Interview question not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Interview question deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion
};
