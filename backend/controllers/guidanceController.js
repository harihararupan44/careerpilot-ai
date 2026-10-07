const mongoose = require('mongoose');
const User = require('../models/User');
const Profile = require('../models/Profile');
const GuidanceRequest = require('../models/GuidanceRequest');
const {
  notifyGuidanceRequest,
  notifyGuidanceAccepted,
  notifyGuidanceRejected,
  notifyGuidanceCompleted
} = require('../services/notificationService');

/**
 * Format a Profile document and User into a safe Public Guidance Person object
 */
const formatGuidancePerson = (profileDoc, userDoc = null) => {
  if (!profileDoc) return null;

  const user = userDoc || profileDoc.user || {};
  const userId = user._id
    ? user._id.toString()
    : profileDoc.user
    ? profileDoc.user.toString()
    : profileDoc.id;
  const name = user.name || profileDoc.name || 'CareerPilot Guide';

  return {
    _id: userId,
    id: userId,
    userId: userId,
    name: name,
    avatar:
      profileDoc.avatar ||
      user.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    company: profileDoc.placementStatus || 'Tech Professional',
    role: profileDoc.targetRole || 'Software Engineer',
    targetRole: profileDoc.targetRole || 'Software Engineer',
    college: profileDoc.college || '',
    degree: profileDoc.degree || '',
    branch: profileDoc.branch || '',
    graduationYear: profileDoc.graduationYear || null,
    location: profileDoc.location || '',
    bio: profileDoc.bio || '',
    skills: Array.isArray(profileDoc.skills) ? profileDoc.skills : [],
    guidanceTopics:
      Array.isArray(profileDoc.guidanceTopics) && profileDoc.guidanceTopics.length > 0
        ? profileDoc.guidanceTopics
        : ['DSA', 'Interview Preparation', 'Placement Preparation'],
    guidanceBio: profileDoc.guidanceBio || profileDoc.bio || '',
    guidanceExperience: profileDoc.guidanceExperience || profileDoc.achievementSummary || '',
    preferredGuidanceMode: profileDoc.preferredGuidanceMode || 'Online',
    availableForGuidance: Boolean(profileDoc.openToGuidance),
    careerStatus: profileDoc.careerStatus || 'Working',
    achievementSummary: profileDoc.achievementSummary || '',
    placementStatus: profileDoc.placementStatus || '',
    projects: Array.isArray(profileDoc.projects) ? profileDoc.projects : [],
    github: profileDoc.github || '',
    linkedin: profileDoc.linkedin || '',
    portfolio: profileDoc.portfolio || ''
  };
};

/**
 * @route   GET /api/guidance/people
 * @desc    Get all users available for career guidance with search, filters & pagination
 * @access  Private (Protected)
 */
