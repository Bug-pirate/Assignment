import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Logo } from '../components/Logo';
import { CreateNoteModal } from '../components/CreateNoteModal';
import { useAuth } from '../hooks/useAuth';
import { notesService, type NoteDto } from '../services/notes';

interface NoteFormData { title: string; content: string }
interface AuthContextShape { user?: { name?: string; email?: string }; token?: string; logout?: () => void }

export const Dashboard = () => {
  const [notes, setNotes] = useState<NoteDto[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const auth = useAuth() as AuthContextShape | null; // narrow cast until hook exports proper type
  const { user, token, logout } = auth || {};

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      const res = await notesService.list(token);
      if (res.success && res.data) {
        setNotes(res.data.notes);
      } else {
        setError(res.error || 'Failed to load notes');
      }
      setLoading(false);
    };
    load();
  }, [token]);

  const handleSignOut = () => {
    logout?.();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = '/signin';
  };

  const handleCreateNote = () => {
    setIsCreateModalOpen(true);
  };

  const handleSaveNote = async (noteData: NoteFormData) => {
    if (!token) return;
    const res = await notesService.create(token, noteData);
    if (res.success && res.data) {
      setNotes([res.data as NoteDto, ...notes]);
    } else {
      setError(res.error || 'Failed to create note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!token) return;
    const res = await notesService.remove(token, noteId);
    if (res.success) {
      setNotes(notes.filter(n => n._id !== noteId));
    } else {
      setError(res.error || 'Failed to delete note');
    }
  };

  const maskedEmail = (email?: string) => {
    if (!email) return '';
    const [, domainPart] = email.split('@');
    return 'xxxxx@' + (domainPart ? 'xxxx.com' : '');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Responsive centered container */}
      <div className="w-full max-w-screen-sm md:max-w-screen-md lg:max-w-[900px] mx-auto bg-white min-h-screen flex-1 shadow-sm md:shadow">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {/* Logo without HD text: hide span inside Logo */}
            <Logo className="scale-90 md:scale-100 [&>span]:hidden" />
            <span className="font-semibold text-gray-900 text-base md:text-lg">Dashboard</span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-blue-500 text-sm hover:text-blue-600"
          >
            Sign Out
          </button>
        </div>

        {/* Welcome Section */}
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="bg-white rounded-lg p-4 md:p-5 border border-gray-200 shadow-sm">
            <h1 className="text-lg font-semibold text-gray-900 mb-2">Welcome, {user?.name || 'User'}</h1>
            <p className="text-gray-600 text-sm">Email: {maskedEmail(user?.email)}</p>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          {/* Create Note Button */}
          <button
            onClick={handleCreateNote}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 md:py-3.5 px-4 rounded-lg font-medium transition-colors"
          >
            Create Note
          </button>

          {/* Notes Section */}
          <div className="space-y-3 md:space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Notes</h2>

            {/* Notes List */}
            <div className="space-y-3">
              {loading && <p className="text-sm text-gray-500">Loading notes...</p>}
              {!loading && notes.map((note) => (
                <div
                  key={note._id}
                  className="flex items-center justify-between p-3 md:p-3.5 rounded-lg border border-gray-200 bg-white shadow-sm"
                >
                  <span className="text-gray-900 text-sm font-medium">{note.title}</span>
                  <button
                    onClick={() => handleDeleteNote(note._id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Empty state if no notes */}
            {!loading && notes.length === 0 && (
              <div className="text-center py-12 md:py-16 text-gray-500 text-sm">
                <p className="max-w-xs mx-auto">No notes yet. Create your first note!</p>
              </div>
            )}
          </div>
        </div>

        {/* Create Note Modal */}
        <CreateNoteModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleSaveNote}
        />
      </div>
    </div>
  );
};
