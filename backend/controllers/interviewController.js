const mongoose = require('mongoose');
const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { notifyInterviewStatusChange } = require('../services/notificationService');

/**
 * @route   POST /api/interviews
 * @desc    Create a new interview preparation record
 * @access  Private (Protected)
 */
const createInterview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      company,
      jobTitle,
      application,
      job,
      interviewType,
      scheduledDate,
      location,
      meetingUrl,
      notes,
      preparationProgress
    } = req.body;

    // 1. Validation
    if (!company || !company.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required'
      });
    }

    if (!jobTitle || !jobTitle.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job title is required'
      });
    }

    // 2. Validate application ownership if provided
    let verifiedApplicationId = null;
    if (application) {
      if (!mongoose.Types.ObjectId.isValid(application)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid application ID format'
        });
      }
      const existingApp = await Application.findOne({
        _id: application,
        user: userId
      });
      if (!existingApp) {
        return res.status(400).json({
          success: false,
          message: 'Referenced application does not exist or does not belong to you'
        });
      }
      verifiedApplicationId = existingApp._id;
    }

    // 3. Validate job existence if provided
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

    // 4. Create interview document
    const interviewData = {
      user: userId,
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      application: verifiedApplicationId,
      job: verifiedJobId,
      interviewType: ['HR', 'Technical', 'Behavioral', 'Managerial', 'Mixed'].includes(interviewType)
        ? interviewType
        : 'Mixed',
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      location: location ? String(location).trim() : '',
      meetingUrl: meetingUrl ? String(meetingUrl).trim() : '',
      notes: notes ? String(notes).trim() : '',
      preparationProgress:
        typeof preparationProgress === 'number'
          ? Math.max(0, Math.min(100, preparationProgress))
          : 0,
      status: 'Upcoming'
    };

    const interview = await Interview.create(interviewData);

    const populatedInterview = await Interview.findById(interview._id)
      .populate('application', 'company jobTitle status appliedDate')
      .populate('job', 'title company location workMode');

    return res.status(201).json({
      success: true,
      message: 'Interview created successfully',
      interview: populatedInterview
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/interviews
 * @desc    Get all interviews for authenticated user with filters & pagination
 * @access  Private (Protected)
 */
const getInterviews = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status, interviewType, search, sort = 'upcoming', page = 1, limit = 10 } = req.query;

    const query = { user: userId };

    // Status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Interview type filter
    if (interviewType && interviewType !== 'All') {
      query.interviewType = interviewType;
    }

    // Search query (case-insensitive regex on company, jobTitle, notes)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { company: searchRegex },
        { jobTitle: searchRegex },
        { notes: searchRegex }
      ];
    }

    // Sorting strategy
    let sortOption = {};
    if (sort === 'latest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'upcoming') {
      // Prioritize upcoming scheduled dates
      sortOption = { scheduledDate: 1, createdAt: -1 };
    } else {
      sortOption = { scheduledDate: 1, createdAt: -1 };
    }

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [interviews, total] = await Promise.all([
      Interview.find(query)
        .populate('application', 'company jobTitle status appliedDate')
        .populate('job', 'title company location workMode')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Interview.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      count: interviews.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      interviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/interviews/:id
 * @desc    Get single interview by ID
 * @access  Private (Protected)
 */
const getInterviewById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID format'
      });
    }

    const interview = await Interview.findOne({ _id: id, user: userId })
      .populate('application')
      .populate('job');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    return res.status(200).json({
      success: true,
      interview
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/interviews/:id
 * @desc    Update interview details
 * @access  Private (Protected)
 */
const updateInterview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID format'
      });
    }

    const interview = await Interview.findOne({ _id: id, user: userId });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    const {
      company,
      jobTitle,
      interviewType,
      scheduledDate,
      location,
      meetingUrl,
      notes,
      preparationProgress,
      status,
      application,
      job
    } = req.body;

    if (company !== undefined) interview.company = String(company).trim();
    if (jobTitle !== undefined) interview.jobTitle = String(jobTitle).trim();
    if (interviewType !== undefined && ['HR', 'Technical', 'Behavioral', 'Managerial', 'Mixed'].includes(interviewType)) {
      interview.interviewType = interviewType;
    }
    if (scheduledDate !== undefined) {
      interview.scheduledDate = scheduledDate ? new Date(scheduledDate) : null;
    }
    if (location !== undefined) interview.location = String(location).trim();
    if (meetingUrl !== undefined) interview.meetingUrl = String(meetingUrl).trim();
    if (notes !== undefined) interview.notes = String(notes).trim();
    if (preparationProgress !== undefined) {
      interview.preparationProgress = Math.max(0, Math.min(100, Number(preparationProgress) || 0));
    }
    const previousStatus = interview.status;
    if (status !== undefined && ['Upcoming', 'Completed', 'Cancelled'].includes(status)) {
      interview.status = status;
    }

    if (application !== undefined) {
      if (application === null || application === '') {
        interview.application = null;
      } else if (mongoose.Types.ObjectId.isValid(application)) {
        const existingApp = await Application.findOne({ _id: application, user: userId });
        if (existingApp) interview.application = existingApp._id;
      }
    }

    if (job !== undefined) {
      if (job === null || job === '') {
        interview.job = null;
      } else if (mongoose.Types.ObjectId.isValid(job)) {
        const existingJob = await Job.findById(job);
        if (existingJob) interview.job = existingJob._id;
      }
    }

    await interview.save();

    const updatedInterview = await Interview.findById(interview._id)
      .populate('application', 'company jobTitle status appliedDate')
      .populate('job', 'title company location workMode');

    if (status && status !== previousStatus) {
      await notifyInterviewStatusChange(userId, updatedInterview, previousStatus, status);
    }

    return res.status(200).json({
      success: true,
      message: 'Interview updated successfully',
      interview: updatedInterview
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/interviews/:id
 * @desc    Delete an interview
 * @access  Private (Protected)
 */
const deleteInterview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID format'
      });
    }

    const interview = await Interview.findOneAndDelete({ _id: id, user: userId });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Interview deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/interviews/:id/status
 * @desc    Update interview status
 * @access  Private (Protected)
 */
const updateInterviewStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID format'
      });
    }

    if (!status || !['Upcoming', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (Upcoming, Completed, Cancelled)'
      });
    }

    const existingInterview = await Interview.findOne({ _id: id, user: userId });
    if (!existingInterview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    const previousStatus = existingInterview.status;

    const interview = await Interview.findOneAndUpdate(
      { _id: id, user: userId },
      { status },
      { new: true }
    )
      .populate('application', 'company jobTitle status appliedDate')
      .populate('job', 'title company location workMode');

    if (status !== previousStatus) {
      await notifyInterviewStatusChange(userId, interview, previousStatus, status);
    }

    return res.status(200).json({
      success: true,
      message: `Interview status updated to ${status}`,
      interview
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/interviews/:id/progress
 * @desc    Update interview preparation progress percentage
 * @access  Private (Protected)
 */
const updatePreparationProgress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { preparationProgress } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID format'
      });
    }

    if (
      preparationProgress === undefined ||
      typeof preparationProgress !== 'number' ||
      preparationProgress < 0 ||
      preparationProgress > 100
    ) {
      return res.status(400).json({
        success: false,
        message: 'Preparation progress must be a number between 0 and 100'
      });
    }

    const interview = await Interview.findOneAndUpdate(
      { _id: id, user: userId },
      { preparationProgress },
      { new: true }
    )
      .populate('application', 'company jobTitle status appliedDate')
      .populate('job', 'title company location workMode');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Preparation progress updated successfully',
      interview
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  updateInterviewStatus,
  updatePreparationProgress
};
