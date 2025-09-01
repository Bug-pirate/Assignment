// frontend/src/types/note.ts
export interface Note {
  _id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
}

export interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// Shared types for both frontend and backend
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: ValidationError[];
}
