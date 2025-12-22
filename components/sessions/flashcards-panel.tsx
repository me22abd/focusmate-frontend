/**
 * ============================================================================
 * COMPONENTS/SESSIONS/FLASHCARDS-PANEL.TSX - FLASHCARDS PANEL WITH STUDY MODE
 * ============================================================================
 * 
 * Purpose: Flashcard management with study mode, flip cards, difficulty tracking.
 * 
 * @author Marvelous Eromonsele
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Brain, RotateCcw, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { getMyFlashcards, createFlashcard, markFlashcardReviewed, type Flashcard } from '@/lib/api/notes';
import { cn } from '@/lib/utils';

export function FlashcardsPanel() {
  const { user } = useAuthStore();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCount, setStudiedCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      fetchFlashcards();
    }
  }, [user?.id]);

  const fetchFlashcards = async () => {
    try {
      const data = await getMyFlashcards();
      setFlashcards(data);
    } catch (error) {
      console.error('Failed to fetch flashcards:', error);
      toast.error('Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  const startStudyMode = () => {
    if (flashcards.length === 0) {
      toast.error('No flashcards to study');
      return;
    }
    setStudyMode(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudiedCount(0);
  };

  const handleDifficulty = async (difficulty: 'easy' | 'medium' | 'hard') => {
    const current = flashcards[currentIndex];
    if (current) {
      await markFlashcardReviewed(current.id);
      setStudiedCount(prev => prev + 1);
      
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
      } else {
        toast.success('Study session complete!');
        setStudyMode(false);
        fetchFlashcards();
      }
    }
  };

  const currentCard = flashcards[currentIndex];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">Loading flashcards...</p>
      </div>
    );
  }

  if (studyMode && currentCard) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Study Mode
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {currentIndex + 1} of {flashcards.length} • {studiedCount} studied
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setStudyMode(false)}>
            Exit Study
          </Button>
        </div>

        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, rotateY: 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-indigo-200 dark:border-indigo-800 min-h-[300px]">
            <CardContent className="p-8 flex flex-col items-center justify-center h-full">
              <div className="text-center space-y-6 w-full">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {isFlipped ? 'Answer' : 'Question'}
                </div>
                
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xl font-semibold text-slate-900 dark:text-white"
                >
                  {isFlipped ? currentCard.answer : currentCard.question}
                </motion.div>

                {!isFlipped && (
                  <Button
                    onClick={() => setIsFlipped(true)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Show Answer
                  </Button>
                )}

                {isFlipped && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                      How well did you know this?
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => handleDifficulty('easy')}
                        className="gap-2 text-green-600 border-green-200"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Easy
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDifficulty('medium')}
                        className="gap-2 text-yellow-600 border-yellow-200"
                      >
                        <Clock className="h-4 w-4" />
                        Medium
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDifficulty('hard')}
                        className="gap-2 text-red-600 border-red-200"
                      >
                        <XCircle className="h-4 w-4" />
                        Hard
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Flashcards
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {flashcards.length} flashcard{flashcards.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {flashcards.length > 0 && (
            <Button size="sm" variant="outline" onClick={startStudyMode}>
              <Brain className="h-4 w-4 mr-2" />
              Study
            </Button>
          )}
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {flashcards.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed">
          <Brain className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No flashcards yet
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Create your first flashcard to start studying
          </p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Flashcard
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {flashcards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-2 border-slate-200 dark:border-slate-800">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Question</div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {card.question}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Answer</div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {card.answer}
                      </p>
                    </div>
                    {card.nextReviewAt && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Next review: {new Date(card.nextReviewAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Add Flashcard</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  try {
                    await createFlashcard(
                      formData.get('question') as string,
                      formData.get('answer') as string
                    );
                    toast.success('Flashcard created');
                    setShowAddDialog(false);
                    fetchFlashcards();
                  } catch (error) {
                    toast.error('Failed to create flashcard');
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium mb-2 block">Question</label>
                  <textarea
                    name="question"
                    placeholder="Enter question..."
                    required
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Answer</label>
                  <textarea
                    name="answer"
                    placeholder="Enter answer..."
                    required
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Create</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

