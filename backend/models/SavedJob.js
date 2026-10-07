const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema(
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
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index ensuring a user cannot save the same job multiple times
savedJobSchema.index({ user: 1, job: 1 }, { unique: true });

// Clean JSON response
savedJobSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('SavedJob', savedJobSchema);
