const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'],
      select: false, // Never include email in default queries
    },
    rating: {
      type: Number,
      required: [true, 'Star rating is required'],
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be a whole number between 1 and 5',
      },
    },
    review: {
      type: String,
      required: [true, 'Review description is required'],
      trim: true,
      minlength: [5, 'Review must be at least 5 characters long'],
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    source: {
      type: String,
      enum: ['qr', 'website'],
      default: 'qr',
      index: true,
    },
    metadata: {
      ipHash: String,
      userAgent: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient public query: approved reviews sorted by date or rating
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ status: 1, rating: -1 });
reviewSchema.index({ status: 1, isFeatured: -1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
