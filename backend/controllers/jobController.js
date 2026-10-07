const mongoose = require('mongoose');
const Job = require('../models/Job');

/**
 * @route   GET /api/jobs
 * @desc    Get all active jobs with search, filtering, sorting, and pagination
 * @access  Private
 */
const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      workMode,
      employmentType,
      experience,
      skills,
      sort = 'latest',
      page = 1,
      limit = 10
    } = req.query;

    // Base query: only active jobs
    const query = { isActive: true };

    // 1. Search across title, company, description, and skills
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { description: searchRegex },
        { skills: { $elemMatch: { $regex: search.trim(), $options: 'i' } } }
      ];
    }

    // 2. Location filter
    if (location && location.trim() && location.toLowerCase() !== 'all') {
      query.location = new RegExp(location.trim(), 'i');
    }

    // 3. Work Mode filter
    if (workMode && workMode.trim() && workMode.toLowerCase() !== 'all') {
      query.workMode = new RegExp(`^${workMode.trim()}$`, 'i');
    }

    // 4. Employment Type filter
    if (employmentType && employmentType.trim() && employmentType.toLowerCase() !== 'all') {
      query.employmentType = new RegExp(`^${employmentType.trim()}$`, 'i');
    }

    // 5. Experience filter
    if (experience && experience.trim() && experience.toLowerCase() !== 'all') {
      query.experience = new RegExp(experience.trim(), 'i');
    }

    // 6. Skills filter (comma-separated or array)
    if (skills) {
      const skillsArray = Array.isArray(skills)
        ? skills
        : String(skills)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

      if (skillsArray.length > 0) {
        query.skills = {
          $in: skillsArray.map((s) => new RegExp(`^${s}$`, 'i'))
        };
      }
    }

    // 7. Sorting logic
    let sortOption = { postedDate: -1, createdAt: -1 };

    switch (sort.toLowerCase()) {
      case 'oldest':
        sortOption = { postedDate: 1, createdAt: 1 };
        break;
      case 'salary':
      case 'salary-high':
        sortOption = { salaryMax: -1, salaryMin: -1 };
        break;
      case 'deadline':
        sortOption = { deadline: 1 };
        break;
      case 'latest':
      default:
        sortOption = { postedDate: -1, createdAt: -1 };
        break;
    }

    // 8. Pagination setup
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Execute query and count
    const [total, jobs] = await Promise.all([
      Job.countDocuments(query),
      Job.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.status(200).json({
      success: true,
      jobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/jobs/:id
 * @desc    Get single job by ID
 * @access  Private
 */
const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const job = await Job.findOne({ _id: id, isActive: true });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    return res.status(200).json({
      success: true,
      job
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/jobs
 * @desc    Create a new job (Admin only)
 * @access  Private (Admin)
 */
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      company,
      companyLogo,
      description,
      location,
      workMode,
      employmentType,
      experience,
      skills,
      salaryMin,
      salaryMax,
      salaryCurrency,
      applicationUrl,
      postedDate,
      deadline,
      source
    } = req.body;

    // 1. Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job title is required'
      });
    }

    if (!company || !company.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required'
      });
    }

    // 2. Validate enum fields if provided
    const validWorkModes = ['On-site', 'Remote', 'Hybrid'];
    if (workMode && !validWorkModes.includes(workMode)) {
      return res.status(400).json({
        success: false,
        message: `Work mode must be one of: ${validWorkModes.join(', ')}`
      });
    }

    const validEmploymentTypes = ['Full-time', 'Part-time', 'Internship', 'Contract'];
    if (employmentType && !validEmploymentTypes.includes(employmentType)) {
      return res.status(400).json({
        success: false,
        message: `Employment type must be one of: ${validEmploymentTypes.join(', ')}`
      });
    }

    // 3. Format payload
    const jobData = {
      title: title.trim(),
      company: company.trim(),
      companyLogo: companyLogo ? String(companyLogo).trim() : '',
      description: description ? String(description).trim() : '',
      location: location ? String(location).trim() : '',
      workMode: workMode || 'On-site',
      employmentType: employmentType || 'Full-time',
      experience: experience ? String(experience).trim() : '',
      skills: Array.isArray(skills)
        ? skills.map((s) => String(s).trim()).filter(Boolean)
        : [],
      salaryMin: typeof salaryMin === 'number' ? salaryMin : null,
      salaryMax: typeof salaryMax === 'number' ? salaryMax : null,
      salaryCurrency: salaryCurrency ? String(salaryCurrency).trim() : 'INR',
      applicationUrl: applicationUrl ? String(applicationUrl).trim() : '',
      postedDate: postedDate ? new Date(postedDate) : new Date(),
      deadline: deadline ? new Date(deadline) : null,
      source: source ? String(source).trim() : 'CareerPilot',
      isActive: true
    };

    const job = await Job.create(jobData);

    return res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update an existing job (Admin only)
 * @access  Private (Admin)
 */
const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const updateFields = {};
    const allowedFields = [
      'title',
      'company',
      'companyLogo',
      'description',
      'location',
      'workMode',
      'employmentType',
      'experience',
      'skills',
      'salaryMin',
      'salaryMax',
      'salaryCurrency',
      'applicationUrl',
      'postedDate',
      'deadline',
      'source',
      'isActive'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'skills' && Array.isArray(req.body.skills)) {
          updateFields.skills = req.body.skills.map((s) => String(s).trim()).filter(Boolean);
        } else if (field === 'deadline' || field === 'postedDate') {
          updateFields[field] = req.body[field] ? new Date(req.body[field]) : null;
        } else if (typeof req.body[field] === 'string') {
          updateFields[field] = req.body[field].trim();
        } else {
          updateFields[field] = req.body[field];
        }
      }
    }

    const job = await Job.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete/Deactivate a job (Admin only)
 * @access  Private (Admin)
 */
const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Soft delete by setting isActive to false
    const job = await Job.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
};
