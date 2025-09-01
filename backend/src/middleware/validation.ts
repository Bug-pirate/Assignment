
// backend/src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { 
  validateEmail, 
  validatePassword, 
  validateName,
  validateNoteTitle,
  validateNoteContent
} from '../utils/validation.js';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
    return;
  }
  next();
};

// Validation rules
// OTP-only signup validation
export const validateSignup = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
  handleValidationErrors
];

// OTP-only login validation
export const validateLogin = [
  body('email').isEmail().withMessage('Invalid email format'),
  handleValidationErrors
];

export const validateOTP = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  handleValidationErrors
];

export const validateCreateNote = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('Content is required and must be less than 5000 characters'),
  handleValidationErrors
];
