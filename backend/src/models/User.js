import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
    },
    bio: {
      type: String,
      maxlength: [250, 'Bio cannot exceed 250 characters'],
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: 'avatar-1',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    githubHandle: {
      type: String,
      trim: true,
      default: '',
    },
    linkedinHandle: {
      type: String,
      trim: true,
      default: '',
    },
    preferredPlatform: {
      type: String,
      enum: ['ALL', 'LEETCODE', 'CODEFORCES', 'HACKERRANK'],
      default: 'ALL',
    },
  },
  { timestamps: true }
);

// Strip password and __v when converted to JSON
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);

