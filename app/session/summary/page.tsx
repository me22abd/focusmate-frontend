'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Calendar,
  TrendingUp,
  Users,
  User,
  Trophy,
  Coins,
  Star,
  ArrowLeft,
  Play,
  Smile,
  Frown,
  Meh,
  Heart,
  Sparkles,
} from 'lucide-react';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useAuthStore } from '@/store/auth-store';
import { Navbar } from '@/components/navbar';
import { BottomNav } from '@/components/bottom-nav';
import { SimpleFooter } from '@/components/simple-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getSessionById } from '@/lib/api/sessions';
import { getTasks, toggleTaskComplete, type Task } from '@/lib/api/tasks';
import { getUserStreak } from '@/lib/api/sessions';
import { playTaskCompleteSound } from '@/lib/sounds';
import { useSettingsStore } from '@/store/settings-store';
import confetti from 'canvas-confetti';

interface SessionSummaryData {
  id?: string;
  roomId?: string;
  mode: 'solo' | 'partner';
  focusTopic: string;
  studyGoal?: string;
  duration: number;
  completedDuration: number;
  startTime: string;
  endTime: string;
  notes?: string;
  partnerName?: string;
  partnerId?: string;
  partnerFocus?: string;
  partnerAvatar?: string;
}

function SessionSummaryContent() {
  useAuthGuard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { notifications } = useSettingsStore();

  const sessionId = searchParams.get('sessionId') || searchParams.get('roomId') || '';
  const mode = (searchParams.get('mode') || 'solo') as 'solo' | 'partner';
  const focusTopic = searchParams.get('focusTopic') || '';
  const studyGoal = searchParams.get('studyGoal') || '';
  const duration = parseInt(searchParams.get('duration') || '25', 10);
  const completedDuration = parseInt(searchParams.get('completedDuration') || duration.toString(), 10);
  const startTime = searchParams.get('startTime') || new Date().toISOString();
  const notes = searchParams.get('notes') || '';
  const partnerName = searchParams.get('partnerName') || '';
  const partnerId = searchParams.get('partnerId') || '';
  const partnerFocus = searchParams.get('partnerFocus') || '';
  const partnerAvatar = searchParams.get('partnerAvatar') || '';

  const [sessionData, setSessionData] = useState<SessionSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [mood, setMood] = useState<'great' | 'good' | 'okay' | 'tired' | null>(null);
  const [reflection, setReflection] = useState('');
  const [xpEarned, setXpEarned] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);

  // Calculate end time
  const endTime = new Date(new Date(startTime).getTime() + completedDuration * 60 * 1000).toISOString();

  // Calculate productivity score (0-100)
  const productivityScore = Math.min(100, Math.round((completedDuration / duration) * 100));

  // Fetch session data
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from backend if sessionId provided
        let fetchedSession = null;
        if (sessionId) {
          fetchedSession = await getSessionById(sessionId);
          if (fetchedSession) {
            setSessionData({
              id: fetchedSession.id || fetchedSession.roomId,
              roomId: fetchedSession.roomId || fetchedSession.id,
              mode: fetchedSession.mode || mode,
              focusTopic: fetchedSession.focusTopic || focusTopic,
              studyGoal: fetchedSession.studyGoal || studyGoal,
              duration: fetchedSession.durationMinutes || duration,
              completedDuration: fetchedSession.durationMinutes || completedDuration,
              startTime: fetchedSession.startedAt || startTime,
              endTime: fetchedSession.endedAt || endTime,
              notes: fetchedSession.notes || notes,
              partnerName: fetchedSession.partnerName || partnerName,
              partnerId: fetchedSession.partnerId || partnerId,
              partnerFocus: fetchedSession.partnerFocus || partnerFocus,
            });
          }
        }
        
        // If no session data from backend, use URL params
        const fallbackData: SessionSummaryData = {
          mode,
          focusTopic,
          studyGoal,
          duration,
          completedDuration,
          startTime,
          endTime,
          notes,
          partnerName,
          partnerId,
          partnerFocus,
          partnerAvatar,
        };
        
        if (!fetchedSession) {
          setSessionData(fallbackData);
        } else {
          // Merge fetched data with URL params (URL params take precedence for display)
          setSessionData({
            ...fetchedSession,
            ...fallbackData,
          });
        }

        // Fetch tasks
        try {
          const taskList = await getTasks();
          setTasks(taskList);
        } catch (error) {
          console.error('Failed to fetch tasks:', error);
        }

        // Fetch streak
        try {
          const streakData = await getUserStreak();
          setStreak(streakData);
        } catch (error) {
          console.error('Failed to fetch streak:', error);
        }

        // Calculate XP and coins (simple calculation)
        const baseXp = completedDuration * 2; // 2 XP per minute
        const bonusXp = mode === 'partner' ? 50 : 0; // Bonus for partner sessions
        const totalXp = baseXp + bonusXp;
        setXpEarned(totalXp);
        setCoinsEarned(Math.floor(totalXp / 10)); // 1 coin per 10 XP

        // Check for achievements
        const newAchievements: string[] = [];
        if (completedDuration >= duration) {
          newAchievements.push('Session Completed');
        }
        if (streak.currentStreak >= 7) {
          newAchievements.push('Week Warrior');
        }
        if (mode === 'partner') {
          newAchievements.push('Team Player');
        }
        setAchievements(newAchievements);

        // Trigger confetti animation
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }, 300);

      } catch (error) {
        console.error('Failed to fetch session data:', error);
        // Use URL params as fallback
        setSessionData({
          mode,
          focusTopic,
          studyGoal,
          duration,
          completedDuration,
          startTime,
          endTime,
          notes,
          partnerName,
          partnerId,
          partnerFocus,
          partnerAvatar,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  const handleToggleTaskComplete = async (taskId: string, currentStatus: string) => {
    try {
      const updatedTask = await toggleTaskComplete(taskId);
      
      // Play sound if task was completed
      if (updatedTask.status === 'completed' && currentStatus !== 'completed' && notifications.sessionSoundEnabled) {
        const volume = notifications.sessionSoundVolume / 100;
        playTaskCompleteSound(volume);
      }
      
      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task))
      );
      
      toast.success(
        updatedTask.status === 'completed' ? 'Task completed!' : 'Task marked as pending'
      );
    } catch (error: any) {
      console.error('Failed to toggle task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleSaveReflection = async () => {
    // TODO: Save reflection to backend
    toast.success('Reflection saved!');
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading session summary...</p>
          </div>
        </div>
      </>
    );
  }

  if (!sessionData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-4">Session data not found</p>
              <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const pendingTasks = tasks.filter((t) => t.status === 'pending' || !t.status);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 px-4 sm:px-6 pb-24 pt-6 dark:bg-slate-950">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-indigo-600" />
                Session Complete!
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Great job staying focused!
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </motion.div>

          {/* Session Performance Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  Session Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Focus Time</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatTime(sessionData.completedDuration)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Start Time</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {formatDateTime(sessionData.startTime).split(',')[1].trim()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">End Time</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {formatDateTime(sessionData.endTime).split(',')[1].trim()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Productivity Score</p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {productivityScore}%
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Completion Progress
                    </span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {productivityScore}%
                    </span>
                  </div>
                  <Progress value={productivityScore} className="h-3" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Row: Streak, XP, Coins, Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400">Current Streak</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {streak.currentStreak}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {streak.longestStreak} day record
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400">XP Earned</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  +{xpEarned}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Coins className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400">Coins Earned</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  +{coinsEarned}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400">Achievements</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {achievements.length}
                </p>
                {achievements.length > 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {achievements[0]}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Partner Details (if partnered session) */}
          {sessionData.mode === 'partner' && sessionData.partnerName && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Partner Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    {sessionData.partnerAvatar ? (
                      <img
                        src={sessionData.partnerAvatar}
                        alt={sessionData.partnerName}
                        className="h-16 w-16 rounded-full object-cover border-2 border-blue-200 dark:border-blue-800"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                        {sessionData.partnerName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                        {sessionData.partnerName}
                      </h3>
                      {sessionData.partnerFocus && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Focused on: {sessionData.partnerFocus}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Tasks Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-2 gap-4"
          >
            {/* Completed Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Completed Tasks ({completedTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completedTasks.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                    No tasks completed during this session
                  </p>
                ) : (
                  <div className="space-y-2">
                    {completedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-950/20"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-slate-700 dark:text-slate-300 line-through">
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Pending Tasks ({pendingTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingTasks.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                    All tasks completed! 🎉
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pendingTasks.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 hover:bg-yellow-100 dark:hover:bg-yellow-950/30 transition-colors"
                      >
                        <button
                          onClick={() => handleToggleTaskComplete(task.id, task.status || 'pending')}
                          className="flex-shrink-0"
                        >
                          <Clock className="h-4 w-4 text-yellow-600" />
                        </button>
                        <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                          {task.title}
                        </span>
                      </div>
                    ))}
                    {pendingTasks.length > 5 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-2">
                        +{pendingTasks.length - 5} more tasks
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Mood and Reflection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-600" />
                  How did it go?
                </CardTitle>
                <CardDescription>Share your mood and reflection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mood Selector */}
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    How are you feeling?
                  </p>
                  <div className="flex gap-3">
                    {[
                      { value: 'great', label: 'Great', icon: Smile, color: 'text-green-600' },
                      { value: 'good', label: 'Good', icon: Smile, color: 'text-blue-600' },
                      { value: 'okay', label: 'Okay', icon: Meh, color: 'text-yellow-600' },
                      { value: 'tired', label: 'Tired', icon: Frown, color: 'text-orange-600' },
                    ].map((moodOption) => (
                      <button
                        key={moodOption.value}
                        onClick={() => setMood(moodOption.value as any)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all',
                          mood === moodOption.value
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30'
                            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                        )}
                      >
                        <moodOption.icon className={cn('h-6 w-6', moodOption.color)} />
                        <span className="text-xs font-medium">{moodOption.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reflection Input */}
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Reflection (optional)
                  </p>
                  <Textarea
                    placeholder="What did you accomplish? How do you feel? Any insights?"
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <Button onClick={handleSaveReflection} className="w-full">
                  Save Reflection
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button
              onClick={() => router.push('/sessions/workspace')}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Another Session
            </Button>
          </motion.div>
        </div>
      </div>
      <BottomNav />
      <SimpleFooter variant="auth" />
    </>
  );
}

export default function SessionSummaryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading...</p>
          </div>
        </div>
      }
    >
      <SessionSummaryContent />
    </Suspense>
  );
}
