const mongoose = require('mongoose');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Connection = require('../models/Connection');
const {
  notifyConnectionRequest,
  notifyConnectionAccepted,
  notifyConnectionRejected
} = require('../services/notificationService');

/**
 * Format a Profile document with associated User into a safe Public Person object
 */
const formatPublicPerson = (profileDoc, userDoc = null) => {
  if (!profileDoc) return null;

  const user = userDoc || profileDoc.user || {};
  const userId = user._id ? user._id.toString() : profileDoc.user ? profileDoc.user.toString() : profileDoc.id;
  const name = user.name || profileDoc.name || 'CareerPilot Student';

  return {
    id: userId,
    userId: userId,
    name: name,
    avatar: profileDoc.avatar || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    company: profileDoc.placementStatus || 'Student',
    role: profileDoc.targetRole || 'Software Engineer',
    targetRole: profileDoc.targetRole || 'Software Engineer',
    college: profileDoc.college || '',
    degree: profileDoc.degree || '',
    branch: profileDoc.branch || '',
    graduationYear: profileDoc.graduationYear || null,
    location: profileDoc.location || '',
    bio: profileDoc.bio || '',
    skills: Array.isArray(profileDoc.skills) ? profileDoc.skills : [],
    careerInterests: Array.isArray(profileDoc.careerInterests) ? profileDoc.careerInterests : [],
    careerStatus: profileDoc.careerStatus || 'Student',
    achievementSummary: profileDoc.achievementSummary || '',
    placementStatus: profileDoc.placementStatus || '',
    projects: Array.isArray(profileDoc.projects) ? profileDoc.projects : [],
    github: profileDoc.github || '',
    linkedin: profileDoc.linkedin || '',
    portfolio: profileDoc.portfolio || '',
    profileVisibility: profileDoc.profileVisibility || 'Public',
    availableForGuidance: true
  };
};

/**
 * @route   GET /api/people
 * @desc    Explore public community profiles with search and filters
 * @access  Private (Protected)
 */
