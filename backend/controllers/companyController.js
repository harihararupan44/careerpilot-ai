const mongoose = require('mongoose');
const Company = require('../models/Company');
const SavedCompany = require('../models/SavedCompany');
const Job = require('../models/Job');
const InterviewExperience = require('../models/InterviewExperience');
const Profile = require('../models/Profile');
const User = require('../models/User');

/**
 * Helper to resolve a company from an identifier (ObjectId or slug or exact name)
 */
const resolveCompany = async (idOrSlug, requireActive = true) => {
  if (!idOrSlug) return null;

  const activeFilter = requireActive ? { isActive: true } : {};

  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    const comp = await Company.findOne({ _id: idOrSlug, ...activeFilter });
    if (comp) return comp;
  }

  // Fallback to slug or exact name
  return await Company.findOne({
    $or: [
      { slug: String(idOrSlug).toLowerCase().trim() },
      { name: new RegExp(`^${String(idOrSlug).trim()}$`, 'i') }
    ],
    ...activeFilter
  });
};

/**
 * @route   GET /api/companies
 * @desc    Get all active companies with search, filters & pagination
 * @access  Public (Optional auth for isSaved indicators)
 */
const getCompanies = async (req, res, next) => {
  try {
    const {
      search,
      industry,
      companySize,
      companyType,
      location,
      skills,
      role,
      hiringType,
      sort = 'name',
      page = 1,
      limit = 12
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Base query
    const query = { isActive: true };

    // Admin view can query inactive if explicitly specified
    if (req.user && req.user.role === 'admin' && req.query.includeInactive === 'true') {
      delete query.isActive;
    }

    // Industry Filter
    if (industry && industry !== 'All') {
      query.industry = new RegExp(industry.trim(), 'i');
    }

    // Company Size Filter
    if (companySize && companySize !== 'All') {
      query.companySize = companySize;
    }

    // Company Type / Hiring Type Filter
    const typeFilter = companyType || hiringType;
    if (typeFilter && typeFilter !== 'All') {
      query.companyType = typeFilter;
    }

    // Location Filter
    if (location && location !== 'All') {
      const locRegex = new RegExp(location.trim(), 'i');
      query.$or = [
        { headquarters: locRegex },
        { locations: locRegex }
      ];
    }

    // Skills Filter
    if (skills && skills !== 'All') {
      const skillsArr = Array.isArray(skills)
        ? skills
        : String(skills).split(',').map((s) => s.trim()).filter(Boolean);
      if (skillsArr.length > 0) {
        query.skills = { $in: skillsArr.map((s) => new RegExp(`^${s}$`, 'i')) };
      }
    }

    // Specializations / Role filter
    if (role && role !== 'All') {
      query.specializations = new RegExp(role.trim(), 'i');
    }

    // Free-text search
    if (search && search.trim()) {
      const s = search.trim();
      const sRegex = new RegExp(s, 'i');
      const searchOr = [
        { name: sRegex },
        { description: sRegex },
        { industry: sRegex },
        { headquarters: sRegex },
        { locations: sRegex },
        { specializations: sRegex },
        { skills: sRegex }
      ];

      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchOr }];
        delete query.$or;
      } else {
        query.$or = searchOr;
      }
    }

    // Count total matching
    const total = await Company.countDocuments(query);

    // Sorting
    let sortOptions = { name: 1 };
    if (sort === 'latest') {
      sortOptions = { createdAt: -1 };
    } else if (sort === 'name') {
      sortOptions = { name: 1 };
    }

    const companies = await Company.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Fetch live relational counts and saved status
    const currentUserId = req.user?._id;
    let savedCompanyIds = new Set();
    if (currentUserId) {
      const savedDocs = await SavedCompany.find({ user: currentUserId }).select('company');
      savedCompanyIds = new Set(savedDocs.map((s) => s.company.toString()));
    }

    const formattedData = await Promise.all(
      companies.map(async (comp) => {
        const compId = comp._id;
        const compNameRegex = new RegExp(`^${comp.name}$`, 'i');

        // Parallel count queries for jobs, experiences, and people
        const [jobCount, experienceCount, peopleCount] = await Promise.all([
          Job.countDocuments({
            isActive: true,
            $or: [{ companyRef: compId }, { company: compNameRegex }]
          }),
          InterviewExperience.countDocuments({
            isPublished: true,
            $or: [{ company: compId }, { companyName: compNameRegex }]
          }),
          Profile.countDocuments({
            profileVisibility: { $ne: 'Private' },
            $or: [{ currentCompany: compId }, { placementStatus: compNameRegex }]
          })
        ]);

        return {
          id: comp._id.toString(),
          _id: comp._id.toString(),
          name: comp.name,
          slug: comp.slug,
          logo: comp.logo,
          description: comp.description,
          industry: comp.industry,
          companySize: comp.companySize,
          companyType: comp.companyType,
          hiringType: comp.companyType, // backwards compatibility
          headquarters: comp.headquarters,
          locations: comp.locations,
          website: comp.website,
          foundedYear: comp.foundedYear,
          specializations: comp.specializations,
          popularRoles: comp.specializations, // UI compatibility
          skills: comp.skills,
          commonSkills: comp.skills, // UI compatibility
          isActive: comp.isActive,
          jobCount,
          interviewExperienceCount: experienceCount,
          peopleCount,
          isSaved: savedCompanyIds.has(comp._id.toString()),
          createdAt: comp.createdAt,
          updatedAt: comp.updatedAt
        };
      })
    );

    // If sorting by popularity or alumni/interviews
    if (sort === 'interviews') {
      formattedData.sort((a, b) => b.interviewExperienceCount - a.interviewExperienceCount);
    } else if (sort === 'people') {
      formattedData.sort((a, b) => b.peopleCount - a.peopleCount);
    } else if (sort === 'popular') {
      formattedData.sort(
        (a, b) =>
          b.peopleCount + b.interviewExperienceCount + b.jobCount -
          (a.peopleCount + a.interviewExperienceCount + a.jobCount)
      );
    }

    return res.status(200).json({
      success: true,
      data: formattedData,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/companies/:id
 * @desc    Get single company details by ID or slug
 * @access  Public
 */
const getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user && req.user.role === 'admin';

    const company = await resolveCompany(id, !isAdmin);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const compId = company._id;
    const compNameRegex = new RegExp(`^${company.name}$`, 'i');

    // Aggregate stats and check if saved
    const [jobCount, experienceCount, peopleCount, isSavedDoc] = await Promise.all([
      Job.countDocuments({
        isActive: true,
        $or: [{ companyRef: compId }, { company: compNameRegex }]
      }),
      InterviewExperience.countDocuments({
        isPublished: true,
        $or: [{ company: compId }, { companyName: compNameRegex }]
      }),
      Profile.countDocuments({
        profileVisibility: { $ne: 'Private' },
        $or: [{ currentCompany: compId }, { placementStatus: compNameRegex }]
      }),
      req.user ? SavedCompany.findOne({ user: req.user._id, company: compId }) : null
    ]);

    const formatted = {
      id: company._id.toString(),
      _id: company._id.toString(),
      name: company.name,
      slug: company.slug,
      logo: company.logo,
      description: company.description,
      industry: company.industry,
      companySize: company.companySize,
      companyType: company.companyType,
      hiringType: company.companyType,
      headquarters: company.headquarters,
      locations: company.locations,
      website: company.website,
      foundedYear: company.foundedYear,
      specializations: company.specializations,
      popularRoles: company.specializations,
      skills: company.skills,
      commonSkills: company.skills,
      isActive: company.isActive,
      jobCount,
      interviewExperienceCount: experienceCount,
      peopleCount,
      isSaved: Boolean(isSavedDoc),
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    };

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/companies
 * @desc    Create a new company (Admin only)
 * @access  Private (Admin)
 */
const createCompany = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      logo,
      description,
      industry,
      companySize,
      companyType,
      headquarters,
      locations,
      website,
      foundedYear,
      specializations,
      skills,
      isActive
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required'
      });
    }

    const trimmedName = name.trim();

    // Check duplicate name (case-insensitive)
    const existing = await Company.findOne({
      name: new RegExp(`^${trimmedName}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A company with this name already exists'
      });
    }

    const companyData = {
      name: trimmedName,
      logo: logo ? String(logo).trim() : '',
      description: description ? String(description).trim().slice(0, 3000) : '',
      industry: industry ? String(industry).trim() : 'Technology',
      companySize: companySize || 'Medium',
      companyType: companyType || 'Private',
      headquarters: headquarters ? String(headquarters).trim() : '',
      website: website ? String(website).trim() : '',
      isActive: isActive !== undefined ? Boolean(isActive) : true
    };

    if (slug && slug.trim()) {
      companyData.slug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    }

    if (foundedYear) {
      const yr = Number(foundedYear);
      if (!isNaN(yr) && yr >= 1800 && yr <= 2100) {
        companyData.foundedYear = yr;
      }
    }

    if (locations) {
      companyData.locations = Array.isArray(locations)
        ? locations.map((l) => String(l).trim()).filter(Boolean)
        : String(locations).split(',').map((l) => l.trim()).filter(Boolean);
    }

    if (specializations) {
      companyData.specializations = Array.isArray(specializations)
        ? specializations.map((s) => String(s).trim()).filter(Boolean)
        : String(specializations).split(',').map((s) => s.trim()).filter(Boolean);
    }

    if (skills) {
      companyData.skills = Array.isArray(skills)
        ? skills.map((s) => String(s).trim()).filter(Boolean)
        : String(skills).split(',').map((s) => s.trim()).filter(Boolean);
    }

    const newCompany = await Company.create(companyData);

    return res.status(201).json({
      success: true,
      message: 'Company created successfully.',
      data: newCompany
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/companies/:id
 * @desc    Update company details (Admin only)
 * @access  Private (Admin)
 */
const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;

    const company = await resolveCompany(id, false);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const {
      name,
      slug,
      logo,
      description,
      industry,
      companySize,
      companyType,
      headquarters,
      locations,
      website,
      foundedYear,
      specializations,
      skills,
      isActive
    } = req.body;

    if (name && name.trim()) {
      const trimmedName = name.trim();
      const duplicate = await Company.findOne({
        _id: { $ne: company._id },
        name: new RegExp(`^${trimmedName}$`, 'i')
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Another company with this name already exists'
        });
      }
      company.name = trimmedName;
    }

    if (slug && slug.trim()) {
      company.slug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    }

    if (logo !== undefined) company.logo = String(logo).trim();
    if (description !== undefined) company.description = String(description).trim().slice(0, 3000);
    if (industry !== undefined) company.industry = String(industry).trim();
    if (companySize !== undefined) company.companySize = companySize;
    if (companyType !== undefined) company.companyType = companyType;
    if (headquarters !== undefined) company.headquarters = String(headquarters).trim();
    if (website !== undefined) company.website = String(website).trim();
    if (isActive !== undefined) company.isActive = Boolean(isActive);

    if (foundedYear !== undefined) {
      const yr = Number(foundedYear);
      company.foundedYear = !isNaN(yr) && yr >= 1800 && yr <= 2100 ? yr : null;
    }

    if (locations !== undefined) {
      company.locations = Array.isArray(locations)
        ? locations.map((l) => String(l).trim()).filter(Boolean)
        : String(locations).split(',').map((l) => l.trim()).filter(Boolean);
    }

    if (specializations !== undefined) {
      company.specializations = Array.isArray(specializations)
        ? specializations.map((s) => String(s).trim()).filter(Boolean)
        : String(specializations).split(',').map((s) => s.trim()).filter(Boolean);
    }

    if (skills !== undefined) {
      company.skills = Array.isArray(skills)
        ? skills.map((s) => String(s).trim()).filter(Boolean)
        : String(skills).split(',').map((s) => s.trim()).filter(Boolean);
    }

    await company.save();

    return res.status(200).json({
      success: true,
      message: 'Company updated successfully.',
      data: company
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/companies/:id
 * @desc    Soft-deactivate company (Admin only)
 * @access  Private (Admin)
 */
const deactivateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;

    const company = await resolveCompany(id, false);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    company.isActive = false;
    await company.save();

    return res.status(200).json({
      success: true,
      message: 'Company deactivated successfully.',
      data: company
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/companies/:id/jobs
 * @desc    Get all active jobs associated with a company
 * @access  Public
 */
const getCompanyJobs = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const company = await resolveCompany(id, true);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const jobQuery = {
      isActive: true,
      $or: [
        { companyRef: company._id },
        { company: new RegExp(`^${company.name}$`, 'i') }
      ]
    };

    const [jobs, total] = await Promise.all([
      Job.find(jobQuery).sort({ postedDate: -1 }).skip(skip).limit(limitNum),
      Job.countDocuments(jobQuery)
    ]);

    return res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/companies/:id/interview-experiences
 * @desc    Get published interview experiences associated with a company
 * @access  Public
 */
const getCompanyExperiences = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const company = await resolveCompany(id, true);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const expQuery = {
      isPublished: true,
      $or: [
        { company: company._id },
        { companyName: new RegExp(`^${company.name}$`, 'i') }
      ]
    };

    const [experiences, total] = await Promise.all([
      InterviewExperience.find(expQuery)
        .populate('user', 'name avatar role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      InterviewExperience.countDocuments(expQuery)
    ]);

    // Format safe response respecting anonymity
    const formatted = experiences.map((exp) => {
      const expObj = exp.toJSON();
      if (exp.isAnonymous) {
        expObj.authorName = 'Anonymous Candidate';
        expObj.authorAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${exp._id}`;
      } else {
        expObj.authorName = exp.user?.name || 'CareerPilot Member';
        expObj.authorAvatar = exp.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${exp.user?.name || 'User'}`;
      }
      return expObj;
    });

    return res.status(200).json({
      success: true,
      data: formatted,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/companies/:id/people
 * @desc    Get public people / alumni associated with a company
 * @access  Public
 */
const getCompanyPeople = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const company = await resolveCompany(id, true);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const profileQuery = {
      profileVisibility: { $ne: 'Private' },
      $or: [
        { currentCompany: company._id },
        { placementStatus: new RegExp(`^${company.name}$`, 'i') }
      ]
    };

    const [profiles, total] = await Promise.all([
      Profile.find(profileQuery)
        .populate('user', 'name email role avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Profile.countDocuments(profileQuery)
    ]);

    // Format safe public profiles
    const formatted = profiles
      .filter((p) => p.user)
      .map((p) => {
        const u = p.user;
        const userId = u._id ? u._id.toString() : p.user.toString();
        return {
          id: userId,
          _id: userId,
          userId: userId,
          name: u.name || 'Alumni Member',
          avatar: p.avatar || u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name || 'User')}`,
          role: p.targetRole || 'Software Engineer',
          targetRole: p.targetRole || 'Software Engineer',
          company: p.placementStatus || company.name,
          college: p.college || '',
          degree: p.degree || '',
          branch: p.branch || '',
          graduationYear: p.graduationYear || null,
          location: p.location || '',
          skills: Array.isArray(p.skills) ? p.skills : [],
          careerStatus: p.careerStatus || 'Working',
          openToGuidance: Boolean(p.openToGuidance),
          availableForGuidance: Boolean(p.openToGuidance)
        };
      });

    return res.status(200).json({
      success: true,
      data: formatted,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/companies/:id/stats
 * @desc    Get real company statistics calculated from live data
 * @access  Public
 */
const getCompanyStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const company = await resolveCompany(id, true);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const compId = company._id;
    const compNameRegex = new RegExp(`^${company.name}$`, 'i');

    // 1. Job Count
    const jobCount = await Job.countDocuments({
      isActive: true,
      $or: [{ companyRef: compId }, { company: compNameRegex }]
    });

    // 2. People Count
    const peopleCount = await Profile.countDocuments({
      profileVisibility: { $ne: 'Private' },
      $or: [{ currentCompany: compId }, { placementStatus: compNameRegex }]
    });

    // 3. Interview Experiences Aggregation
    const experiences = await InterviewExperience.find({
      isPublished: true,
      $or: [{ company: compId }, { companyName: compNameRegex }]
    }).select('overallDifficulty skills topics rounds');

    const expCount = experiences.length;

    // Difficulty frequency map
    const diffMap = {};
    const skillMap = {};
    const topicMap = {};

    experiences.forEach((exp) => {
      if (exp.overallDifficulty) {
        diffMap[exp.overallDifficulty] = (diffMap[exp.overallDifficulty] || 0) + 1;
      }
      if (Array.isArray(exp.skills)) {
        exp.skills.forEach((s) => {
          const clean = String(s).trim();
          if (clean) skillMap[clean] = (skillMap[clean] || 0) + 1;
        });
      }
      if (Array.isArray(exp.topics)) {
        exp.topics.forEach((t) => {
          const clean = String(t).trim();
          if (clean) topicMap[clean] = (topicMap[clean] || 0) + 1;
        });
      }
    });

    // Determine most common difficulty
    let averageDifficulty = 'Medium';
    let maxDiffCount = 0;
    Object.entries(diffMap).forEach(([diff, count]) => {
      if (count > maxDiffCount) {
        maxDiffCount = count;
        averageDifficulty = diff;
      }
    });

    // Top skills (up to 5)
    let topSkills = Object.entries(skillMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill]) => skill);

    // If experiences lack skills, fallback to company.skills
    if (topSkills.length === 0 && Array.isArray(company.skills)) {
      topSkills = company.skills.slice(0, 5);
    }

    // Top topics (up to 5)
    let topInterviewTopics = Object.entries(topicMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);

    if (topInterviewTopics.length === 0) {
      topInterviewTopics = ['DSA', 'System Design', 'Technical Problem Solving'];
    }

    return res.status(200).json({
      success: true,
      data: {
        companyId: company._id.toString(),
        companyName: company.name,
        jobCount,
        interviewExperienceCount: expCount,
        peopleCount,
        averageDifficulty,
        topSkills,
        topInterviewTopics
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/companies/:id/save
 * @desc    Save/bookmark a company for authenticated user
 * @access  Private
 */
const saveCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const company = await resolveCompany(id, true);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if already saved (idempotent)
    const existing = await SavedCompany.findOne({
      user: userId,
      company: company._id
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Company already saved.',
        data: existing
      });
    }

    const saved = await SavedCompany.create({
      user: userId,
      company: company._id
    });

    return res.status(201).json({
      success: true,
      message: 'Company saved successfully.',
      data: saved
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'Company already saved.'
      });
    }
    next(error);
  }
};

