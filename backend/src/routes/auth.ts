
// backend/src/routes/auth.ts
import express from 'express';
import {
  signup,
  login,
  verifyOTP,
  googleAuth,
  resendOTP,
  getProfile,
  testEmail
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateSignup, validateLogin, validateOTP } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/verify-otp', validateOTP, verifyOTP);
router.post('/google', googleAuth);
router.post('/resend-otp', resendOTP);
router.post('/test-email', testEmail); // dev utility

// Protected routes
router.get('/profile', authenticateToken, getProfile);

export default router;
