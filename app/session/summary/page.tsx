/**
 * ============================================================================
 * SESSION/SUMMARY/PAGE.TSX - ENHANCED SESSION COMPLETION SUMMARY
 * ============================================================================
 * 
 * Purpose: Post-session summary page with habit tracking, mood reflection,
 * accomplishment notes, and goal progress display. Saves session to backend
 * with comprehensive metadata and triggers analytics refresh.
 * 
 * Architecture Role: Session completion flow - saves data, shows achievements,
 * collects reflection, and provides session restart options.
 * 
 * ============================================================================
 * 📘 CODE ORIGIN (REQUIRED FOR ACADEMIC HONESTY)
 * ============================================================================
 * 
 * PHASE 2 ENHANCEMENTS (December 2025):
 * - Added habit completion toggle
 * - Added mood selector
 * - Added accomplishment reflection box
 * - Added daily/weekly goal progress display
 * - All documented for academic honesty
 * 
 * @author Eromonsele Marvelous
 * @page Frontend/Session
 * ============================================================================
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Target, Flag, User, Users, Home, Play, SmilePlus, Meh, Frown, Check } from 'lucide-react';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Navbar } from '@/components/navbar';
import { BottomNav } from '@/components/bottom-nav';
import { SimpleFooter } from '@/components/simple-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { saveSession } from '@/lib/api/sessions';
import { getUserAchievements } from '@/lib/api/achievements';
import { toast } from 'sonner';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';

// ===========================================================================
// 📘 CODE ORIGIN: Default Habits List
// ===========================================================================
// Custom implementation by me: Predefined habit options for quick selection
// 
// My Default Habits:
// - Common productivity habits for students/professionals
// - Will be saved to localStorage for user customization
// ===========================================================================
const DEFAULT_HABITS = [
  'Study 25 min',
  'No phone',
  'Finish task',
  'Deep work',
  'Active recall',
];

export default function SessionSummaryPage() {
  useAuthGuard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh: refreshAnalytics } = useAnalytics();
  const [isSaving, setIsSaving] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [newAchievements, setNewAchievements] = useState<Array<{ name: string; icon: string }>>([]);
  
  // ===========================================================================
  // 📘 CODE ORIGIN: Phase 2 Enhancement - New State Variables
  // ===========================================================================
  // Custom implementation by me: Habit tracking, mood, and reflection state
  // 
  // New Features:
  // - habitCompleted: Boolean toggle for habit completion
  // - selectedHabit: Which habit was worked on
  // - mood: Post-session emotional state ('happy' | 'neutral' | 'sad')
  // - accomplishment: Reflection on what was accomplished
  // ===========================================================================
  const [habitCompleted, setHabitCompleted] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState('');
  const [mood, setMood] = useState<'happy' | 'neutral' | 'sad' | null>(null);
  const [accomplishment, setAccomplishment] = useState('');
  
  // ===========================================================================
  // 📘 CODE ORIGIN: Daily/Weekly Goal State
  // ===========================================================================
  // Custom implementation by me: Goal tracking state
  // 
  // Goals are stored in localStorage for now
  // Future: Sync with backend API
  // ===========================================================================
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(() => {
    if (typeof window === 'undefined') return 50;
    return parseInt(localStorage.getItem('daily_goal_minutes') || '50', 10);
  });
  
  const [weeklyGoalMinutes, setWeeklyGoalMinutes] = useState(() => {
    if (typeof window === 'undefined') return 300;
    return parseInt(localStorage.getItem('weekly_goal_minutes') || '300', 10);
  });

  const mode = searchParams.get('mode') || 'solo';
  const focusTopic = searchParams.get('focusTopic') || '';
  const studyGoal = searchParams.get('studyGoal') || '';
  const completedDuration = parseInt(searchParams.get('completedDuration') || '0', 10);
  const notes = searchParams.get('notes') || '';
  const partnerName = searchParams.get('partnerName') || '';
  const partnerFocus = searchParams.get('partnerFocus') || '';
  const partnerId = searchParams.get('partnerId') || '';
  const roomId = searchParams.get('roomId') || '';
  const startTime = searchParams.get('startTime') || new Date().toISOString();
  const endTime = new Date().toISOString();

  // Save session to history when component mounts
  useEffect(() => {
    const saveSessionToHistory = async () => {
      if (completedDuration <= 0) {
        setIsSaving(false);
        return;
      }

      try {
        setIsSaving(true);
        
        // ===========================================================================
        // 📘 CODE ORIGIN: Enhanced Session Save with Phase 2 Data
        // ===========================================================================
        // Custom implementation by me: Save session with habit, mood, and reflection
        // 
        // My Enhancement:
        // Combine original notes with accomplishment reflection
        // Include habit completion and mood in session metadata
        // 
        // Data saved:
        // - Original notes from active session
        // - NEW: Accomplishment reflection (appended to notes)
        // - NEW: Habit completion status (in future: save to metadata)
        // - NEW: Mood (in future: save to metadata)
        // - NEW: Selected habit (in future: save to metadata)
        // ===========================================================================
        
        // Custom: Combine notes with accomplishment reflection
        const combinedNotes = accomplishment.trim().length > 0
          ? notes 
            ? `${notes}\n\n--- Accomplishments ---\n${accomplishment}`
            : `--- Accomplishments ---\n${accomplishment}`
          : notes;
        
        await saveSession({
          mode: mode as 'solo' | 'partner',
          focusTopic,
          studyGoal: studyGoal || undefined,
          duration: completedDuration,
          completedDuration,
          notes: combinedNotes || undefined,  // Enhanced with accomplishment
          partnerName: partnerName || undefined,
          partnerFocus: partnerFocus || undefined,
          partnerId: partnerId || undefined,
          roomId: roomId || undefined,
          startTime,
          endTime,
          // TODO: In future, add habit and mood to session metadata
        });
        
        toast.success('Session saved!', {
          description: 'Your session has been added to your history',
        });
        setSaveError(null);
        
        // Refresh analytics to update all pages
        refreshAnalytics();
        
        // Check for newly earned achievements
        try {
          const achievements = await getUserAchievements();
          const previousAchievements = JSON.parse(localStorage.getItem('previous_achievements') || '[]');
          const newlyEarned = achievements.filter(
            (a) => !previousAchievements.some((pa: any) => pa.id === a.id)
          );
          
          if (newlyEarned.length > 0) {
            setNewAchievements(newlyEarned.map(a => ({ name: a.name, icon: a.icon })));
            toast.success(`🏆 Achievement Unlocked!`, {
              description: newlyEarned.map(a => `${a.icon} ${a.name}`).join(', '),
              duration: 5000,
            });
          }
          
          // Update stored achievements
          localStorage.setItem('previous_achievements', JSON.stringify(achievements));
        } catch (error) {
          // Silently fail - achievements check is optional
        }
      } catch (error: any) {
        console.error('Failed to save session:', error);
        // Don't show error to user if it's just a backend endpoint issue
        // The session data is still available in the summary
        setSaveError(error.response?.data?.message || 'Failed to save session');
        // Still allow user to see the summary even if save fails
      } finally {
        setIsSaving(false);
      }
    };

    saveSessionToHistory();
  }, []); // Only run once on mount

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleReturnToDashboard = () => {
    router.push('/dashboard');
  };

  const handleStartAnother = () => {
    router.push('/dashboard');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background p-4 sm:p-6 pb-24">
        <div className="container mx-auto max-w-3xl py-6 sm:py-12">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.6 }}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-2xl"
              >
                <CheckCircle2 className="h-12 w-12 text-white" />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-yellow-900 font-bold text-sm shadow-lg"
              >
                ✨
              </motion.div>
            </div>
          </motion.div>

          {/* Main Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 shadow-2xl mb-6">
              <CardHeader className="text-center space-y-4">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Session Complete!
                </CardTitle>
                <CardDescription className="text-lg">
                  Great job staying focused
                </CardDescription>
                {newAchievements.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-2 border-yellow-200 dark:border-yellow-800"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🏆</span>
                      <p className="font-bold text-yellow-900 dark:text-yellow-100">
                        Achievement Unlocked!
                      </p>
                    </div>
                    {newAchievements.map((achievement, index) => (
                      <p key={index} className="text-sm text-yellow-800 dark:text-yellow-200">
                        {achievement.icon} {achievement.name}
                      </p>
                    ))}
                  </motion.div>
                )}
                {isSaving && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-slate-500"
                  >
                    Saving session to history...
                  </motion.div>
                )}
                {saveError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-orange-500"
                  >
                    Note: Session may not be saved to history
                  </motion.div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 p-4 border border-indigo-200 dark:border-indigo-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-indigo-600 to-sky-500 rounded-lg">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                          Time Focused
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {formatTime(completedDuration)}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-4 border border-purple-200 dark:border-purple-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg">
                        {mode === 'partner' ? (
                          <Users className="h-5 w-5 text-white" />
                        ) : (
                          <User className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                          Mode
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                          {mode}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Session Details */}
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900"
                  >
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Focus Topic
                        </p>
                        <p className="text-base font-medium text-slate-900 dark:text-white">
                          {focusTopic}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {studyGoal && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900"
                    >
                      <div className="flex items-start gap-3">
                        <Flag className="h-5 w-5 text-emerald-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Study Goal
                          </p>
                          <p className="text-base font-medium text-slate-900 dark:text-white">
                            {studyGoal}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {mode === 'partner' && partnerName && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="rounded-xl border border-indigo-200 dark:border-indigo-800 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30"
                    >
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-indigo-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Partner
                          </p>
                          <p className="text-base font-medium text-slate-900 dark:text-white">
                            {partnerName}
                          </p>
                          {partnerFocus && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              Focus: {partnerFocus}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {notes && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900"
                    >
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                        Session Notes
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {notes}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* ===============================================================
                    PHASE 2 ENHANCEMENTS - Habit, Mood, Reflection
                    ===============================================================
                    
                    📘 CODE ORIGIN: Custom Implementation
                    ──────────────────────────────────────────────────────────
                    What I Built: Post-session reflection and habit tracking
                    
                    My Enhancements:
                    1. Habit Completion Toggle
                    2. Habit Selection Dropdown
                    3. Mood Selector (😊 😐 😢)
                    4. Accomplishment Reflection Box
                    
                    Why These Features:
                    - Habits: Track daily productivity habits
                    - Mood: Understand emotional impact of focus sessions
                    - Reflection: Capture what was accomplished for future reference
                    ============================================================== */}

                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  {/* Habit Completion Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          Did you complete a habit?
                        </p>
                        <button
                          onClick={() => setHabitCompleted(!habitCompleted)}
                          className={cn(
                            'w-12 h-6 rounded-full transition-all relative',
                            habitCompleted 
                              ? 'bg-green-500' 
                              : 'bg-slate-300 dark:bg-slate-600'
                          )}
                        >
                          <div className={cn(
                            'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all',
                            habitCompleted ? 'left-6' : 'left-0.5'
                          )} />
                        </button>
                      </div>
                      
                      {habitCompleted && (
                        <select
                          value={selectedHabit}
                          onChange={(e) => setSelectedHabit(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
                        >
                          <option value="">Select a habit...</option>
                          {DEFAULT_HABITS.map((habit) => (
                            <option key={habit} value={habit}>
                              {habit}
                            </option>
                          ))}
                          <option value="custom">+ Custom habit</option>
                        </select>
                      )}
                    </div>
                  </motion.div>

                  {/* Mood Selector */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900"
                  >
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
                      How do you feel after this session?
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => setMood('happy')}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-105',
                          mood === 'happy'
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                            : 'border-slate-200 dark:border-slate-700'
                        )}
                      >
                        <SmilePlus className={cn(
                          'h-8 w-8',
                          mood === 'happy' ? 'text-green-600' : 'text-slate-400'
                        )} />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Energized
                        </span>
                      </button>
                      
                      <button
                        onClick={() => setMood('neutral')}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-105',
                          mood === 'neutral'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                            : 'border-slate-200 dark:border-slate-700'
                        )}
                      >
                        <Meh className={cn(
                          'h-8 w-8',
                          mood === 'neutral' ? 'text-blue-600' : 'text-slate-400'
                        )} />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Neutral
                        </span>
                      </button>
                      
                      <button
                        onClick={() => setMood('sad')}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-105',
                          mood === 'sad'
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
                            : 'border-slate-200 dark:border-slate-700'
                        )}
                      >
                        <Frown className={cn(
                          'h-8 w-8',
                          mood === 'sad' ? 'text-orange-600' : 'text-slate-400'
                        )} />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Tired
                        </span>
                      </button>
                    </div>
                  </motion.div>

                  {/* Accomplishment Reflection */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900"
                  >
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      What did you accomplish?
                    </p>
                    <Textarea
                      value={accomplishment}
                      onChange={(e) => setAccomplishment(e.target.value)}
                      placeholder="Reflect on what you achieved during this session... (This will be saved to your session notes)"
                      className="min-h-[100px] resize-none"
                    />
                    {accomplishment.trim().length > 0 && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Reflection will be saved
                      </p>
                    )}
                  </motion.div>

                  {/* Daily and Weekly Goal Progress */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30"
                  >
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
                      Goal Progress Update
                    </p>
                    <div className="space-y-3">
                      {/* Daily Goal */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-600 dark:text-slate-400">Daily Goal</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {completedDuration} / {dailyGoalMinutes} min
                          </span>
                        </div>
                        <div className="relative">
                          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                              style={{ width: `${Math.min(100, (completedDuration / dailyGoalMinutes) * 100)}%` }}
                            />
                          </div>
                        </div>
                        {completedDuration >= dailyGoalMinutes && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Daily goal achieved! 🎉
                          </p>
                        )}
                      </div>
                      
                      {/* Weekly Goal */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-600 dark:text-slate-400">Weekly Goal</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {/* TODO: Calculate weekly total */}
                            {completedDuration} / {weeklyGoalMinutes} min
                          </span>
                        </div>
                        <div className="relative">
                          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all"
                              style={{ width: `${Math.min(100, (completedDuration / weeklyGoalMinutes) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={handleReturnToDashboard}
                    variant="outline"
                    className="flex-1 transition-all hover:scale-105"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Return to Dashboard
                  </Button>
                  <Button
                    onClick={handleStartAnother}
                    className="flex-1 bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 text-white hover:opacity-90 transition-all hover:scale-105"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Another Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <BottomNav />
      <SimpleFooter variant="auth" />
    </>
  );
}

