const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: false,
      index: true
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: false,
      index: true
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true
    },
    interviewType: {
      type: String,
      enum: ['HR', 'Technical', 'Behavioral', 'Managerial', 'Mixed'],
      default: 'Mixed'
    },
    scheduledDate: {
      type: Date,
      required: false,
      index: true
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Completed', 'Cancelled'],
      default: 'Upcoming',
      index: true
    },
    location: {
      type: String,
      default: '',
      trim: true
    },
    meetingUrl: {
      type: String,
      default: '',
      trim: true
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },
    preparationProgress: {
      type: Number,
      default: 0,
      min: [0, 'Preparation progress cannot be less than 0'],
      max: [100, 'Preparation progress cannot exceed 100']
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for fast query performance
interviewSchema.index({ user: 1, status: 1 });
interviewSchema.index({ user: 1, scheduledDate: 1 });
interviewSchema.index({ user: 1, company: 1 });

// Ensure virtual id is serialized
interviewSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  }
});

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;
