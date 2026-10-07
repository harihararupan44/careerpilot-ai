const mongoose = require('mongoose');
const MockInterview = require('../models/MockInterview');
const InterviewQuestion = require('../models/InterviewQuestion');
const Interview = require('../models/Interview');
const Job = require('../models/Job');

/**
 * @route   POST /api/mock-interviews
 * @desc    Create a new mock interview session
 * @access  Private (Protected)
 */
const createMockInterview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      title,
      interviewType,
      job,
      interview,
      questionIds,
      questions,
      overallNotes
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Mock interview title is required'
      });
    }

    // Validate interview ownership if linked
    let verifiedInterviewId = null;
    if (interview) {
      if (!mongoose.Types.ObjectId.isValid(interview)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid interview ID format'
        });
      }
      const existingInterview = await Interview.findOne({ _id: interview, user: userId });
      if (!existingInterview) {
        return res.status(400).json({
          success: false,
          message: 'Referenced interview prep does not exist or does not belong to you'
        });
      }
      verifiedInterviewId = existingInterview._id;
    }

    // Validate job existence if linked
    let verifiedJobId = null;
    if (job) {
      if (!mongoose.Types.ObjectId.isValid(job)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid job ID format'
        });
      }
      const existingJob = await Job.findById(job);
      if (!existingJob) {
        return res.status(400).json({
          success: false,
          message: 'Referenced job was not found'
        });
      }
      verifiedJobId = existingJob._id;
    }

    // Build question snapshots
    let formattedQuestions = [];

    if (Array.isArray(questionIds) && questionIds.length > 0) {
      const validIds = questionIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
      const dbQuestions = await InterviewQuestion.find({ _id: { $in: validIds } });

      formattedQuestions = dbQuestions.map((q) => ({
        questionId: q._id,
        question: q.question,
        answer: '',
        answeredAt: null
      }));
    } else if (Array.isArray(questions) && questions.length > 0) {
      formattedQuestions = questions.map((item) => {
        if (typeof item === 'string') {
          return {
            question: item.trim(),
            answer: '',
            answeredAt: null
          };
        }
        return {
          questionId: item.questionId && mongoose.Types.ObjectId.isValid(item.questionId) ? item.questionId : null,
          question: item.question || 'Interview Question',
          answer: item.answer || '',
          answeredAt: item.answeredAt || null
        };
      });
    } else {
      // Fallback: load up to 5 default questions matching interviewType
      const categoryFilter = ['HR', 'Technical', 'Behavioral'].includes(interviewType)
        ? { category: interviewType, isActive: true }
        : { isActive: true };

      const defaultQuestions = await InterviewQuestion.find(categoryFilter).limit(5);
      formattedQuestions = defaultQuestions.map((q) => ({
        questionId: q._id,
        question: q.question,
        answer: '',
        answeredAt: null
      }));
    }

    const mockInterview = await MockInterview.create({
      user: userId,
      title: title.trim(),
      interviewType: ['HR', 'Technical', 'Behavioral', 'Mixed'].includes(interviewType)
        ? interviewType
        : 'Mixed',
      interview: verifiedInterviewId,
      job: verifiedJobId,
      questions: formattedQuestions,
      status: 'Not Started',
      overallNotes: overallNotes ? String(overallNotes).trim() : ''
    });

    const populated = await MockInterview.findById(mockInterview._id)
      .populate('interview', 'company jobTitle scheduledDate')
      .populate('job', 'title company location');

    return res.status(201).json({
      success: true,
      message: 'Mock interview session created successfully',
      mockInterview: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/mock-interviews
 * @desc    Get all mock interview sessions for authenticated user
 * @access  Private (Protected)
 */
const getMockInterviews = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status, sort = 'latest', page = 1, limit = 10 } = req.query;

    const query = { user: userId };

    if (status && status !== 'All') {
      query.status = status;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [mockInterviews, total] = await Promise.all([
      MockInterview.find(query)
        .populate('interview', 'company jobTitle scheduledDate')
        .populate('job', 'title company location')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      MockInterview.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      count: mockInterviews.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      mockInterviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/mock-interviews/:id
 * @desc    Get single mock interview session by ID
 * @access  Private (Protected)
 */
const getMockInterviewById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mock interview ID format'
      });
    }

    const mockInterview = await MockInterview.findOne({ _id: id, user: userId })
      .populate('interview')
      .populate('job')
      .populate('questions.questionId');

    if (!mockInterview) {
      return res.status(404).json({
        success: false,
        message: 'Mock interview not found'
      });
    }

    return res.status(200).json({
      success: true,
      mockInterview
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/mock-interviews/:id/start
 * @desc    Start a mock interview session
 * @access  Private (Protected)
 */
const startMockInterview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mock interview ID format'
      });
    }

    const mockInterview = await MockInterview.findOne({ _id: id, user: userId });

    if (!mockInterview) {
      return res.status(404).json({
        success: false,
        message: 'Mock interview not found'
      });
    }

    if (mockInterview.status === 'Not Started') {
      mockInterview.status = 'In Progress';
    }

    if (!mockInterview.startedAt) {
      mockInterview.startedAt = new Date();
    }

    await mockInterview.save();

    return res.status(200).json({
      success: true,
      message: 'Mock interview session started',
      mockInterview
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/mock-interviews/:id/answer
 * @desc    Submit candidate answer for a question in the mock interview
 * @access  Private (Protected)
 */
const submitMockAnswer = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { questionId, questionIndex, answer } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mock interview ID format'
      });
    }

    const mockInterview = await MockInterview.findOne({ _id: id, user: userId });

    if (!mockInterview) {
      return res.status(404).json({
        success: false,
        message: 'Mock interview not found'
      });
    }

    // Find the question item in session
    let targetQuestion = null;

    if (questionId) {
      targetQuestion = mockInterview.questions.find(
        (q) =>
          (q.questionId && q.questionId.toString() === questionId.toString()) ||
          (q._id && q._id.toString() === questionId.toString())
      );
    }

    if (!targetQuestion && typeof questionIndex === 'number' && mockInterview.questions[questionIndex]) {
      targetQuestion = mockInterview.questions[questionIndex];
    }

    if (!targetQuestion) {
      return res.status(400).json({
        success: false,
        message: 'Question could not be found in this mock interview session'
      });
    }

    // Update answer snapshot
    targetQuestion.answer = answer !== undefined ? String(answer).trim() : '';
    targetQuestion.answeredAt = new Date();

    // Auto-update status to In Progress if Not Started
    if (mockInterview.status === 'Not Started') {
      mockInterview.status = 'In Progress';
      mockInterview.startedAt = mockInterview.startedAt || new Date();
    }

    await mockInterview.save();

    return res.status(200).json({
      success: true,
      message: 'Answer recorded successfully',
      mockInterview
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/mock-interviews/:id/complete
 * @desc    Mark mock interview session as completed
 * @access  Private (Protected)
 */
const completeMockInterview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { overallNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mock interview ID format'
      });
    }

    const mockInterview = await MockInterview.findOne({ _id: id, user: userId });

    if (!mockInterview) {
      return res.status(404).json({
        success: false,
        message: 'Mock interview not found'
      });
    }

    mockInterview.status = 'Completed';
    mockInterview.completedAt = new Date();
    if (overallNotes !== undefined) {
      mockInterview.overallNotes = String(overallNotes).trim();
    }

    await mockInterview.save();

    return res.status(200).json({
      success: true,
      message: 'Mock interview session marked as completed',
      mockInterview
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/mock-interviews/:id
 * @desc    Delete a mock interview session
 * @access  Private (Protected)
 */
const deleteMockInterview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mock interview ID format'
      });
    }

    const mockInterview = await MockInterview.findOneAndDelete({ _id: id, user: userId });

    if (!mockInterview) {
      return res.status(404).json({
        success: false,
        message: 'Mock interview not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Mock interview session deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMockInterview,
  getMockInterviews,
  getMockInterviewById,
  startMockInterview,
  submitMockAnswer,
  completeMockInterview,
  deleteMockInterview
};
