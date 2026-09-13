import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ['CODEFORCES', 'LEETCODE', 'HACKERRANK'],
      required: true,
    },
    platformSubmissionId: {
      type: String,
      required: true,
    },
    problemId: {
      type: String,
      required: true,
    },
    problemName: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      default: 'UNRATED',
    },
    language: {
      type: String,
      default: '',
    },
    verdict: {
      type: String,
      required: true, // e.g. "OK", "WRONG_ANSWER", "ACCEPTED"
    },
    submittedAt: {
      type: Date,
      required: true,
      index: true,
    },
    contestId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound unique index prevents duplicate submissions per platform
submissionSchema.index({ platform: 1, platformSubmissionId: 1 }, { unique: true });

export default mongoose.model('Submission', submissionSchema);
