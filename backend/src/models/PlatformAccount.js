import mongoose from 'mongoose';

const platformAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    platform: {
      type: String,
      enum: ['CODEFORCES', 'LEETCODE', 'HACKERRANK'],
      required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    syncStatus: {
      type: String,
      enum: ['PENDING', 'SYNCING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
    rating: {
      type: Number,
      default: null,
    },
    totalSolved: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Prevent a user from connecting the same platform twice
platformAccountSchema.index({ userId: 1, platform: 1 }, { unique: true });

export default mongoose.model('PlatformAccount', platformAccountSchema);
