const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: false,
      index: true
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: false
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
    applicationUrl: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected', 'Withdrawn'],
        message: '{VALUE} is not a valid application status'
      },
      default: 'Applied',
      index: true
    },
    appliedDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    deadline: {
      type: Date,
      default: null
    },
    followUpDate: {
      type: Date,
      default: null,
      index: true
    },
    location: {
      type: String,
      default: '',
      trim: true
    },
    workMode: {
      type: String,
      enum: {
        values: ['On-site', 'Remote', 'Hybrid'],
        message: '{VALUE} is not a valid work mode'
      },
      default: 'On-site'
    },
    experience: {
      type: String,
      default: '',
      trim: true
    },
    salaryMin: {
      type: Number,
      default: null
    },
    salaryMax: {
      type: Number,
      default: null
    },
    salaryCurrency: {
      type: String,
      default: 'INR',
      trim: true
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },
    contactPerson: {
      type: String,
      default: '',
      trim: true
    },
    contactEmail: {
      type: String,
      default: '',
      trim: true
    },
    source: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for optimal sorting and filtering by user
applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ user: 1, appliedDate: -1 });
applicationSchema.index({ user: 1, followUpDate: 1 });

// Clean JSON serialization
applicationSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Application', applicationSchema);
