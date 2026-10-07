const mongoose = require('mongoose');
const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');

/**
 * @route   POST /api/jobs/:id/save
 * @desc    Save/bookmark a job for authenticated user
 * @access  Private
 */
const saveJob = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id: jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Verify job exists and is active
    const job = await Job.findOne({ _id: jobId, isActive: true });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or is no longer active'
      });
    }

    // Check if already saved
    const existingSaved = await SavedJob.findOne({ user: userId, job: jobId });
    if (existingSaved) {
      return res.status(200).json({
        success: true,
        message: 'Job already saved',
        saved: true
      });
    }

    // Create saved job entry
    await SavedJob.create({ user: userId, job: jobId });

    return res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      saved: true
    });
  } catch (error) {
    // Handle unique compound index collision gracefully
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'Job already saved',
        saved: true
      });
    }
    next(error);
  }
};

/**
 * @route   DELETE /api/jobs/:id/save
 * @desc    Unsave/remove a bookmarked job for authenticated user
 * @access  Private
 */
const unsaveJob = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id: jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await SavedJob.findOneAndDelete({ user: userId, job: jobId });

    return res.status(200).json({
      success: true,
      message: 'Job removed from saved jobs',
      saved: false
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/jobs/saved
 * @desc    Get all saved jobs for authenticated user
 * @access  Private
 */
const getSavedJobs = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const savedRecords = await SavedJob.find({ user: userId })
      .populate('job')
      .sort({ createdAt: -1 });

    // Filter out any jobs that may have been deleted or deactivated
    const jobs = savedRecords
      .filter((record) => record.job && record.job.isActive)
      .map((record) => record.job);

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/jobs/:id/saved
 * @desc    Check if a specific job is saved by authenticated user
 * @access  Private
 */
const checkSavedJob = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id: jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const isSaved = await SavedJob.exists({ user: userId, job: jobId });

    return res.status(200).json({
      success: true,
      saved: !!isSaved
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveJob,
  unsaveJob,
  getSavedJobs,
  checkSavedJob
};
