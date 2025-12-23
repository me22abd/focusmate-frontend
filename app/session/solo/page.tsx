'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Timer, FileText, X, User, Plus } from 'lucide-react';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const SESSION_STORAGE_KEY = 'focusmate_active_solo_session';
const NOTES_STORAGE_KEY = 'focusmate_session_notes';

function SoloSessionContent() {
  useAuthGuard();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const focusTopic = searchParams.get('focusTopic') || '';
  const studyGoal = searchParams.get('studyGoal') || '';
  const duration = parseInt(searchParams.get('duration') || '25', 10);

  // Load saved session state from localStorage (persist across reloads)
  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    if (typeof window === 'undefined') return duration * 60;
    
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const sessionData = JSON.parse(saved);
        const elapsed = Math.floor((Date.now() - sessionData.startTime) / 1000);
        const remaining = Math.max(0, sessionData.initialSeconds - elapsed);
        return remaining;
      }
    } catch {
      // Ignore errors
    }
    return duration * 60;
  });

  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem(NOTES_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  // Save session state to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const sessionData = {
      startTime: Date.now() - (duration * 60 - secondsRemaining) * 1000,
      initialSeconds: duration * 60,
      focusTopic,
      studyGoal,
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  }, [duration, focusTopic, studyGoal, secondsRemaining]);

  // Save notes to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(NOTES_STORAGE_KEY, notes);
  }, [notes]);

  // Timer effect
  useEffect(() => {
    if (!isActive || secondsRemaining <= 0) {
      // Clear saved session when done
      if (secondsRemaining <= 0 && typeof window !== 'undefined') {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          if (typeof window !== 'undefined') {
            localStorage.removeItem(SESSION_STORAGE_KEY);
          }
          toast.success('Focus session completed!', {
            description: 'Great job staying focused!',
          });
          // Navigate to summary after a delay
          setTimeout(() => {
            const params = new URLSearchParams({
              mode: 'solo',
              duration: duration.toString(),
              focusTopic,
              ...(studyGoal && { studyGoal }),
              notes,
            });
            router.push(`/session/summary?${params.toString()}`);
          }, 2000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, secondsRemaining, duration, focusTopic, studyGoal, notes, router]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleEndSession = () => {
    setIsActive(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
    
    // Navigate to summary with session data
    const params = new URLSearchParams({
      mode: 'solo',
      duration: duration.toString(),
      focusTopic,
      ...(studyGoal && { studyGoal }),
      notes,
      endedEarly: 'true',
    });
    router.push(`/session/summary?${params.toString()}`);
  };

  const handleExtendSession = () => {
    setSecondsRemaining((prev) => prev + 5 * 60); // Add 5 minutes
    toast.success('Session extended!', {
      description: 'Added 5 minutes to your session',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background p-4 sm:p-6 pb-24">
      <div className="container mx-auto max-w-6xl py-4 sm:py-8">
        {/* Header with Timer and Focus Info */}
        <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 rounded-lg">
                    <Timer className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl sm:text-4xl font-bold tabular-nums">
                      {formatTime(secondsRemaining)}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">Solo Focus Session in Progress</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    onClick={handleExtendSession}
                    variant="outline"
                    size="sm"
                    disabled={!isActive}
                    className="flex-1 sm:flex-initial text-xs sm:text-sm"
                  >
                    <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Extend (+5 min)</span>
                    <span className="sm:hidden">+5 min</span>
                  </Button>
                  <Button
                    onClick={handleEndSession}
                    variant="destructive"
                    size="sm"
                    className="flex-1 sm:flex-initial text-xs sm:text-sm"
                  >
                    <X className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    End
                  </Button>
                </div>
              </div>
              
              {/* Focus Topic and Goal */}
              <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    You're focusing on:
                  </p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {focusTopic || 'General Focus'}
                  </p>
                </div>
                {studyGoal && (
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      Goal:
                    </p>
                    <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                      {studyGoal}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Solo Mode Info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Solo Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 via-blue-500 to-sky-400 flex items-center justify-center text-white text-xl font-bold">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-semibold">Working Solo</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Active
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/30 p-4">
                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                  You're working solo. Stay focused!
                </p>
                <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-2">
                  Keep yourself accountable and make the most of this focused time.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="lg:col-span-2">
            <Tabs defaultValue="notes" className="w-full">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger value="notes" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Session Notes
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                <TabsContent value="notes" className="space-y-4">
                  <Textarea
                    placeholder="Jot down your thoughts, goals, or accomplishments..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[300px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your notes are private and will be saved after the session
                  </p>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SoloSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <Timer className="h-6 w-6 animate-spin mr-2" />
                <p className="text-slate-600 dark:text-slate-400">Loading session...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <SoloSessionContent />
    </Suspense>
  );
}

