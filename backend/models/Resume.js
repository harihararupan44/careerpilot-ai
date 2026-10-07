const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    institution: {
      type: String,
      default: '',
      trim: true
    },
    degree: {
      type: String,
      default: '',
      trim: true
    },
    fieldOfStudy: {
      type: String,
      default: '',
      trim: true
    },
    startYear: {
      type: Number,
      default: null
    },
    endYear: {
      type: Number,
      default: null
    }
  },
  { _id: true }
);

const experienceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      default: '',
      trim: true
    },
    role: {
      type: String,
      default: '',
      trim: true
    },
    startDate: {
      type: String,
      default: '',
      trim: true
    },
    endDate: {
      type: String,
      default: '',
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    }
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: '',
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

const certificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: '',
      trim: true
    },
    issuer: {
      type: String,
      default: '',
      trim: true
    },
    issueDate: {
      type: String,
      default: '',
      trim: true
    },
    credentialUrl: {
      type: String,
      default: '',
      trim: true
    }
  },
  { _id: true }
);

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Resume title is required'],
      default: 'My Resume',
      trim: true
    },
    fileName: {
      type: String,
      default: '',
      trim: true
    },
    fileUrl: {
      type: String,
      default: '',
      trim: true
    },
    summary: {
      type: String,
      default: '',
      trim: true
    },
    skills: {
      type: [String],
      default: []
    },
    education: {
      type: [educationSchema],
      default: []
    },
    experience: {
      type: [experienceSchema],
      default: []
    },
    projects: {
      type: [projectSchema],
      default: []
    },
    certifications: {
      type: [certificationSchema],
      default: []
    },
    achievements: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: false
    },
    version: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

// Clean JSON serialization
resumeSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Resume', resumeSchema);
