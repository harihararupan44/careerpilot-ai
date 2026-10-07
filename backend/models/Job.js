const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    companyRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
      index: true
    },
    companyLogo: {
      type: String,
      default: '',
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
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
    employmentType: {
      type: String,
      enum: {
        values: ['Full-time', 'Part-time', 'Internship', 'Contract'],
        message: '{VALUE} is not a valid employment type'
      },
      default: 'Full-time'
    },
    experience: {
      type: String,
      default: '',
      trim: true
    },
    skills: {
      type: [String],
      default: []
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
    applicationUrl: {
      type: String,
      default: '',
      trim: true
    },
    postedDate: {
      type: Date,
      default: Date.now
    },
    deadline: {
      type: Date,
      default: null
    },
    source: {
      type: String,
      default: '',
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for high performance searches and filtering
jobSchema.index({ isActive: 1, postedDate: -1 });
jobSchema.index({ title: 'text', company: 'text', description: 'text', skills: 'text' });

// Clean JSON response
jobSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Job', jobSchema);
