// backend/src/utils/validation.ts
import { ValidationError } from '../types/auth.js';

export const validateEmail = (email: string): ValidationError | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { field: 'email', message: 'Email is required' };
  }
  if (!emailRegex.test(email)) {
    return { field: 'email', message: 'Invalid email format' };
  }
  return null;
};

export const validatePassword = (password: string): ValidationError | null => {
  if (!password) {
    return { field: 'password', message: 'Password is required' };
  }
  if (password.length < 8) {
    return { field: 'password', message: 'Password must be at least 8 characters long' };
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { field: 'password', message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' };
  }
  return null;
};

export const validateName = (name: string): ValidationError | null => {
  if (!name || name.trim().length === 0) {
    return { field: 'name', message: 'Name is required' };
  }
  if (name.length < 2) {
    return { field: 'name', message: 'Name must be at least 2 characters long' };
  }
  if (name.length > 50) {
    return { field: 'name', message: 'Name must be less than 50 characters' };
  }
  return null;
};

export const validateNoteTitle = (title: string): ValidationError | null => {
  if (!title || title.trim().length === 0) {
    return { field: 'title', message: 'Title is required' };
  }
  if (title.length > 200) {
    return { field: 'title', message: 'Title must be less than 200 characters' };
  }
  return null;
};

export const validateNoteContent = (content: string): ValidationError | null => {
  if (!content || content.trim().length === 0) {
    return { field: 'content', message: 'Content is required' };
  }
  if (content.length > 5000) {
    return { field: 'content', message: 'Content must be less than 5000 characters' };
  }
  return null;
};
