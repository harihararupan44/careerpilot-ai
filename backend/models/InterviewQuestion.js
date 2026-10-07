const mongoose = require('mongoose');

const interviewQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['Technical', 'Behavioral', 'HR', 'Managerial', 'General'],
      default: 'General',
      index: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
      index: true
    },
    jobTitle: {
      type: String,
      default: '',
      trim: true,
      index: true
    },
    company: {
      type: String,
      default: '',
      trim: true,
      index: true
    },
    skills: {
      type: [String],
      default: [],
      index: true
    },
    sampleAnswer: {
      type: String,
      default: '',
      trim: true
    },
    tips: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Search index on question text
interviewQuestionSchema.index({ question: 'text', company: 'text', jobTitle: 'text' });

// Ensure virtual id is serialized
interviewQuestionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  }
});

const InterviewQuestion = mongoose.model('InterviewQuestion', interviewQuestionSchema);

module.exports = InterviewQuestion;
