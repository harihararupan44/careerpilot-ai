const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
      unique: true
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      lowercase: true,
      trim: true
    },
    logo: {
      type: String,
      default: '',
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters']
    },
    industry: {
      type: String,
      default: 'Technology',
      trim: true,
      index: true
    },
    companySize: {
      type: String,
      enum: {
        values: ['Startup', 'Small', 'Medium', 'Large', 'Enterprise'],
        message: '{VALUE} is not a valid company size'
      },
      default: 'Medium',
      index: true
    },
    companyType: {
      type: String,
      enum: {
        values: ['Private', 'Public', 'Startup', 'Government', 'Non-Profit', 'Other'],
        message: '{VALUE} is not a valid company type'
      },
      default: 'Private',
      index: true
    },
    headquarters: {
      type: String,
      default: '',
      trim: true
    },
    locations: {
      type: [String],
      default: [],
      validate: [
        (val) => Array.isArray(val) && val.length <= 50,
        'Cannot have more than 50 locations'
      ]
    },
    website: {
      type: String,
      default: '',
      trim: true
    },
    foundedYear: {
      type: Number,
      default: null,
      min: [1800, 'Founded year must be >= 1800'],
      max: [2100, 'Founded year must be <= 2100']
    },
    specializations: {
      type: [String],
      default: [],
      validate: [
        (val) => Array.isArray(val) && val.length <= 30,
        'Cannot have more than 30 specializations'
      ]
    },
    skills: {
      type: [String],
      default: [],
      index: true,
      validate: [
        (val) => Array.isArray(val) && val.length <= 50,
        'Cannot have more than 50 skills'
      ]
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

// Auto-generate slug from name if not provided
companySchema.pre('validate', function () {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
});

// Compound and text indexes for search performance
companySchema.index({ isActive: 1, name: 1 });
companySchema.index({ industry: 1, companySize: 1 });
companySchema.index({
  name: 'text',
  description: 'text',
  industry: 'text',
  headquarters: 'text',
  locations: 'text',
  specializations: 'text',
  skills: 'text'
});

// Clean JSON response
companySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id ? ret._id.toString() : undefined;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Company', companySchema);
