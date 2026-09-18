import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['SOLVE_PROBLEMS', 'RATING_TARGET', 'TOPIC_MASTERY', 'STREAK'],
      required: true,
    },
    platform: {
      type: String,
      enum: ['ALL', 'LEETCODE', 'CODEFORCES', 'HACKERRANK'],
      default: 'ALL',
    },
    target: {
      type: Number,
      required: true,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['IN_PROGRESS', 'COMPLETED', 'FAILED'],
      default: 'IN_PROGRESS',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Goal', goalSchema);
