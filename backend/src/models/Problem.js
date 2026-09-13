import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: ['CODEFORCES', 'LEETCODE', 'HACKERRANK'],
      required: true,
    },
    externalId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      default: 'UNRATED',
    },
    url: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Compound unique index for problems per platform
problemSchema.index({ platform: 1, externalId: 1 }, { unique: true });

export default mongoose.model('Problem', problemSchema);
