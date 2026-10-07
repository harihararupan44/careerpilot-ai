const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema(
  {
    roundNumber: {
      type: Number,
      required: true
    },
    roundName: {
      type: String,
      required: [true, 'Round name is required'],
      trim: true
    },
    roundType: {
      type: String,
      default: 'Technical',
      trim: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Very Hard'],
      default: 'Medium'
    },
    duration: {
      type: Number, // duration in minutes
      default: 60
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    questions: {
      type: [String],
      default: [],
      validate: [
        (val) => Array.isArray(val) && val.length <= 20,
        'Each round can have at most 20 questions'
      ]
    },
    tips: {
      type: String,
      default: '',
      trim: true
    }
  },
  { _id: true }
);

const interviewExperienceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
      index: true
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      default: null
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters'],
      index: true
    },
    experienceTitle: {
      type: String,
      required: [true, 'Experience title is required'],
      trim: true,
      maxlength: [200, 'Experience title cannot exceed 200 characters']
    },
    overallDifficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Very Hard'],
      default: 'Medium',
      index: true
    },
    experienceType: {
      type: String,
      enum: ['Internship', 'Full-time', 'Part-time', 'Contract', 'Placement'],
      default: 'Full-time',
      index: true
    },
    interviewMode: {
      type: String,
      enum: ['Online', 'Offline', 'Hybrid'],
      default: 'Online'
    },
    interviewProcess: {
      type: String,
      default: '',
      trim: true
    },
    preparationTips: {
      type: String,
      default: '',
      trim: true
    },
    overallExperience: {
      type: String,
      default: '',
      trim: true
    },
    topics: {
      type: [String],
      default: [],
      validate: [
        (val) => Array.isArray(val) && val.length <= 30,
        'Cannot exceed 30 topics'
      ]
    },
    skills: {
      type: [String],
      default: [],
      validate: [
        (val) => Array.isArray(val) && val.length <= 30,
        'Cannot exceed 30 skills'
      ]
    },
    rounds: {
      type: [roundSchema],
      default: [],
      validate: [
        (val) => Array.isArray(val) && val.length <= 15,
        'Cannot have more than 15 interview rounds'
      ]
    },
    questionsAsked: {
      type: [String],
      default: [],
      validate: [
        (val) => Array.isArray(val) && val.length <= 50,
        'Cannot have more than 50 questions asked'
      ]
    },
    result: {
      type: String,
      enum: ['Selected', 'Rejected', 'Waitlisted', 'Pending', 'Prefer not to say'],
      default: 'Selected',
      index: true
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: [0, 'Helpful count cannot be negative'],
      index: true
    },
    helpfulUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

// Indexes for high performance querying
interviewExperienceSchema.index({ createdAt: -1 });
interviewExperienceSchema.index({ companyName: 1, jobTitle: 1 });
interviewExperienceSchema.index({ overallDifficulty: 1, experienceType: 1 });
interviewExperienceSchema.index({ helpfulCount: -1, createdAt: -1 });

// Full text search index
interviewExperienceSchema.index({
  companyName: 'text',
  jobTitle: 'text',
  experienceTitle: 'text',
  interviewProcess: 'text',
  preparationTips: 'text',
  overallExperience: 'text',
  skills: 'text',
  topics: 'text'
});

// JSON transform
interviewExperienceSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id ? ret._id.toString() : undefined;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('InterviewExperience', interviewExperienceSchema);