const getGuidancePeople = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const {
      search,
      topic,
      skills,
      targetRole,
      college,
      location,
      company,
      sort = 'recommended',
      page = 1,
      limit = 12
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Base query: openToGuidance === true, not current user, not Private
    const query = {
      openToGuidance: true,
      profileVisibility: { $ne: 'Private' },
      user: { $ne: currentUserId }
    };

    // Topic filter
    if (topic && topic !== 'All') {
      query.guidanceTopics = new RegExp(topic.trim(), 'i');
    }

    // Skills filter
    if (skills && skills !== 'All') {
      const skillsArr = Array.isArray(skills)
        ? skills
        : String(skills)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
      if (skillsArr.length > 0) {
        query.skills = { $in: skillsArr.map((s) => new RegExp(`^${s}$`, 'i')) };
      }
    }

    // Target Role filter
    if (targetRole && targetRole !== 'All') {
      query.targetRole = new RegExp(targetRole.trim(), 'i');
    }

    // College filter
    if (college && college !== 'All') {
      query.college = new RegExp(college.trim(), 'i');
    }

    // Location filter
    if (location && location !== 'All') {
      query.location = new RegExp(location.trim(), 'i');
    }

    // Company / Placement Status filter
    if (company && company !== 'All') {
      query.placementStatus = new RegExp(company.trim(), 'i');
    }

    // Free text search
    if (search && search.trim()) {
      const searchTerm = search.trim();
      const searchRegex = new RegExp(searchTerm, 'i');

      // Search users by name matching the query
      const matchingUsers = await User.find({
        name: searchRegex,
        _id: { $ne: currentUserId }
      }).select('_id');
      const matchingUserIds = matchingUsers.map((u) => u._id);

      query.$or = [
        { user: { $in: matchingUserIds } },
        { targetRole: searchRegex },
        { skills: searchRegex },
        { guidanceTopics: searchRegex },
        { college: searchRegex },
        { location: searchRegex },
        { bio: searchRegex },
        { guidanceBio: searchRegex },
        { guidanceExperience: searchRegex },
        { placementStatus: searchRegex }
      ];
    }

    // Count total matching documents
    const total = await Profile.countDocuments(query);

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'name') {
      sortOptions = { college: 1, createdAt: -1 };
    }

    const profiles = await Profile.find(query)
      .populate('user', 'name email role avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const formattedList = profiles
      .filter((p) => p.user) // Ensure user is not deleted
      .map((p) => formatGuidancePerson(p, p.user));

    return res.status(200).json({
      success: true,
      data: formattedList,
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
 * @route   GET /api/guidance/people/:id
 * @desc    Get guidance profile for a specific person
 * @access  Private (Protected)
 */
const getGuidanceProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user or profile ID format'
      });
    }

    const userObjId = new mongoose.Types.ObjectId(id);

    // Find profile by user ID or profile _id
    const profile = await Profile.findOne({
      $or: [{ user: userObjId }, { _id: userObjId }]
    }).populate('user', 'name email role avatar');

    if (!profile || !profile.user) {
      return res.status(404).json({
        success: false,
        message: 'Guidance profile not found'
      });
    }

    if (!profile.openToGuidance) {
      return res.status(404).json({
        success: false,
        message: 'This user is currently not available for guidance'
      });
    }

    const formatted = formatGuidancePerson(profile, profile.user);

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/guidance/requests
 * @desc    Send a new guidance request to a mentor
 * @access  Private (Protected)
 */
