
// backend/src/models/Note.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  _id: string;
  title: string;
  content: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true
});

export const Note = mongoose.model<INote>('Note', noteSchema);

