// frontend/src/services/notes.ts

export interface NoteDto {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NotesListResponse {
  notes: NoteDto[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalNotes: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const NOTES_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notes`;

async function request<T>(endpoint: string, token: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; error?: string }>{
  try {
    const res = await fetch(`${NOTES_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
      }
    });
    const json = await res.json().catch(() => ({}));
    if(!res.ok){
      return { success: false, error: json.message || 'Request failed' };
    }
    return { success: true, data: json.data || json };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

export const notesService = {
  async list(token: string, page = 1){
    return request<{ notes: NoteDto[]; pagination: NotesListResponse['pagination'] }>(`?page=${page}`, token);
  },
  async create(token: string, note: { title: string; content: string }){
    return request<NoteDto>('', token, { method: 'POST', body: JSON.stringify(note) });
  },
  async remove(token: string, id: string){
    return request<unknown>(`/${id}`, token, { method: 'DELETE' });
  },
  async update(token: string, id: string, note: { title: string; content: string }){
    return request<NoteDto>(`/${id}`, token, { method: 'PUT', body: JSON.stringify(note) });
  }
};

export default notesService;