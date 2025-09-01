
// backend/src/controllers/noteController.ts
import { Request, Response } from 'express';
import { Note } from '../models/Note.js';
import { validateNoteTitle, validateNoteContent } from '../utils/validation.js';

export const createNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content } = req.body;
    const userId = req.user!._id;

    // Additional server-side validation
    const titleError = validateNoteTitle(title);
    const contentError = validateNoteContent(content);

    if (titleError || contentError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [titleError, contentError].filter(Boolean)
      });
      return;
    }

    const note = new Note({
      title: title.trim(),
      content: content.trim(),
      userId
    });

    await note.save();

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getUserNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const notes = await Note.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalNotes = await Note.countDocuments({ userId });
    const totalPages = Math.ceil(totalNotes / limit);

    res.status(200).json({
      success: true,
      data: {
        notes,
        pagination: {
          currentPage: page,
          totalPages,
          totalNotes,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;
    const userId = req.user!._id;

    const note = await Note.findOneAndDelete({
      _id: noteId,
      userId
    });

    if (!note) {
      res.status(404).json({
        success: false,
        message: 'Note not found or you do not have permission to delete it'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;
    const { title, content } = req.body;
    const userId = req.user!._id;

    // Validation
    const titleError = validateNoteTitle(title);
    const contentError = validateNoteContent(content);

    if (titleError || contentError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [titleError, contentError].filter(Boolean)
      });
      return;
    }

    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId },
      { 
        title: title.trim(), 
        content: content.trim(),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!note) {
      res.status(404).json({
        success: false,
        message: 'Note not found or you do not have permission to update it'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: note
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
