// backend/src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  password?: string;
  name: string;
  dateOfBirth?: string;
  googleId?: string;
  isEmailVerified: boolean;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: false // OTP-based users won't have a password
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: String,
    required: false
  },
  googleId: {
    type: String,
    sparse: true // Allows multiple null values
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema);
