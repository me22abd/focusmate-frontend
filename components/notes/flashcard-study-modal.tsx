// 📘 CODE ORIGIN: Custom - Flashcard Study Modal with Flip Animation
'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMyFlashcards, markFlashcardReviewed, type Flashcard } from '@/lib/api/notes';
import { toast } from 'sonner';

interface FlashcardStudyModalProps {
  open: boolean;
  onClose: () => void;
}

export function FlashcardStudyModal({ open, onClose }: FlashcardStudyModalProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadFlashcards();
    }
  }, [open]);

  const loadFlashcards = async () => {
    setLoading(true);
    try {
      const data = await getMyFlashcards();
      setFlashcards(data);
      setCurrentIndex(0);
      setFlipped(false);
    } catch (error) {
      toast.error('Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentIndex < flashcards.length - 1) {
      const currentCard = flashcards[currentIndex];
      await markFlashcardReviewed(currentCard.id);
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFlipped(false);
    }
  };

  if (!open) return null;

  const currentCard = flashcards[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold">
            🃏 Flashcards {flashcards.length > 0 && `(${currentIndex + 1}/${flashcards.length})`}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">Loading flashcards...</div>
          ) : flashcards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No flashcards yet. Create your first one!</p>
            </div>
          ) : (
            <>
              {/* Flashcard */}
              <div
                onClick={() => setFlipped(!flipped)}
                className="min-h-[300px] p-8 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 flex items-center justify-center cursor-pointer transition-all hover:shadow-lg"
              >
                <div className="text-center">
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-4">
                    {flipped ? 'Answer' : 'Question'} (Click to flip)
                  </p>
                  <p className="text-2xl font-semibold">
                    {flipped ? currentCard.answer : currentCard.question}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <Button variant="ghost" size="icon" onClick={() => setFlipped(!flipped)}>
                  <RotateCcw className="h-5 w-5" />
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={currentIndex === flashcards.length - 1}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}















