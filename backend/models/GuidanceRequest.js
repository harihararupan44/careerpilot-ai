const mongoose = require('mongoose');

const guidanceRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester user ID is required'],
      index: true
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Mentor user ID is required'],
      index: true
    },
    message: {
      type: String,
      required: [true, 'Guidance message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters long'],
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    topic: {
      type: String,
      required: [true, 'Guidance topic is required'],
      trim: true,
      minlength: [2, 'Topic must be at least 2 characters long'],
      maxlength: [100, 'Topic cannot exceed 100 characters']
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Cancelled', 'Completed'],
      default: 'Pending',
      index: true
    },
    targetCompany: {
      type: String,
      default: '',
      trim: true
    },
    targetRole: {
      type: String,
      default: '',
      trim: true
    },
    responseMessage: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Response message cannot exceed 1000 characters']
    }
  },
  {
    timestamps: true
  }
);

// Prevent multiple pending requests between the same requester and mentor
guidanceRequestSchema.index({ requester: 1, mentor: 1, status: 1 });
guidanceRequestSchema.index({ createdAt: -1 });

// Clean JSON response
guidanceRequestSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id ? ret._id.toString() : undefined;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('GuidanceRequest', guidanceRequestSchema);