const getPeople = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const {
      search,
      skills,
      targetRole,
      college,
      location,
      careerStatus,
      company,
      sort = 'recommended',
      page = 1,
      limit = 12
    } = req.query;

    // Base query: Public profiles only, excluding current user
    const query = {
      profileVisibility: { $ne: 'Private' },
      user: { $ne: currentUserId }
    };

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

    // Career Status filter
    if (careerStatus && careerStatus !== 'All') {
      query.careerStatus = careerStatus;
    }

    // Company / Placement Status filter
    if (company && company !== 'All') {
      query.placementStatus = new RegExp(company.trim(), 'i');
    }

    // Skills filter (supports comma-separated list or single skill)
    if (skills && skills !== 'All') {
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

    // Search filter across name, targetRole, skills, college, location, bio
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');

      // First find matching users by name
      const matchingUsers = await User.find({
        name: searchRegex,
        _id: { $ne: currentUserId }
      }).select('_id');

      const userIdsFromName = matchingUsers.map((u) => u._id);

      query.$or = [
        { user: { $in: userIdsFromName } },
        { targetRole: searchRegex },
        { college: searchRegex },
        { location: searchRegex },
        { bio: searchRegex },
        { placementStatus: searchRegex },
        { achievementSummary: searchRegex },
        { skills: searchRegex }
      ];
    }

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Sorting options
    let sortOption = { updatedAt: -1 };
    if (sort === 'recent') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'experience' || sort === 'graduation') {
      sortOption = { graduationYear: 1 };
    }

    const [profiles, total] = await Promise.all([
      Profile.find(query)
        .populate('user', 'name role')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Profile.countDocuments(query)
    ]);

    // Format safe response objects
    const people = profiles
      .filter((p) => p.user) // Filter out any dangling profiles without a user
      .map((p) => formatPublicPerson(p, p.user));

    return res.status(200).json({
      success: true,
      people,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/people/:id
 * @desc    Get public profile of a user by user ID or profile ID
 * @access  Private (Protected)
 */
const getPublicProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Match by user ID or profile ID
    const profile = await Profile.findOne({
      $or: [{ user: id }, { _id: id }]
    }).populate('user', 'name role');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Public career profile not found'
      });
    }

    // Check privacy settings if not own profile
    const isOwner = profile.user && profile.user._id.toString() === currentUserId.toString();
    if (profile.profileVisibility === 'Private' && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'This user profile is set to private'
      });
    }

    const person = formatPublicPerson(profile, profile.user);

    return res.status(200).json({
      success: true,
      person
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/people/:id/connection-status
 * @desc    Check connection relationship status with target user
 * @access  Private (Protected)
 */
const getConnectionStatus = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid target user ID format'
      });
    }

    // Self check
    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(200).json({
        success: true,
        status: 'self'
      });
    }

    // Check connection in either direction
    const connection = await Connection.findOne({
      $or: [
        { sender: currentUserId, receiver: targetUserId },
        { sender: targetUserId, receiver: currentUserId }
      ]
    });

    if (!connection) {
      return res.status(200).json({
        success: true,
        status: 'none'
      });
    }

    if (connection.status === 'Accepted') {
      return res.status(200).json({
        success: true,
        status: 'connected',
        connectionId: connection._id
      });
    }

    if (connection.status === 'Pending') {
      const isSender = connection.sender.toString() === currentUserId.toString();
      return res.status(200).json({
        success: true,
        status: isSender ? 'pending_sent' : 'pending_received',
        connectionId: connection._id
      });
    }

    if (connection.status === 'Rejected') {
      const isSender = connection.sender.toString() === currentUserId.toString();
      return res.status(200).json({
        success: true,
        status: isSender ? 'rejected' : 'none',
        connectionId: connection._id
      });
    }

    return res.status(200).json({
      success: true,
      status: 'none'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/people/:id/connect
 * @desc    Send a connection request to target user
 * @access  Private (Protected)
 */
const sendConnectionRequest = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receiver user ID format'
      });
    }

    // 1. Cannot connect to self
    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot connect with yourself'
      });
    }

    // 2. Receiver must exist
    const receiverUser = await User.findById(receiverId);
    if (!receiverUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user does not exist'
      });
    }

    // 3. Check for existing active or pending connection in either direction
    const existingConnection = await Connection.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existingConnection) {
      if (existingConnection.status === 'Accepted') {
        return res.status(400).json({
          success: false,
          message: 'You are already connected with this user'
        });
      }

      if (existingConnection.status === 'Pending') {
        return res.status(400).json({
          success: false,
          message: 'A connection request is already pending between you and this user'
        });
      }

      // If previous was Rejected, reset to Pending with current sender
      if (existingConnection.status === 'Rejected') {
        existingConnection.sender = senderId;
        existingConnection.receiver = receiverId;
        existingConnection.status = 'Pending';
        await existingConnection.save();

        const senderName = req.user.name || 'Someone';
        await notifyConnectionRequest(receiverId, existingConnection, senderName);

        return res.status(201).json({
          success: true,
          message: 'Connection request sent',
          connection: existingConnection
        });
      }
    }

    // 4. Create new connection document
    const newConnection = await Connection.create({
      sender: senderId,
      receiver: receiverId,
      status: 'Pending'
    });

    const senderName = req.user.name || 'Someone';
    await notifyConnectionRequest(receiverId, newConnection, senderName);

    return res.status(201).json({
      success: true,
      message: 'Connection request sent',
      connection: newConnection
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/people/requests/:id/accept
 * @desc    Accept a pending connection request
 * @access  Private (Protected)
 */
const acceptConnectionRequest = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid connection request ID format'
      });
    }

    const connection = await Connection.findOne({
      _id: id,
      receiver: currentUserId,
      status: 'Pending'
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Pending connection request not found or you are not authorized to accept it'
      });
    }

    connection.status = 'Accepted';
    await connection.save();

    const receiverName = req.user.name || 'Your connection';
    await notifyConnectionAccepted(connection.sender, connection, receiverName);

    return res.status(200).json({
      success: true,
      message: 'Connection request accepted',
      connection
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/people/requests/:id/reject
 * @desc    Reject a pending connection request
 * @access  Private (Protected)
 */
const rejectConnectionRequest = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid connection request ID format'
      });
    }

    const connection = await Connection.findOne({
      _id: id,
      receiver: currentUserId,
      status: 'Pending'
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Pending connection request not found or you are not authorized to reject it'
      });
    }

    connection.status = 'Rejected';
    await connection.save();

    await notifyConnectionRejected(connection.sender, connection);

    return res.status(200).json({
      success: true,
      message: 'Connection request rejected',
      connection
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/people/requests/:id/cancel
 * @desc    Cancel a pending connection request sent by the authenticated user
 * @access  Private (Protected)
 */
const cancelConnectionRequest = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid connection request ID format'
      });
    }

    const connection = await Connection.findOneAndDelete({
      _id: id,
      sender: currentUserId,
      status: 'Pending'
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Pending connection request not found or you are not authorized to cancel it'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Connection request cancelled'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/people/connections/:id
 * @desc    Remove an accepted connection
 * @access  Private (Protected)
 */
const removeConnection = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid connection ID format'
      });
    }

    // Match either by Connection _id or by other user ID
    const connection = await Connection.findOneAndDelete({
      $and: [
        { status: 'Accepted' },
        {
          $or: [
            { _id: id, $or: [{ sender: currentUserId }, { receiver: currentUserId }] },
            { sender: currentUserId, receiver: id },
            { sender: id, receiver: currentUserId }
          ]
        }
      ]
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Accepted connection not found or you are not authorized to remove it'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Connection removed'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/people/connections
 * @desc    Get all accepted connections for authenticated user
 * @access  Private (Protected)
 */
const getConnections = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const { page = 1, limit = 12 } = req.query;

    const query = {
      status: 'Accepted',
      $or: [{ sender: currentUserId }, { receiver: currentUserId }]
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [connections, total] = await Promise.all([
      Connection.find(query)
        .populate('sender', 'name role')
        .populate('receiver', 'name role')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Connection.countDocuments(query)
    ]);

    // Format connections with partner public profile
    const partnerUserIds = connections.map((c) =>
      c.sender._id.toString() === currentUserId.toString() ? c.receiver._id : c.sender._id
    );

    const partnerProfiles = await Profile.find({ user: { $in: partnerUserIds } });
    const profileMap = new Map(partnerProfiles.map((p) => [p.user.toString(), p]));

    const formattedConnections = connections.map((c) => {
      const isSender = c.sender._id.toString() === currentUserId.toString();
      const partnerUser = isSender ? c.receiver : c.sender;
      const partnerProfile = profileMap.get(partnerUser._id.toString()) || { user: partnerUser };

      return {
        connectionId: c._id,
        person: formatPublicPerson(partnerProfile, partnerUser),
        connectedAt: c.updatedAt
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedConnections.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      connections: formattedConnections
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/people/requests
 * @desc    Get all pending connection requests received by authenticated user
 * @access  Private (Protected)
 */
const getPendingRequests = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const { page = 1, limit = 12 } = req.query;

    const query = {
      receiver: currentUserId,
      status: 'Pending'
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      Connection.find(query)
        .populate('sender', 'name role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Connection.countDocuments(query)
    ]);

    const senderUserIds = requests.map((r) => r.sender._id);
    const senderProfiles = await Profile.find({ user: { $in: senderUserIds } });
    const profileMap = new Map(senderProfiles.map((p) => [p.user.toString(), p]));

    const formattedRequests = requests.map((r) => {
      const senderProfile = profileMap.get(r.sender._id.toString()) || { user: r.sender };

      return {
        connectionId: r._id,
        person: formatPublicPerson(senderProfile, r.sender),
        createdAt: r.createdAt
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedRequests.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      requests: formattedRequests
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPeople,
  getPublicProfile,
  getConnectionStatus,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  cancelConnectionRequest,
  removeConnection,
  getConnections,
  getPendingRequests
};
