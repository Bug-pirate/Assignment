
// backend/src/routes/notes.ts
import express from 'express';
import {
  createNote,
  getUserNotes,
  deleteNote,
  updateNote
} from '../controllers/noteController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateCreateNote } from '../middleware/validation.js';

const router = express.Router();

// All note routes require authentication
router.use(authenticateToken);

router.post('/', validateCreateNote, createNote);
router.get('/', getUserNotes);
router.delete('/:noteId', deleteNote);
router.put('/:noteId', validateCreateNote, updateNote);

export default router;