/**
 * @route   DELETE /api/companies/:id/save
 * @desc    Remove company from user's saved list
 * @access  Private
 */
const unsaveCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const company = await resolveCompany(id, false);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const deleted = await SavedCompany.findOneAndDelete({
      user: userId,
      company: company._id
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Company was not in your saved list.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Company removed from saved list.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/companies/saved
 * @desc    Get all saved companies for current authenticated user
 * @access  Private
 */
const getSavedCompanies = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const savedDocs = await SavedCompany.find({ user: userId })
      .populate('company')
      .sort({ createdAt: -1 });

    const formatted = savedDocs
      .filter((s) => s.company && s.company.isActive)
      .map((s) => {
        const c = s.company;
        return {
          id: c._id.toString(),
          _id: c._id.toString(),
          name: c.name,
          slug: c.slug,
          logo: c.logo,
          description: c.description,
          industry: c.industry,
          companySize: c.companySize,
          companyType: c.companyType,
          hiringType: c.companyType,
          headquarters: c.headquarters,
          locations: c.locations,
          website: c.website,
          specializations: c.specializations,
          skills: c.skills,
          isSaved: true,
          savedAt: s.createdAt
        };
      });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/companies/:id/saved
 * @desc    Check if a specific company is saved by authenticated user
 * @access  Private
 */
const checkSavedCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const company = await resolveCompany(id, false);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const savedDoc = await SavedCompany.findOne({
      user: userId,
      company: company._id
    });

    return res.status(200).json({
      success: true,
      isSaved: Boolean(savedDoc)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deactivateCompany,
  getCompanyJobs,
  getCompanyExperiences,
  getCompanyPeople,
  getCompanyStats,
  saveCompany,
  unsaveCompany,
  getSavedCompanies,
  checkSavedCompany
};
