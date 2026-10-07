const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'APPLICATION_STATUS',
  'APPLICATION_DEADLINE',
  'APPLICATION_FOLLOWUP',
  'INTERVIEW_UPCOMING',
  'INTERVIEW_STATUS',
  'GUIDANCE_REQUEST',
  'GUIDANCE_ACCEPTED',
  'GUIDANCE_REJECTED',
  'GUIDANCE_COMPLETED',
  'CONNECTION_REQUEST',
  'CONNECTION_ACCEPTED',
  'CONNECTION_REJECTED',
  'AI_RESULT',
  'SYSTEM'
];

const NOTIFICATION_PRIORITIES = ['LOW', 'NORMAL', 'HIGH'];

const RELATED_ENTITY_TYPES = [
  'Application',
  'Interview',
  'GuidanceRequest',
  'Connection',
  'Resume',
  'Job',
  'MockInterview',
  'Company',
  'None'
];

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    type: {
      type: String,
      enum: {
        values: NOTIFICATION_TYPES,
        message: '{VALUE} is not a valid notification type'
      },
      required: [true, 'Notification type is required']
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    relatedEntityType: {
      type: String,
      enum: {
        values: RELATED_ENTITY_TYPES,
        message: '{VALUE} is not a valid related entity type'
      },
      default: 'None'
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date,
      default: null
    },
    priority: {
      type: String,
      enum: {
        values: NOTIFICATION_PRIORITIES,
        message: '{VALUE} is not a valid priority level'
      },
      default: 'NORMAL'
    },
    scheduledFor: {
      type: Date,
      default: null
    },
    reminderKey: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for optimal performance and query efficiency
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, scheduledFor: 1 });
notificationSchema.index(
  { user: 1, reminderKey: 1 },
  { unique: true, partialFilterExpression: { reminderKey: { $type: 'string' } } }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = {
  Notification,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  RELATED_ENTITY_TYPES
};
