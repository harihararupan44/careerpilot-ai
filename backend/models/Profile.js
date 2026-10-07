const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    technologies: {
      type: [String],
      default: []
    },
    githubUrl: {
      type: String,
      default: '',
      trim: true
    },
    liveUrl: {
      type: String,
      default: '',
      trim: true
    }
  },
  { _id: true }
);

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    avatar: {
      type: String,
      default: '',
      trim: true
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    college: {
      type: String,
      default: '',
      trim: true,
      index: true
    },
    degree: {
      type: String,
      default: '',
      trim: true
    },
    branch: {
      type: String,
      default: '',
      trim: true
    },
    graduationYear: {
      type: Number,
      default: null,
      min: [1950, 'Graduation year must be valid (>= 1950)'],
      max: [2100, 'Graduation year must be valid (<= 2100)']
    },
    location: {
      type: String,
      default: '',
      trim: true,
      index: true
    },
    bio: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters']
    },
    skills: {
      type: [String],
      default: [],
      index: true
    },
    targetRole: {
      type: String,
      default: '',
      trim: true,
      index: true
    },
    careerInterests: {
      type: [String],
      default: []
    },
    github: {
      type: String,
      default: '',
      trim: true
    },
    linkedin: {
      type: String,
      default: '',
      trim: true
    },
    portfolio: {
      type: String,
      default: '',
      trim: true
    },
    projects: {
      type: [projectSchema],
      default: []
    },
    profileVisibility: {
      type: String,
      enum: ['Public', 'Private'],
      default: 'Public',
      index: true
    },
    careerStatus: {
      type: String,
      enum: [
        'Student',
        'Looking for Internship',
        'Looking for Full-Time',
        'Working',
        'Open to Opportunities'
      ],
      default: 'Student',
      index: true
    },
    achievementSummary: {
      type: String,
      default: '',
      trim: true
    },
    placementStatus: {
      type: String,
      default: '',
      trim: true,
      index: true
    },
    currentCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
      index: true
    },
    openToGuidance: {
      type: Boolean,
      default: false,
      index: true
    },
    guidanceTopics: {
      type: [String],
      default: [],
      index: true
    },
    guidanceBio: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Guidance bio cannot exceed 1000 characters']
    },
    guidanceExperience: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Guidance experience cannot exceed 1000 characters']
    },
    preferredGuidanceMode: {
      type: String,
      enum: ['Online', 'Offline', 'Both'],
      default: 'Online'
    }
  },
  {
    timestamps: true
  }
);

// Search & compound indexes
profileSchema.index({ openToGuidance: 1, profileVisibility: 1 });
profileSchema.index({ profileVisibility: 1, careerStatus: 1 });
profileSchema.index({ profileVisibility: 1, targetRole: 1 });
profileSchema.index({
  bio: 'text',
  targetRole: 'text',
  college: 'text',
  location: 'text',
  achievementSummary: 'text',
  placementStatus: 'text'
});

// Clean JSON serialization
profileSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id ? ret._id.toString() : undefined;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Profile', profileSchema);