const sendGuidanceRequest = async (req, res, next) => {
  try {
    const requesterId = req.user._id;
    const { mentorId, topic, message, targetCompany, targetRole } = req.body;

    // 1. Validation
    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: 'Mentor ID is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mentor ID format'
      });
    }

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Guidance topic is required'
      });
    }

    if (topic.trim().length < 2 || topic.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Topic must be between 2 and 100 characters'
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Guidance message is required'
      });
    }

    if (message.trim().length < 10 || message.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message must be between 10 and 1000 characters'
      });
    }

    const mentorObjId = new mongoose.Types.ObjectId(mentorId);

    // 2. Prevent self-request
    if (requesterId.toString() === mentorObjId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot request guidance from yourself.'
      });
    }

    // 3. Mentor existence and openToGuidance check
    const mentorUser = await User.findById(mentorObjId);
    if (!mentorUser) {
      return res.status(404).json({
        success: false,
        message: 'Mentor user not found'
      });
    }

    const mentorProfile = await Profile.findOne({ user: mentorObjId });
    if (!mentorProfile || !mentorProfile.openToGuidance) {
      return res.status(400).json({
        success: false,
        message: 'This user is not currently accepting guidance requests.'
      });
    }

    // 4. Check for duplicate pending requests
    const existingPending = await GuidanceRequest.findOne({
      requester: requesterId,
      mentor: mentorObjId,
      status: 'Pending'
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'Guidance request already pending.'
      });
    }

    // 5. Create new Guidance Request
    const guidanceRequest = await GuidanceRequest.create({
      requester: requesterId,
      mentor: mentorObjId,
      topic: topic.trim(),
      message: message.trim(),
      targetCompany: targetCompany ? String(targetCompany).trim() : mentorProfile.placementStatus || '',
      targetRole: targetRole ? String(targetRole).trim() : mentorProfile.targetRole || '',
      status: 'Pending'
    });

    // Populate for response
    await guidanceRequest.populate([
      { path: 'mentor', select: 'name email role avatar' },
      { path: 'requester', select: 'name email role avatar' }
    ]);

    // Send notification to mentor
    const requesterName = req.user.name || guidanceRequest.requester?.name || 'A candidate';
    await notifyGuidanceRequest(mentorObjId, guidanceRequest, requesterName);

    return res.status(201).json({
      success: true,
      message: 'Guidance request sent successfully.',
      data: guidanceRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/guidance/requests/sent
 * @desc    Get all guidance requests sent by authenticated user
 * @access  Private (Protected)
 */
const getSentGuidanceRequests = async (req, res, next) => {
  try {
    const requesterId = req.user._id;

    const requests = await GuidanceRequest.find({ requester: requesterId })
      .populate('mentor', 'name avatar')
      .sort({ createdAt: -1 });

    // Format safe mentor details
    const formatted = await Promise.all(
      requests.map(async (reqDoc) => {
        const mentorUser = reqDoc.mentor || {};
        const mentorProfile = (await Profile.findOne({ user: reqDoc.mentor?._id })) || {};

        return {
          id: reqDoc._id.toString(),
          _id: reqDoc._id.toString(),
          mentorId: mentorUser._id ? mentorUser._id.toString() : '',
          mentorName: mentorUser.name || 'Mentor',
          mentorRole: mentorProfile.targetRole || 'Software Engineer',
          mentorCompany: mentorProfile.placementStatus || 'Tech Company',
          mentorAvatar:
            mentorProfile.avatar ||
            mentorUser.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(mentorUser.name || 'Mentor')}`,
          targetCompany: reqDoc.targetCompany || mentorProfile.placementStatus || '',
          targetRole: reqDoc.targetRole || mentorProfile.targetRole || '',
          topic: reqDoc.topic,
          topics: [reqDoc.topic],
          message: reqDoc.message,
          status: reqDoc.status,
          responseMessage: reqDoc.responseMessage || '',
          statusNote:
            reqDoc.status === 'Accepted'
              ? 'Your guidance request was accepted!'
              : reqDoc.status === 'Rejected'
              ? reqDoc.responseMessage || 'Request declined by mentor.'
              : reqDoc.status === 'Completed'
              ? 'Guidance session completed.'
              : 'Pending mentor response.',
          createdAt: reqDoc.createdAt,
          updatedAt: reqDoc.updatedAt,
          date: reqDoc.createdAt ? reqDoc.createdAt.toISOString().split('T')[0] : ''
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/guidance/requests/received
 * @desc    Get all guidance requests received by authenticated user (as mentor)
 * @access  Private (Protected)
 */
const getReceivedGuidanceRequests = async (req, res, next) => {
  try {
    const mentorId = req.user._id;

    const requests = await GuidanceRequest.find({ mentor: mentorId })
      .populate('requester', 'name avatar')
      .sort({ createdAt: -1 });

    const formatted = await Promise.all(
      requests.map(async (reqDoc) => {
        const studentUser = reqDoc.requester || {};
        const studentProfile = (await Profile.findOne({ user: reqDoc.requester?._id })) || {};

        return {
          id: reqDoc._id.toString(),
          _id: reqDoc._id.toString(),
          requesterId: studentUser._id ? studentUser._id.toString() : '',
          studentName: studentUser.name || 'Student',
          studentCollege: studentProfile.college || 'Engineering Student',
          studentDegree: studentProfile.degree || '',
          studentAvatar:
            studentProfile.avatar ||
            studentUser.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentUser.name || 'Student')}`,
          targetCompany: reqDoc.targetCompany || '',
          targetRole: reqDoc.targetRole || 'Software Engineer',
          topic: reqDoc.topic,
          topics: [reqDoc.topic],
          message: reqDoc.message,
          status: reqDoc.status,
          responseMessage: reqDoc.responseMessage || '',
          statusNote:
            reqDoc.status === 'Accepted'
              ? 'You accepted this guidance request.'
              : reqDoc.status === 'Rejected'
              ? 'You declined this request.'
              : reqDoc.status === 'Completed'
              ? 'Guidance session completed.'
              : 'Pending your review.',
          createdAt: reqDoc.createdAt,
          updatedAt: reqDoc.updatedAt,
          date: reqDoc.createdAt ? reqDoc.createdAt.toISOString().split('T')[0] : ''
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/guidance/requests/:id
 * @desc    Get single guidance request details (requester or mentor only)
 * @access  Private (Protected)
 */
const getGuidanceRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid guidance request ID format'
      });
    }

    const request = await GuidanceRequest.findById(id).populate([
      { path: 'mentor', select: 'name avatar role' },
      { path: 'requester', select: 'name avatar role' }
    ]);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Guidance request not found'
      });
    }

    // Ownership check: only requester or mentor
    const reqUserId = request.requester?._id?.toString() || request.requester?.toString();
    const mentorUserId = request.mentor?._id?.toString() || request.mentor?.toString();

    if (currentUserId !== reqUserId && currentUserId !== mentorUserId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this guidance request'
      });
    }

    return res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/guidance/requests/:id/accept
 * @desc    Mentor accepts a pending guidance request
 * @access  Private (Protected - Mentor only)
 */
const acceptGuidanceRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { responseMessage } = req.body;
    const currentUserId = req.user._id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid guidance request ID format'
      });
    }

    const request = await GuidanceRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Guidance request not found'
      });
    }

    // Mentor ownership check
    if (request.mentor.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Only the designated mentor can accept this request.'
      });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept a request with status: ${request.status}`
      });
    }

    request.status = 'Accepted';
    if (responseMessage && typeof responseMessage === 'string') {
      request.responseMessage = responseMessage.trim().slice(0, 1000);
    }
    await request.save();

    // Notify requester that mentor accepted
    const mentorName = req.user.name || 'Your mentor';
    await notifyGuidanceAccepted(request.requester, request, mentorName);

    return res.status(200).json({
      success: true,
      message: 'Guidance request accepted.',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/guidance/requests/:id/reject
 * @desc    Mentor rejects a pending guidance request
 * @access  Private (Protected - Mentor only)
 */
const rejectGuidanceRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { responseMessage } = req.body;
    const currentUserId = req.user._id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid guidance request ID format'
      });
    }

    const request = await GuidanceRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Guidance request not found'
      });
    }

    // Mentor ownership check
    if (request.mentor.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Only the designated mentor can reject this request.'
      });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a request with status: ${request.status}`
      });
    }

    request.status = 'Rejected';
    if (responseMessage && typeof responseMessage === 'string') {
      request.responseMessage = responseMessage.trim().slice(0, 1000);
    }
    await request.save();

    // Notify requester that mentor declined
    const mentorName = req.user.name || 'The mentor';
    await notifyGuidanceRejected(request.requester, request, mentorName);

    return res.status(200).json({
      success: true,
      message: 'Guidance request rejected.',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/guidance/requests/:id/cancel
 * @desc    Requester cancels a pending guidance request
 * @access  Private (Protected - Requester only)
 */
const cancelGuidanceRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid guidance request ID format'
      });
    }

    const request = await GuidanceRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Guidance request not found'
      });
    }

    // Requester ownership check
    if (request.requester.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Only the requester can cancel this guidance request.'
      });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a request that is already ${request.status}`
      });
    }

    request.status = 'Cancelled';
    await request.save();

    return res.status(200).json({
      success: true,
      message: 'Guidance request cancelled.',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/guidance/requests/:id/complete
 * @desc    Mark an accepted guidance request as completed
 * @access  Private (Protected - Requester or Mentor)
 */
const completeGuidanceRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid guidance request ID format'
      });
    }

    const request = await GuidanceRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Guidance request not found'
      });
    }

    // Requester or Mentor check
    const isRequester = request.requester.toString() === currentUserId;
    const isMentor = request.mentor.toString() === currentUserId;

    if (!isRequester && !isMentor) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to complete this guidance request.'
      });
    }

    if (request.status !== 'Accepted') {
      return res.status(400).json({
        success: false,
        message: 'Only accepted guidance requests can be marked as completed.'
      });
    }

    request.status = 'Completed';
    await request.save();

    // Notify other party that request was completed
    const otherUserId = isRequester ? request.mentor : request.requester;
    const actorName = req.user.name || 'Your partner';
    await notifyGuidanceCompleted(otherUserId, request, actorName);

    return res.status(200).json({
      success: true,
      message: 'Guidance marked as completed.',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGuidancePeople,
  getGuidanceProfile,
  sendGuidanceRequest,
  getSentGuidanceRequests,
  getReceivedGuidanceRequests,
  getGuidanceRequestById,
  acceptGuidanceRequest,
  rejectGuidanceRequest,
  cancelGuidanceRequest,
  completeGuidanceRequest
};
