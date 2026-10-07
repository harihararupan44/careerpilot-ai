const mongoose = require('mongoose');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const Interview = require('../models/Interview');
const { notifyApplicationStatusChange } = require('../services/notificationService');

const VALID_STATUSES = ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

/**
 * @route   POST /api/applications
 * @desc    Create a new job application for the authenticated user
 * @access  Private
 */
const createApplication = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      company,
      jobTitle,
      job,
      resume,
      applicationUrl,
      status = 'Applied',
      appliedDate,
      deadline,
      followUpDate,
      location,
      workMode,
      experience,
      salaryMin,
      salaryMax,
      salaryCurrency,
      notes,
      contactPerson,
      contactEmail,
      source
    } = req.body;

    // 1. Validate required fields
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

    // 2. Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    // 3. Verify Job if provided
    let verifiedJobId = null;
    if (job) {
      if (mongoose.Types.ObjectId.isValid(job)) {
        const existingJob = await Job.findById(job);
        if (existingJob) {
          verifiedJobId = existingJob._id;
        }
      }
    }

    // 4. Verify Resume if provided (must belong to authenticated user)
    let verifiedResumeId = null;
    if (resume) {
      if (!mongoose.Types.ObjectId.isValid(resume)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid resume ID format'
        });
      }
      const existingResume = await Resume.findOne({ _id: resume, user: userId });
      if (!existingResume) {
        return res.status(400).json({
          success: false,
          message: 'Selected resume does not belong to your account'
        });
      }
      verifiedResumeId = existingResume._id;
    }

    // 5. Construct document
    const applicationData = {
      user: userId,
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      job: verifiedJobId,
      resume: verifiedResumeId,
      applicationUrl: applicationUrl ? String(applicationUrl).trim() : '',
      status: status || 'Applied',
      appliedDate: appliedDate ? new Date(appliedDate) : new Date(),
      deadline: deadline ? new Date(deadline) : null,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      location: location ? String(location).trim() : '',
      workMode: workMode || 'On-site',
      experience: experience ? String(experience).trim() : '',
      salaryMin: typeof salaryMin === 'number' ? salaryMin : null,
      salaryMax: typeof salaryMax === 'number' ? salaryMax : null,
      salaryCurrency: salaryCurrency ? String(salaryCurrency).trim() : 'INR',
      notes: notes ? String(notes).trim() : '',
      contactPerson: contactPerson ? String(contactPerson).trim() : '',
      contactEmail: contactEmail ? String(contactEmail).trim() : '',
      source: source ? String(source).trim() : ''
    };

    const newApplication = await Application.create(applicationData);
    const populated = await Application.findById(newApplication._id)
      .populate('job', 'title company companyLogo location workMode')
      .populate('resume', 'title fileName version');

    return res.status(201).json({
      success: true,
      message: 'Application created successfully',
      application: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/applications
 * @desc    Get all applications belonging to the authenticated user
 * @access  Private
 */
const getApplications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      search,
      status,
      sort = 'latest',
      page = 1,
      limit = 10
    } = req.query;

    // 1. Base Query: User ownership is strictly enforced
    const query = { user: userId };

    // 2. Search across company, jobTitle, and notes
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { company: searchRegex },
        { jobTitle: searchRegex },
        { notes: searchRegex }
      ];
    }

    // 3. Status filter
    if (status && status.trim() && status.toLowerCase() !== 'all') {
      query.status = status.trim();
    }

    // 4. Sorting logic
    let sortOption = { appliedDate: -1, createdAt: -1 };
    switch (sort.toLowerCase()) {
      case 'oldest':
        sortOption = { appliedDate: 1, createdAt: 1 };
        break;
      case 'deadline':
        sortOption = { deadline: 1 };
        break;
      case 'followup':
        sortOption = { followUpDate: 1 };
        break;
      case 'latest':
      default:
        sortOption = { appliedDate: -1, createdAt: -1 };
        break;
    }

    // 5. Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [total, applications] = await Promise.all([
      Application.countDocuments(query),
      Application.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate('job', 'title company companyLogo location workMode')
        .populate('resume', 'title fileName version')
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    // Attach any linked interview documents for this user's applications
    const appIds = applications.map(a => a._id);
    const interviews = await Interview.find({ application: { $in: appIds }, user: userId })
      .sort({ scheduledDate: -1, createdAt: -1 });

    const interviewMap = {};
    interviews.forEach(inv => {
      if (inv.application) {
        const appIdStr = inv.application.toString();
        // Keep the latest/first interview per application
        if (!interviewMap[appIdStr]) {
          interviewMap[appIdStr] = inv;
        }
      }
    });

    const applicationsWithInterviews = applications.map(app => {
      const obj = app.toObject();
      obj.interview = interviewMap[app._id.toString()] || null;
      return obj;
    });

    return res.status(200).json({
      success: true,
      applications: applicationsWithInterviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/applications/stats
 * @desc    Get aggregated application metrics and rates for authenticated user
 * @access  Private
 */
const getApplicationStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [
      total,
      applied,
      screening,
      interview,
      offer,
      rejected,
      withdrawn
    ] = await Promise.all([
      Application.countDocuments({ user: userId }),
      Application.countDocuments({ user: userId, status: 'Applied' }),
      Application.countDocuments({ user: userId, status: 'Screening' }),
      Application.countDocuments({ user: userId, status: 'Interview' }),
      Application.countDocuments({ user: userId, status: 'Offer' }),
      Application.countDocuments({ user: userId, status: 'Rejected' }),
      Application.countDocuments({ user: userId, status: 'Withdrawn' })
    ]);

    // Safe rate calculations
    const interviewRate = total > 0 ? Math.round(((interview + offer) / total) * 100) : 0;
    const offerRate = total > 0 ? Math.round((offer / total) * 100) : 0;
    const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;

    return res.status(200).json({
      success: true,
      stats: {
        total,
        applied,
        screening,
        interview,
        offer,
        rejected,
        withdrawn,
        interviewRate,
        offerRate,
        rejectionRate
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/applications/:id
 * @desc    Get single application by ID (Strict user ownership)
 * @access  Private
 */
const getApplicationById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const application = await Application.findOne({ _id: id, user: userId })
      .populate('job', 'title company companyLogo location workMode skills salaryMin salaryMax applicationUrl description')
      .populate('resume', 'title fileName skills version');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Lookup any linked interview document for this application
    const interview = await Interview.findOne({ application: application._id, user: userId })
      .sort({ scheduledDate: -1, createdAt: -1 });

    const applicationData = application.toObject();
    applicationData.interview = interview ? interview.toObject() : null;

    return res.status(200).json({
      success: true,
      application: applicationData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/applications/:id
 * @desc    Update an application (Strict user ownership)
 * @access  Private
 */
const updateApplication = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const {
      company,
      jobTitle,
      resume,
      applicationUrl,
      status,
      appliedDate,
      deadline,
      followUpDate,
      location,
      workMode,
      experience,
      salaryMin,
      salaryMax,
      salaryCurrency,
      notes,
      contactPerson,
      contactEmail,
      source
    } = req.body;

    const updateFields = {};

    if (company !== undefined) {
      if (!company.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Company name cannot be empty'
        });
      }
      updateFields.company = company.trim();
    }

    if (jobTitle !== undefined) {
      if (!jobTitle.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Job title cannot be empty'
        });
      }
      updateFields.jobTitle = jobTitle.trim();
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${VALID_STATUSES.join(', ')}`
        });
      }
      updateFields.status = status;
    }

    if (resume !== undefined) {
      if (resume === null || resume === '') {
        updateFields.resume = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(resume)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid resume ID format'
          });
        }
        const existingResume = await Resume.findOne({ _id: resume, user: userId });
        if (!existingResume) {
          return res.status(400).json({
            success: false,
            message: 'Selected resume does not belong to your account'
          });
        }
        updateFields.resume = existingResume._id;
      }
    }

    if (applicationUrl !== undefined) updateFields.applicationUrl = String(applicationUrl).trim();
    if (appliedDate !== undefined) updateFields.appliedDate = appliedDate ? new Date(appliedDate) : new Date();
    if (deadline !== undefined) updateFields.deadline = deadline ? new Date(deadline) : null;
    if (followUpDate !== undefined) updateFields.followUpDate = followUpDate ? new Date(followUpDate) : null;
    if (location !== undefined) updateFields.location = String(location).trim();
    if (workMode !== undefined) updateFields.workMode = workMode;
    if (experience !== undefined) updateFields.experience = String(experience).trim();
    if (salaryMin !== undefined) updateFields.salaryMin = typeof salaryMin === 'number' ? salaryMin : null;
    if (salaryMax !== undefined) updateFields.salaryMax = typeof salaryMax === 'number' ? salaryMax : null;
    if (salaryCurrency !== undefined) updateFields.salaryCurrency = String(salaryCurrency).trim();
    if (notes !== undefined) updateFields.notes = String(notes).trim();
    if (contactPerson !== undefined) updateFields.contactPerson = String(contactPerson).trim();
    if (contactEmail !== undefined) updateFields.contactEmail = String(contactEmail).trim();
    if (source !== undefined) updateFields.source = String(source).trim();

    const existingApplication = await Application.findOne({ _id: id, user: userId });
    if (!existingApplication) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const previousStatus = existingApplication.status;

    const updated = await Application.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: updateFields },
      { new: true, runValidators: true }
    )
      .populate('job', 'title company companyLogo location workMode')
      .populate('resume', 'title fileName version');

    if (updateFields.status && updateFields.status !== previousStatus) {
      await notifyApplicationStatusChange(userId, updated, previousStatus, updateFields.status);
    }

    return res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      application: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/applications/:id/status
 * @desc    Dedicated endpoint to update only the status of an application
 * @access  Private
 */
const updateApplicationStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const existingApplication = await Application.findOne({ _id: id, user: userId });
    if (!existingApplication) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const previousStatus = existingApplication.status;

    const application = await Application.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: { status } },
      { new: true, runValidators: true }
    )
      .populate('job', 'title company companyLogo location workMode')
      .populate('resume', 'title fileName version');

    if (status !== previousStatus) {
      await notifyApplicationStatusChange(userId, application, previousStatus, status);
    }

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/applications/:id
 * @desc    Delete an application (Strict user ownership)
 * @access  Private
 */
const deleteApplication = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const deleted = await Application.findOneAndDelete({ _id: id, user: userId });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApplication,
  getApplications,
  getApplicationStats,
  getApplicationById,
  updateApplication,
  updateApplicationStatus,
  deleteApplication
};
