const mongoose = require('mongoose');

const mockQuestionItemSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewQuestion',
      required: false
    },
    question: {
      type: String,
      required: [true, 'Question text snapshot is required']
    },
    answer: {
      type: String,
      default: ''
    },
    answeredAt: {
      type: Date,
      default: null
    }
  },
  { _id: true }
);

const mockInterviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: false,
      index: true
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: false,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Mock interview title is required'],
      trim: true
    },
    interviewType: {
      type: String,
      enum: ['HR', 'Technical', 'Behavioral', 'Mixed'],
      default: 'Mixed'
    },
    questions: {
      type: [mockQuestionItemSchema],
      default: []
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed'],
      default: 'Not Started',
      index: true
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    overallNotes: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes
mockInterviewSchema.index({ user: 1, status: 1 });
mockInterviewSchema.index({ user: 1, createdAt: -1 });

// Ensure virtual id is serialized
mockInterviewSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  }
});

const MockInterview = mongoose.model('MockInterview', mockInterviewSchema);

module.exports = MockInterview;
