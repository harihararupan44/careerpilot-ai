const Profile = require('../models/Profile');
const User = require('../models/User');

/**
 * @route   GET /api/users/profile
 * @desc    Get currently authenticated user's profile
 * @access  Private (Protected by authMiddleware)
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find profile associated with this user
    const profile = await Profile.findOne({ user: userId });

    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      profile: profile || null,
      message: profile ? 'Profile retrieved successfully' : 'Profile not created yet'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/users/profile
 * @desc    Create or update current user's profile
 * @access  Private (Protected by authMiddleware)
 */
const createOrUpdateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      name,
      phone,
      college,
      degree,
      branch,
      graduationYear,
      location,
      bio,
      skills,
      targetRole,
      careerInterests,
      github,
      linkedin,
      portfolio,
      projects,
      profileVisibility,
      careerStatus,
      achievementSummary,
      placementStatus,
      avatar,
      openToGuidance,
      guidanceTopics,
      guidanceBio,
      guidanceExperience,
      preferredGuidanceMode
    } = req.body;

    // 1. If name is provided, update the User document's name
    let updatedUser = req.user;
    if (name && typeof name === 'string' && name.trim()) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { name: name.trim() },
        { new: true, runValidators: true }
      );
    }

    // 2. Prepare profile fields (strictly controlled)
    const profileFields = {};

    if (phone !== undefined) profileFields.phone = String(phone).trim();
    if (college !== undefined) profileFields.college = String(college).trim();
    if (degree !== undefined) profileFields.degree = String(degree).trim();
    if (branch !== undefined) profileFields.branch = String(branch).trim();
    if (location !== undefined) profileFields.location = String(location).trim();
    if (bio !== undefined) profileFields.bio = String(bio).trim();
    if (targetRole !== undefined) profileFields.targetRole = String(targetRole).trim();
    if (github !== undefined) profileFields.github = String(github).trim();
    if (linkedin !== undefined) profileFields.linkedin = String(linkedin).trim();
    if (portfolio !== undefined) profileFields.portfolio = String(portfolio).trim();
    if (avatar !== undefined) profileFields.avatar = String(avatar).trim();
    if (achievementSummary !== undefined) profileFields.achievementSummary = String(achievementSummary).trim();
    if (placementStatus !== undefined) profileFields.placementStatus = String(placementStatus).trim();

    // Guidance fields
    if (openToGuidance !== undefined) profileFields.openToGuidance = Boolean(openToGuidance);
    if (guidanceBio !== undefined) profileFields.guidanceBio = String(guidanceBio).trim();
    if (guidanceExperience !== undefined) profileFields.guidanceExperience = String(guidanceExperience).trim();
    if (preferredGuidanceMode !== undefined && ['Online', 'Offline', 'Both'].includes(preferredGuidanceMode)) {
      profileFields.preferredGuidanceMode = preferredGuidanceMode;
    }
    if (guidanceTopics !== undefined) {
      if (Array.isArray(guidanceTopics)) {
        profileFields.guidanceTopics = guidanceTopics
          .map((t) => (typeof t === 'object' && t !== null ? t.name : String(t)))
          .filter(Boolean)
          .map((t) => t.trim());
      } else if (typeof guidanceTopics === 'string') {
        profileFields.guidanceTopics = guidanceTopics
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }

    if (profileVisibility !== undefined && ['Public', 'Private'].includes(profileVisibility)) {
      profileFields.profileVisibility = profileVisibility;
    }

    if (
      careerStatus !== undefined &&
      [
        'Student',
        'Looking for Internship',
        'Looking for Full-Time',
        'Working',
        'Open to Opportunities'
      ].includes(careerStatus)
    ) {
      profileFields.careerStatus = careerStatus;
    }

    // Validate and parse graduationYear
    if (graduationYear !== undefined && graduationYear !== null && graduationYear !== '') {
      const yearNum = Number(graduationYear);
      if (isNaN(yearNum) || yearNum < 1950 || yearNum > 2100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid graduation year. Please provide a 4-digit year between 1950 and 2100.'
        });
      }
      profileFields.graduationYear = yearNum;
    } else if (graduationYear === null || graduationYear === '') {
      profileFields.graduationYear = null;
    }

    // Normalize skills (accept array of strings or array of objects with { name })
    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        profileFields.skills = skills
          .map((s) => (typeof s === 'object' && s !== null ? s.name : String(s)))
          .filter(Boolean)
          .map((s) => s.trim());
      } else if (typeof skills === 'string') {
        profileFields.skills = skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Skills must be an array of strings.'
        });
      }
    }

    // Normalize careerInterests
    if (careerInterests !== undefined) {
      if (Array.isArray(careerInterests)) {
        profileFields.careerInterests = careerInterests
          .map((i) => String(i).trim())
          .filter(Boolean);
      } else if (typeof careerInterests === 'string') {
        profileFields.careerInterests = careerInterests
          .split(',')
          .map((i) => i.trim())
          .filter(Boolean);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Career interests must be an array of strings.'
        });
      }
    }

    // Normalize projects
    if (projects !== undefined) {
      if (!Array.isArray(projects)) {
        return res.status(400).json({
          success: false,
          message: 'Projects must be an array of project objects.'
        });
      }

      profileFields.projects = projects.map((p) => ({
        title: p.title || 'Untitled Project',
        description: p.description || '',
        technologies: Array.isArray(p.technologies)
          ? p.technologies.map((t) => String(t).trim()).filter(Boolean)
          : Array.isArray(p.tags)
          ? p.tags.map((t) => String(t).trim()).filter(Boolean)
          : [],
        githubUrl: p.githubUrl || p.link || '',
        liveUrl: p.liveUrl || p.demo || ''
      }));
    }

    // 3. Upsert Profile in MongoDB
    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      { $set: profileFields },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      },
      profile
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  createOrUpdateProfile
};
