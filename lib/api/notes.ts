// 📘 CODE ORIGIN: Custom - Notes & Flashcards API Client
import axiosInstance from '../axios';

export interface Note {
  id: string;
  userId: string;
  sessionId: string | null;
  content: string;
  createdAt: string;
}

export interface Flashcard {
  id: string;
  userId: string;
  noteId: string | null;
  question: string;
  answer: string;
  createdAt: string;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
}

export const createNote = async (sessionId: string | null, content: string): Promise<Note> => {
  const { data } = await axiosInstance.post('/notes', { sessionId, content });
  return data;
};

export const getSessionNotes = async (sessionId: string): Promise<Note[]> => {
  const { data } = await axiosInstance.get(`/notes/session/${sessionId}`);
  return data;
};

export const getMyNotes = async (): Promise<Note[]> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    console.log('═══════════════════════════════════════════════════════════');
    console.log('NOTES API: getMyNotes() called');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  NOTES REQUEST TOKEN: ${token ? token.substring(0, 40) + '...' : 'NOT FOUND'}`);
    
    const response = await axiosInstance.get('/notes/my-notes');
    
    console.log('  NOTES RESPONSE:', response.data);
    console.log(`  Response status: ${response.status}`);
    console.log(`  Notes count: ${Array.isArray(response.data) ? response.data.length : 'N/A'}`);
    console.log('═══════════════════════════════════════════════════════════');
    
    return response.data;
  } catch (error: any) {
    console.error('═══════════════════════════════════════════════════════════');
    console.error('NOTES API: getMyNotes() ERROR');
    console.error('═══════════════════════════════════════════════════════════');
    console.error(`  NOTES ERROR: ${error.message}`);
    console.error(`  Error status: ${error.response?.status || 'N/A'}`);
    console.error(`  Error data: ${JSON.stringify(error.response?.data || {})}`);
    console.error(`  Request URL: ${error.config?.url || 'N/A'}`);
    console.error('═══════════════════════════════════════════════════════════');
    throw error;
  }
};

export const createFlashcard = async (question: string, answer: string, noteId?: string): Promise<Flashcard> => {
  const { data } = await axiosInstance.post('/notes/flashcards', { question, answer, noteId });
  return data;
};

export const getMyFlashcards = async (): Promise<Flashcard[]> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    console.log('═══════════════════════════════════════════════════════════');
    console.log('FLASHCARDS API: getMyFlashcards() called');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  FLASHCARDS REQUEST TOKEN: ${token ? token.substring(0, 40) + '...' : 'NOT FOUND'}`);
    
    const response = await axiosInstance.get('/notes/flashcards');
    
    console.log('  FLASHCARDS RESPONSE:', response.data);
    console.log(`  Response status: ${response.status}`);
    console.log(`  Flashcards count: ${Array.isArray(response.data) ? response.data.length : 'N/A'}`);
    console.log('═══════════════════════════════════════════════════════════');
    
    return response.data;
  } catch (error: any) {
    console.error('═══════════════════════════════════════════════════════════');
    console.error('FLASHCARDS API: getMyFlashcards() ERROR');
    console.error('═══════════════════════════════════════════════════════════');
    console.error(`  FLASHCARDS ERROR: ${error.message}`);
    console.error(`  Error status: ${error.response?.status || 'N/A'}`);
    console.error(`  Error data: ${JSON.stringify(error.response?.data || {})}`);
    console.error(`  Request URL: ${error.config?.url || 'N/A'}`);
    console.error('═══════════════════════════════════════════════════════════');
    throw error;
  }
};

export const markFlashcardReviewed = async (flashcardId: string): Promise<void> => {
  await axiosInstance.post(`/notes/flashcards/${flashcardId}/review`);
};


