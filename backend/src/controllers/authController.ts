import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User.js';
import { OTP } from '../models/OTP.js';
import { generateToken } from '../utils/jwt.js';
import { sendOTPEmail } from '../services/emailService.js';
import { generateOTP } from '../services/otpService.js';
import { verifyGoogleToken } from '../services/googleAuth.js';

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, dateOfBirth } = req.body;

    // Validate required fields
    if (!email || !name || !dateOfBirth) {
      res.status(400).json({
        success: false,
        message: 'Email, name, and date of birth are required'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Generate and send OTP (don't create user yet)
    const otp = generateOTP();
    
    // Store temporary user data with OTP
    await OTP.create({ 
      email, 
      otp,
      userData: {
        name,
        email,
        dateOfBirth
      }
    });

    let emailSent = true;
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      emailSent = false;
      console.error('Failed to send OTP email:', emailError);
    }

    const includeDevOtp = process.env.EXPOSE_DEV_OTP === 'true';
    res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete signup.',
      data: {
        devOtp: includeDevOtp ? otp : undefined,
        emailSent
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({ success: false, message: 'Email and OTP are required' });
      return;
    }

    const otpRecord = await OTP.findOne({ email, otp, isUsed: false, expiresAt: { $gt: new Date() } });

    if (!otpRecord) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
      return;
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    let user = await User.findOne({ email });

    if (!user && otpRecord.userData) {
      user = new User({
        email: otpRecord.userData.email,
        name: otpRecord.userData.name,
        dateOfBirth: otpRecord.userData.dateOfBirth,
        isEmailVerified: true
      });
      await user.save();
    } else if (user) {
      user.isEmailVerified = true;
      await user.save();
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found and no signup data available'
      });
      return;
    }

    let token: string;
    try {
      token = generateToken({ userId: user._id, email: user.email });
    } catch (jwtErr) {
      console.error('JWT generation failed', jwtErr);
      res.status(500).json({ success: false, message: 'Token generation failed' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          dateOfBirth: user.dateOfBirth
        }
      }
    });
  } catch (error: any) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error.message || 'error') : undefined
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required'
      });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'No account found with this email. Please sign up first.'
      });
      return;
    }

    const otp = generateOTP();
    await OTP.create({ email, otp });

    let emailSent = true;
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      emailSent = false;
      console.error('Failed to send OTP email:', emailError);
    }

    const includeDevOtp = process.env.EXPOSE_DEV_OTP === 'true';
    res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please verify to login.',
      data: {
        devOtp: includeDevOtp ? otp : undefined,
        emailSent
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token: googleToken, idToken } = req.body;
    const tokenToVerify = googleToken || idToken;

    if (!tokenToVerify) {
      res.status(400).json({
        success: false,
        message: 'Google token is required'
      });
      return;
    }

    const googleUser = await verifyGoogleToken(tokenToVerify);
    if (!googleUser) {
      res.status(400).json({
        success: false,
        message: 'Invalid Google token'
      });
      return;
    }

    let user = await User.findOne({ 
      $or: [
        { email: googleUser.email },
        { googleId: googleUser.id }
      ]
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleUser.id;
        user.isEmailVerified = true;
        user.profilePicture = googleUser.picture;
        await user.save();
      }
    } else {
      user = new User({
        email: googleUser.email,
        name: googleUser.name,
        googleId: googleUser.id,
        isEmailVerified: true,
        profilePicture: googleUser.picture
      });
      await user.save();
    }

    const token = generateToken({ userId: user._id, email: user.email });

    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          dateOfBirth: user.dateOfBirth
        },
        token
      }
    });
  } catch (error) {
    console.error('Google auth error:', (error as any)?.message || error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email });
    const pendingSignupOTP = await OTP.findOne({ email, isUsed: false, userData: { $exists: true } });

    if (!user && !pendingSignupOTP) {
      res.status(404).json({ success: false, message: 'No signup or user found for this email' });
      return;
    }

    if (user && user.isEmailVerified && !pendingSignupOTP) {
      res.status(400).json({ success: false, message: 'Email already verified' });
      return;
    }

    const otp = generateOTP();
    let userData = pendingSignupOTP?.userData;
    await OTP.create({ email, otp, userData });

    let emailSent = true;
    try {
      await sendOTPEmail(email, otp);
    } catch (err) {
      emailSent = false;
      console.error('Failed to resend OTP email:', err);
    }

    const includeDevOtp = process.env.EXPOSE_DEV_OTP === 'true';
    res.status(200).json({ 
      success: true, 
      message: 'OTP resent successfully',
      data: { devOtp: includeDevOtp ? otp : undefined, emailSent }
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const testEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { to } = req.body;
    if (!to) {
      res.status(400).json({ success: false, message: 'Provide recipient email in body: { "to": "you@example.com" }' });
      return;
    }
    const fakeOtp = '123456';
    try {
      await sendOTPEmail(to, fakeOtp);
      res.status(200).json({ success: true, message: 'Email dispatched (or preview available if using Ethereal)' });
    } catch (e: any) {
      res.status(500).json({ success: false, message: 'Email send failed', error: e.message });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};