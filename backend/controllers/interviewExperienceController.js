const mongoose = require('mongoose');
const InterviewExperience = require('../models/InterviewExperience');
const Profile = require('../models/Profile');
const User = require('../models/User');

/**
 * Helper to clean and sanitize string arrays (trims and removes empty values)
 */
const sanitizeStringArray = (arr, maxItems = 30) => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((item) => (typeof item === 'string' ? item.trim() : String(item || '').trim()))
    .filter(Boolean)
    .slice(0, maxItems);
};

/**
 * Format an InterviewExperience document for client response with author masking
 */
const formatExperienceResponse = (exp, currentUserId = null, profileMap = new Map()) => {
  if (!exp) return null;

  const isAnonymous = Boolean(exp.isAnonymous);
  const user = exp.user || {};
  const userIdStr = user._id ? user._id.toString() : user.toString ? user.toString() : '';
  const currentUserIdStr = currentUserId ? currentUserId.toString() : '';
  const isOwner = Boolean(currentUserIdStr && userIdStr && currentUserIdStr === userIdStr);

  const helpfulUsersList = Array.isArray(exp.helpfulUsers) ? exp.helpfulUsers : [];
  const isHelpful = Boolean(
    currentUserIdStr &&
      helpfulUsersList.some((u) => {
        const uId = u._id ? u._id.toString() : u.toString();
        return uId === currentUserIdStr;
      })
  );

  let author = null;
  if (isAnonymous) {
    author = {
      name: 'Anonymous Candidate',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=anonymous',
      role: 'Candidate',
      company: exp.companyName,
      college: '',
      isAnonymous: true
    };
  } else if (user && (user.name || userIdStr)) {
    const authorProfile = profileMap.get(userIdStr) || (user.profile ? user.profile : {});
    const authorName = user.name || 'CareerPilot Student';
    author = {
      id: userIdStr,
      userId: userIdStr,
      name: authorName,
      avatar:
        authorProfile.avatar ||
        user.avatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorName)}`,
      role: authorProfile.targetRole || user.role || 'Software Engineer',
      company: authorProfile.placementStatus || exp.companyName || 'Student',
      college: authorProfile.college || '',
      isAnonymous: false
    };
  } else {
    author = {
      name: 'Anonymous Candidate',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=anonymous',
      role: 'Candidate',
      company: exp.companyName,
      college: '',
      isAnonymous: true
    };
  }

  const expId = exp._id ? exp._id.toString() : exp.id;
  const createdAtDate = exp.createdAt ? new Date(exp.createdAt) : new Date();
  const yearStr = String(createdAtDate.getFullYear());

  return {
    _id: expId,
    id: expId,
    user: userIdStr,
    userId: userIdStr,
    company: exp.companyName,
    companyName: exp.companyName,
    role: exp.jobTitle,
    jobTitle: exp.jobTitle,
    title: exp.experienceTitle,
    experienceTitle: exp.experienceTitle,
    difficulty: exp.overallDifficulty,
    overallDifficulty: exp.overallDifficulty,
    experienceType: exp.experienceType || 'Full-time',
    interviewMode: exp.interviewMode || 'Online',
    interviewProcess: exp.interviewProcess || '',
    preparationTips: exp.preparationTips || '',
    overallExperience: exp.overallExperience || '',
    summary: exp.overallExperience || exp.interviewProcess || exp.experienceTitle,
    topics: Array.isArray(exp.topics) ? exp.topics : [],
    skills: Array.isArray(exp.skills) ? exp.skills : [],
    technologies: Array.isArray(exp.skills) ? exp.skills : [],
    rounds: Array.isArray(exp.rounds)
      ? exp.rounds.map((r, idx) => ({
          roundNumber: r.roundNumber || idx + 1,
          roundName: r.roundName || r.name || `Round ${idx + 1}`,
          name: r.roundName || r.name || `Round ${idx + 1}`,
          roundType: r.roundType || r.type || 'Technical',
          type: r.roundType || r.type || 'Technical',
          difficulty: r.difficulty || 'Medium',
          duration: r.duration || 60,
          description: r.description || '',
          questions: Array.isArray(r.questions) ? r.questions : [],
          tips: r.tips || r.keyTips || '',
          keyTips: r.tips || r.keyTips || ''
        }))
      : [],
    numberOfRounds: Array.isArray(exp.rounds) ? exp.rounds.length : 0,
    questionsAsked: Array.isArray(exp.questionsAsked) ? exp.questionsAsked : [],
    questions: Array.isArray(exp.questionsAsked) ? exp.questionsAsked : [],
    result: exp.result || 'Selected',
    verdict: exp.result === 'Selected' ? 'Offered' : exp.result || 'Offered',
    isAnonymous: Boolean(exp.isAnonymous),
    isPublished: exp.isPublished !== false,
    helpfulCount: typeof exp.helpfulCount === 'number' ? exp.helpfulCount : 0,
    isHelpful,
    isOwner,
    year: yearStr,
    date: createdAtDate.toISOString().split('T')[0],
    createdAt: exp.createdAt,
    updatedAt: exp.updatedAt,
    author
  };
};

/**
 * @route   POST /api/interview-experiences
 * @desc    Create a new interview experience
 * @access  Private (Protected)
 */
const createExperience = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      companyName,
      jobTitle,
      experienceTitle,
      overallDifficulty = 'Medium',
      experienceType = 'Full-time',
      interviewMode = 'Online',
      interviewProcess = '',
      preparationTips = '',
      overallExperience = '',
      topics = [],
      skills = [],
      rounds = [],
      questionsAsked = [],
      result = 'Selected',
      isAnonymous = false,
      isPublished = true,
      company = null,
      job = null
    } = req.body;

    // Required field validation
    if (!companyName || !companyName.trim()) {
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

    if (!experienceTitle || !experienceTitle.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Experience title is required'
      });
    }

    // Sanitize arrays and clean inputs
    const cleanedTopics = sanitizeStringArray(topics, 30);
    const cleanedSkills = sanitizeStringArray(skills, 30);
    const cleanedQuestionsAsked = sanitizeStringArray(questionsAsked, 50);

    const cleanedRounds = Array.isArray(rounds)
      ? rounds.slice(0, 15).map((r, idx) => ({
          roundNumber: Number(r.roundNumber) || idx + 1,
          roundName: (r.roundName || r.name || `Round ${idx + 1}`).trim(),
          roundType: (r.roundType || r.type || 'Technical').trim(),
          difficulty: ['Easy', 'Medium', 'Hard', 'Very Hard'].includes(r.difficulty)
            ? r.difficulty
            : 'Medium',
          duration: Number(r.duration) || 60,
          description: (r.description || '').trim(),
          questions: sanitizeStringArray(r.questions, 20),
          tips: (r.tips || r.keyTips || '').trim()
        }))
      : [];

    const newExperience = await InterviewExperience.create({
      user: userId,
      company: mongoose.Types.ObjectId.isValid(company) ? company : null,
      companyName: companyName.trim().slice(0, 100),
      job: mongoose.Types.ObjectId.isValid(job) ? job : null,
      jobTitle: jobTitle.trim().slice(0, 100),
      experienceTitle: experienceTitle.trim().slice(0, 200),
      overallDifficulty: ['Easy', 'Medium', 'Hard', 'Very Hard'].includes(overallDifficulty)
        ? overallDifficulty
        : 'Medium',
      experienceType: ['Internship', 'Full-time', 'Part-time', 'Contract', 'Placement'].includes(experienceType)
        ? experienceType
        : 'Full-time',
      interviewMode: ['Online', 'Offline', 'Hybrid'].includes(interviewMode)
        ? interviewMode
        : 'Online',
      interviewProcess: (interviewProcess || '').trim(),
      preparationTips: (preparationTips || '').trim(),
      overallExperience: (overallExperience || '').trim(),
      topics: cleanedTopics,
      skills: cleanedSkills,
      rounds: cleanedRounds,
      questionsAsked: cleanedQuestionsAsked,
      result: ['Selected', 'Rejected', 'Waitlisted', 'Pending', 'Prefer not to say'].includes(result)
        ? result
        : 'Selected',
      isAnonymous: Boolean(isAnonymous),
      isPublished: Boolean(isPublished),
      helpfulCount: 0,
      helpfulUsers: []
    });

    // Populate user to return formatted author
    await newExperience.populate('user', 'name avatar role');

    // Fetch author profile if available
    const authorProfile = await Profile.findOne({ user: userId });
    const profileMap = new Map();
    if (authorProfile) {
      profileMap.set(userId.toString(), authorProfile);
    }

    const formattedData = formatExperienceResponse(newExperience, userId, profileMap);

    return res.status(201).json({
      success: true,
      message: 'Interview experience shared successfully',
      data: formattedData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/interview-experiences
 * @desc    Get all public interview experiences with search, filters & pagination
 * @access  Public / Optional Auth
 */
const getExperiences = async (req, res, next) => {
  try {
    const currentUserId = req.user ? req.user._id : null;
    const {
      search,
      company,
      companyName,
      role,
      jobTitle,
      experienceType,
      difficulty,
      overallDifficulty,
      interviewMode,
      skills,
      topics,
      result,
      sort = 'latest',
      page = 1,
      limit = 10
    } = req.query;

    const query = { isPublished: true };

    // Company filter
    const targetCompany = company || companyName;
    if (targetCompany && targetCompany !== 'All') {
      query.companyName = new RegExp(targetCompany.trim(), 'i');
    }

    // Role / Job title filter
    const targetRole = role || jobTitle;
    if (targetRole && targetRole !== 'All') {
      query.jobTitle = new RegExp(targetRole.trim(), 'i');
    }

    // Experience Type filter
    if (experienceType && experienceType !== 'All') {
      query.experienceType = experienceType.trim();
    }

    // Difficulty filter
    const targetDifficulty = difficulty || overallDifficulty;
    if (targetDifficulty && targetDifficulty !== 'All') {
      query.overallDifficulty = targetDifficulty.trim();
    }

    // Interview Mode filter
    if (interviewMode && interviewMode !== 'All') {
      query.interviewMode = interviewMode.trim();
    }

    // Result filter
    if (result && result !== 'All') {
      query.result = result.trim();
    }

    // Skills filter
    if (skills && skills !== 'All') {
      const skillsArray = Array.isArray(skills)
        ? skills
        : String(skills).split(',').map((s) => s.trim()).filter(Boolean);
      if (skillsArray.length > 0) {
        query.skills = { $in: skillsArray.map((s) => new RegExp(s, 'i')) };
      }
    }

    // Topics filter
    if (topics && topics !== 'All') {
      const topicsArray = Array.isArray(topics)
        ? topics
        : String(topics).split(',').map((t) => t.trim()).filter(Boolean);
      if (topicsArray.length > 0) {
        query.topics = { $in: topicsArray.map((t) => new RegExp(t, 'i')) };
      }
    }

    // Text search filter across fields
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { companyName: searchRegex },
        { jobTitle: searchRegex },
        { experienceTitle: searchRegex },
        { interviewProcess: searchRegex },
        { preparationTips: searchRegex },
        { overallExperience: searchRegex },
        { skills: searchRegex },
        { topics: searchRegex },
        { questionsAsked: searchRegex }
      ];
    }

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'helpful') {
      sortOption = { helpfulCount: -1, createdAt: -1 };
    } else if (sort === 'difficulty') {
      sortOption = { overallDifficulty: -1, createdAt: -1 };
    }

    const [experiences, total] = await Promise.all([
      InterviewExperience.find(query)
        .populate('user', 'name avatar role')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      InterviewExperience.countDocuments(query)
    ]);

    // Fetch author profiles for non-anonymous experiences
    const userIds = experiences
      .filter((e) => !e.isAnonymous && e.user)
      .map((e) => (e.user._id ? e.user._id : e.user));

    const profiles = await Profile.find({ user: { $in: userIds } });
    const profileMap = new Map(profiles.map((p) => [p.user.toString(), p]));

    const formattedData = experiences.map((exp) =>
      formatExperienceResponse(exp, currentUserId, profileMap)
    );

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
 * @route   GET /api/interview-experiences/me
 * @desc    Get all interview experiences created by authenticated user
 * @access  Private (Protected)
 */
const getMyExperiences = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const { page = 1, limit = 10, sort = 'latest' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'helpful') {
      sortOption = { helpfulCount: -1, createdAt: -1 };
    }

    const [experiences, total] = await Promise.all([
      InterviewExperience.find({ user: currentUserId })
        .populate('user', 'name avatar role')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      InterviewExperience.countDocuments({ user: currentUserId })
    ]);

    const userProfile = await Profile.findOne({ user: currentUserId });
    const profileMap = new Map();
    if (userProfile) {
      profileMap.set(currentUserId.toString(), userProfile);
    }

    const formattedData = experiences.map((exp) =>
      formatExperienceResponse(exp, currentUserId, profileMap)
    );

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
 * @route   GET /api/interview-experiences/:id
 * @desc    Get detailed interview experience by ID
 * @access  Public / Optional Auth
 */
const getExperienceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user ? req.user._id : null;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview experience ID format'
      });
    }

    const experience = await InterviewExperience.findById(id).populate('user', 'name avatar role');

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Interview experience not found'
      });
    }

    // Check if unpublished and not owner
    if (!experience.isPublished) {
      const isOwner =
        currentUserId &&
        experience.user &&
        (experience.user._id ? experience.user._id.toString() : experience.user.toString()) ===
          currentUserId.toString();
      if (!isOwner) {
        return res.status(404).json({
          success: false,
          message: 'Interview experience not found'
        });
      }
    }

    // Fetch author profile if not anonymous
    const profileMap = new Map();
    if (!experience.isAnonymous && experience.user) {
      const userId = experience.user._id || experience.user;
      const authorProfile = await Profile.findOne({ user: userId });
      if (authorProfile) {
        profileMap.set(userId.toString(), authorProfile);
      }
    }

    const formattedData = formatExperienceResponse(experience, currentUserId, profileMap);

    return res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/interview-experiences/:id
 * @desc    Update an existing interview experience (Owner only)
 * @access  Private (Protected)
 */
const updateExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview experience ID format'
      });
    }

    const experience = await InterviewExperience.findById(id);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Interview experience not found'
      });
    }

    // Ownership check: only creator can update
    if (experience.user.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to update this interview experience'
      });
    }

    const {
      companyName,
      jobTitle,
      experienceTitle,
      overallDifficulty,
      experienceType,
      interviewMode,
      interviewProcess,
      preparationTips,
      overallExperience,
      topics,
      skills,
      rounds,
      questionsAsked,
      result,
      isAnonymous,
      isPublished
    } = req.body;

    if (companyName !== undefined) experience.companyName = companyName.trim().slice(0, 100);
    if (jobTitle !== undefined) experience.jobTitle = jobTitle.trim().slice(0, 100);
    if (experienceTitle !== undefined) experience.experienceTitle = experienceTitle.trim().slice(0, 200);
    if (overallDifficulty !== undefined && ['Easy', 'Medium', 'Hard', 'Very Hard'].includes(overallDifficulty)) {
      experience.overallDifficulty = overallDifficulty;
    }
    if (experienceType !== undefined && ['Internship', 'Full-time', 'Part-time', 'Contract', 'Placement'].includes(experienceType)) {
      experience.experienceType = experienceType;
    }
    if (interviewMode !== undefined && ['Online', 'Offline', 'Hybrid'].includes(interviewMode)) {
      experience.interviewMode = interviewMode;
    }
    if (interviewProcess !== undefined) experience.interviewProcess = interviewProcess.trim();
    if (preparationTips !== undefined) experience.preparationTips = preparationTips.trim();
    if (overallExperience !== undefined) experience.overallExperience = overallExperience.trim();
    if (topics !== undefined) experience.topics = sanitizeStringArray(topics, 30);
    if (skills !== undefined) experience.skills = sanitizeStringArray(skills, 30);
    if (questionsAsked !== undefined) experience.questionsAsked = sanitizeStringArray(questionsAsked, 50);
    if (result !== undefined && ['Selected', 'Rejected', 'Waitlisted', 'Pending', 'Prefer not to say'].includes(result)) {
      experience.result = result;
    }
    if (isAnonymous !== undefined) experience.isAnonymous = Boolean(isAnonymous);
    if (isPublished !== undefined) experience.isPublished = Boolean(isPublished);

    if (Array.isArray(rounds)) {
      experience.rounds = rounds.slice(0, 15).map((r, idx) => ({
        roundNumber: Number(r.roundNumber) || idx + 1,
        roundName: (r.roundName || r.name || `Round ${idx + 1}`).trim(),
        roundType: (r.roundType || r.type || 'Technical').trim(),
        difficulty: ['Easy', 'Medium', 'Hard', 'Very Hard'].includes(r.difficulty)
          ? r.difficulty
          : 'Medium',
        duration: Number(r.duration) || 60,
        description: (r.description || '').trim(),
        questions: sanitizeStringArray(r.questions, 20),
        tips: (r.tips || r.keyTips || '').trim()
      }));
    }

    await experience.save();
    await experience.populate('user', 'name avatar role');

    const authorProfile = await Profile.findOne({ user: currentUserId });
    const profileMap = new Map();
    if (authorProfile) {
      profileMap.set(currentUserId.toString(), authorProfile);
    }

    const formattedData = formatExperienceResponse(experience, currentUserId, profileMap);

    return res.status(200).json({
      success: true,
      message: 'Interview experience updated successfully',
      data: formattedData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/interview-experiences/:id
 * @desc    Delete an interview experience (Owner only)
 * @access  Private (Protected)
 */
const deleteExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview experience ID format'
      });
    }

    const experience = await InterviewExperience.findById(id);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Interview experience not found'
      });
    }

    // Ownership check: only creator can delete
    if (experience.user.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to delete this interview experience'
      });
    }

    await InterviewExperience.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Interview experience deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/interview-experiences/:id/helpful
 * @desc    Toggle helpful vote on an interview experience
 * @access  Private (Protected)
 */
const toggleHelpful = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview experience ID format'
      });
    }

    const experience = await InterviewExperience.findById(id);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Interview experience not found'
      });
    }

    const userIndex = experience.helpfulUsers.findIndex(
      (u) => u.toString() === currentUserId.toString()
    );

    let isHelpfulNow = false;

    if (userIndex > -1) {
      // User already marked helpful: remove vote (toggle off)
      experience.helpfulUsers.splice(userIndex, 1);
      experience.helpfulCount = Math.max(0, (experience.helpfulCount || 1) - 1);
      isHelpfulNow = false;
    } else {
      // User has not marked helpful: add vote (toggle on)
      experience.helpfulUsers.push(currentUserId);
      experience.helpfulCount = (experience.helpfulCount || 0) + 1;
      isHelpfulNow = true;
    }

    await experience.save();

    return res.status(200).json({
      success: true,
      helpful: isHelpfulNow,
      helpfulCount: experience.helpfulCount,
      message: isHelpfulNow ? 'Marked as helpful' : 'Removed helpful mark'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExperience,
  getExperiences,
  getMyExperiences,
  getExperienceById,
  updateExperience,
  deleteExperience,
  toggleHelpful
};
