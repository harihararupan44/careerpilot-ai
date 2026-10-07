const { Notification } = require('../models/Notification');
const mongoose = require('mongoose');

const extractObjectId = (val) => {
  if (!val) return null;
  if (val instanceof mongoose.Types.ObjectId) return val;
  if (val._id && mongoose.Types.ObjectId.isValid(val._id)) return new mongoose.Types.ObjectId(val._id);
  if (val.id && mongoose.Types.ObjectId.isValid(val.id)) return new mongoose.Types.ObjectId(val.id);
  if (typeof val === 'string' && mongoose.Types.ObjectId.isValid(val)) return new mongoose.Types.ObjectId(val);
  return null;
};

/**
 * Low-level notification creator with duplicate prevention via reminderKey
 */
const createNotification = async ({
  user,
  type,
  title,
  message,
  relatedEntityType = 'None',
  relatedEntityId = null,
  priority = 'NORMAL',
  scheduledFor = null,
  reminderKey = null
}) => {
  try {
    const validUserId = extractObjectId(user);
    if (!validUserId) return null;

    const validEntityId = extractObjectId(relatedEntityId);

    // Check duplicate if reminderKey provided
    if (reminderKey) {
      const existing = await Notification.findOne({
        user: validUserId,
        reminderKey
      });
      if (existing) {
        return existing;
      }
    }

    const docData = {
      user: validUserId,
      type,
      title: String(title).trim(),
      message: String(message).trim(),
      relatedEntityType,
      relatedEntityId: validEntityId,
      priority,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null
    };

    if (reminderKey && typeof reminderKey === 'string') {
      docData.reminderKey = reminderKey.trim();
    }

    const notification = await Notification.create(docData);
    return notification;
  } catch (error) {
    // Catch duplicate key gracefully (e.g. race condition on unique reminderKey)
    if (error.code === 11000 && reminderKey) {
      return await Notification.findOne({ user: extractObjectId(user), reminderKey });
    }
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

/**
 * Triggered when an application status changes
 */
const notifyApplicationStatusChange = async (userId, application, oldStatus, newStatus) => {
  if (!application || !oldStatus || !newStatus || oldStatus === newStatus) return null;

  const jobTitle = application.jobTitle || 'Job Application';
  const company = application.company || 'Company';

  const isHighPriority = ['Interview', 'Offer'].includes(newStatus);

  return createNotification({
    user: userId,
    type: 'APPLICATION_STATUS',
    title: 'Application Status Updated',
    message: `Your application for ${jobTitle} at ${company} moved to ${newStatus}.`,
    relatedEntityType: 'Application',
    relatedEntityId: application._id,
    priority: isHighPriority ? 'HIGH' : 'NORMAL'
  });
};

/**
 * Triggered for upcoming interview
 */
const notifyInterviewUpcoming = async (userId, interview, timeDescription = 'soon') => {
  if (!interview || interview.status === 'Cancelled') return null;

  const interviewType = interview.interviewType || 'Interview';
  const company = interview.company || 'Company';
  const dateStr = interview.scheduledDate
    ? new Date(interview.scheduledDate).toISOString().split('T')[0]
    : 'upcoming';

  const reminderKey = `interview_${interview._id}_${dateStr}`;

  return createNotification({
    user: userId,
    type: 'INTERVIEW_UPCOMING',
    title: 'Upcoming Interview',
    message: `Your ${interviewType} at ${company} is scheduled ${timeDescription}.`,
    relatedEntityType: 'Interview',
    relatedEntityId: interview._id,
    priority: 'HIGH',
    reminderKey
  });
};

/**
 * Triggered when interview status changes
 */
const notifyInterviewStatusChange = async (userId, interview, oldStatus, newStatus) => {
  if (!interview || !oldStatus || !newStatus || oldStatus === newStatus) return null;

  const interviewType = interview.interviewType || 'Interview';
  const company = interview.company || 'Company';

  return createNotification({
    user: userId,
    type: 'INTERVIEW_STATUS',
    title: 'Interview Status Updated',
    message: `Your ${interviewType} at ${company} has been marked as ${newStatus}.`,
    relatedEntityType: 'Interview',
    relatedEntityId: interview._id,
    priority: 'NORMAL'
  });
};

/**
 * Triggered when User A sends a guidance request to User B (mentor)
 */
const notifyGuidanceRequest = async (mentorId, guidanceRequest, requesterName) => {
  if (!mentorId || !guidanceRequest) return null;

  const topic = guidanceRequest.topic || 'Career Guidance';
  const name = requesterName || 'A candidate';

  return createNotification({
    user: mentorId,
    type: 'GUIDANCE_REQUEST',
    title: 'New Career Guidance Request',
    message: `${name} sent you a career guidance request for "${topic}".`,
    relatedEntityType: 'GuidanceRequest',
    relatedEntityId: guidanceRequest._id,
    priority: 'NORMAL'
  });
};

/**
 * Triggered when mentor accepts guidance request
 */
const notifyGuidanceAccepted = async (requesterId, guidanceRequest, mentorName) => {
  if (!requesterId || !guidanceRequest) return null;

  const topic = guidanceRequest.topic || 'Career Guidance';
  const name = mentorName || 'Your mentor';

  return createNotification({
    user: requesterId,
    type: 'GUIDANCE_ACCEPTED',
    title: 'Guidance Request Accepted',
    message: `${name} accepted your guidance request for "${topic}".`,
    relatedEntityType: 'GuidanceRequest',
    relatedEntityId: guidanceRequest._id,
    priority: 'HIGH'
  });
};

/**
 * Triggered when mentor declines guidance request
 */
const notifyGuidanceRejected = async (requesterId, guidanceRequest, mentorName) => {
  if (!requesterId || !guidanceRequest) return null;

  const topic = guidanceRequest.topic || 'Career Guidance';
  const name = mentorName || 'The mentor';

  return createNotification({
    user: requesterId,
    type: 'GUIDANCE_REJECTED',
    title: 'Guidance Request Declined',
    message: `${name} declined your guidance request for "${topic}".`,
    relatedEntityType: 'GuidanceRequest',
    relatedEntityId: guidanceRequest._id,
    priority: 'LOW'
  });
};

/**
 * Triggered when guidance request is completed
 */
const notifyGuidanceCompleted = async (recipientId, guidanceRequest, actorName) => {
  if (!recipientId || !guidanceRequest) return null;

  const topic = guidanceRequest.topic || 'Career Guidance';

  return createNotification({
    user: recipientId,
    type: 'GUIDANCE_COMPLETED',
    title: 'Guidance Session Completed',
    message: `The career guidance session for "${topic}" has been marked as completed.`,
    relatedEntityType: 'GuidanceRequest',
    relatedEntityId: guidanceRequest._id,
    priority: 'NORMAL'
  });
};

/**
 * Triggered when User A sends connection request to User B
 */
const notifyConnectionRequest = async (receiverId, connection, senderName) => {
  if (!receiverId || !connection) return null;

  const name = senderName || 'Someone';

  return createNotification({
    user: receiverId,
    type: 'CONNECTION_REQUEST',
    title: 'New Connection Request',
    message: `${name} sent you a connection request.`,
    relatedEntityType: 'Connection',
    relatedEntityId: connection._id,
    priority: 'NORMAL'
  });
};

/**
 * Triggered when connection request is accepted
 */
const notifyConnectionAccepted = async (senderId, connection, receiverName) => {
  if (!senderId || !connection) return null;

  const name = receiverName || 'Your connection';

  return createNotification({
    user: senderId,
    type: 'CONNECTION_ACCEPTED',
    title: 'Connection Request Accepted',
    message: `${name} accepted your connection request.`,
    relatedEntityType: 'Connection',
    relatedEntityId: connection._id,
    priority: 'NORMAL'
  });
};

/**
 * Triggered when connection request is rejected
 */
const notifyConnectionRejected = async (senderId, connection) => {
  if (!senderId || !connection) return null;

  return createNotification({
    user: senderId,
    type: 'CONNECTION_REJECTED',
    title: 'Connection Request Declined',
    message: 'Your connection request was declined.',
    relatedEntityType: 'Connection',
    relatedEntityId: connection._id,
    priority: 'LOW'
  });
};

/**
 * Application deadline reminder creator
 */
const createDeadlineReminder = async (userId, application, daysLeft, targetDateStr) => {
  if (!application) return null;

  const jobTitle = application.jobTitle || 'Job Application';
  const company = application.company || 'Company';
  const reminderKey = `deadline_${application._id}_${daysLeft}d_${targetDateStr}`;

  const timeLabel =
    daysLeft === 0
      ? 'is today'
      : daysLeft === 1
      ? 'is tomorrow'
      : `is approaching in ${daysLeft} days`;

  return createNotification({
    user: userId,
    type: 'APPLICATION_DEADLINE',
    title: 'Application Deadline Approaching',
    message: `Your application deadline for ${jobTitle} at ${company} ${timeLabel}.`,
    relatedEntityType: 'Application',
    relatedEntityId: application._id,
    priority: 'HIGH',
    reminderKey
  });
};

/**
 * Application follow-up reminder creator
 */
const createFollowUpReminder = async (userId, application, daysLeft, targetDateStr) => {
  if (!application) return null;

  const jobTitle = application.jobTitle || 'Job Application';
  const company = application.company || 'Company';
  const reminderKey = `followup_${application._id}_${daysLeft}d_${targetDateStr}`;

  const message =
    daysLeft <= 0
      ? `It's time to follow up on your ${jobTitle} application at ${company}.`
      : `Follow-up for ${jobTitle} at ${company} is due ${daysLeft === 1 ? 'tomorrow' : `in ${daysLeft} days`}.`;

  return createNotification({
    user: userId,
    type: 'APPLICATION_FOLLOWUP',
    title: 'Application Follow-up Reminder',
    message,
    relatedEntityType: 'Application',
    relatedEntityId: application._id,
    priority: 'HIGH',
    reminderKey
  });
};

module.exports = {
  createNotification,
  notifyApplicationStatusChange,
  notifyInterviewUpcoming,
  notifyInterviewStatusChange,
  notifyGuidanceRequest,
  notifyGuidanceAccepted,
  notifyGuidanceRejected,
  notifyGuidanceCompleted,
  notifyConnectionRequest,
  notifyConnectionAccepted,
  notifyConnectionRejected,
  createDeadlineReminder,
  createFollowUpReminder
};
