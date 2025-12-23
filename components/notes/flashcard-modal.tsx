// 📘 CODE ORIGIN: Custom - Flashcard Creation Modal
'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createFlashcard } from '@/lib/api/notes';
import { toast } from 'sonner';

interface FlashcardModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function FlashcardModal({ open, onClose, onCreated }: FlashcardModalProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      toast.error('Both question and answer are required');
      return;
    }
    
    setSaving(true);
    try {
      await createFlashcard(question, answer);
      toast.success('Flashcard created!');
      setQuestion('');
      setAnswer('');
      onCreated?.();
      onClose();
    } catch (error) {
      toast.error('Failed to create flashcard');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold">🃏 Create Flashcard</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What is the capital of France?"
              className="w-full min-h-[80px] p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Answer</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Paris"
              className="w-full min-h-[80px] p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Create Flashcard
          </Button>
        </div>
      </div>
    </div>
  );
}











