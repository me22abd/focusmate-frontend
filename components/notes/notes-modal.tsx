// 📘 CODE ORIGIN: Custom - Session Notes Modal
'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createNote, getSessionNotes, type Note } from '@/lib/api/notes';
import { toast } from 'sonner';

interface NotesModalProps {
  open: boolean;
  onClose: () => void;
  sessionId: string | null;
}

export function NotesModal({ open, onClose, sessionId }: NotesModalProps) {
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && sessionId) {
      loadNotes();
    }
  }, [open, sessionId]);

  const loadNotes = async () => {
    if (!sessionId) return;
    try {
      const data = await getSessionNotes(sessionId);
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    
    setSaving(true);
    try {
      await createNote(sessionId, content);
      toast.success('Note saved!');
      setContent('');
      await loadNotes();
    } catch (error) {
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold">📝 Session Notes</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* New Note */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your notes here..."
              className="w-full min-h-[120px] p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-indigo-500 outline-none resize-none"
            />
            <Button onClick={handleSave} disabled={saving || !content.trim()} className="mt-2">
              <Save className="mr-2 h-4 w-4" />
              Save Note
            </Button>
          </div>

          {/* Previous Notes */}
          {notes.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-slate-600 dark:text-slate-400">Previous Notes</h3>
              {notes.map((note) => (
                <div key={note.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">
                  {note.content}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}








