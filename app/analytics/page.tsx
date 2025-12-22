'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useAnalytics } from '@/hooks/use-analytics';
import { Navbar } from '@/components/navbar';
import { BottomNav } from '@/components/bottom-nav';
import { SimpleFooter } from '@/components/simple-footer';
import { QuickNav } from '@/components/quick-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Clock,
  TrendingUp,
  Target,
  Users,
  User,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Trophy,
  LayoutDashboard,
  TrendingDown,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUserAchievements, checkAchievements, Achievement } from '@/lib/api/achievements';
import { toast } from 'sonner';

type TabType = 'overview' | 'progress' | 'achievements';

export default function AnalyticsPage() {
  useAuthGuard();
  const analytics = useAnalytics();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const lastCheckedRef = useRef<Date | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch achievements when Achievements tab is active
  useEffect(() => {
    if (activeTab === 'achievements') {
      setAchievementsLoading(true);
      getUserAchievements()
        .then((data) => {
          // Handle new response format: { achievements: [...] }
          if (data && typeof data === 'object' && 'achievements' in data) {
            setAchievements(data.achievements || []);
          } else if (Array.isArray(data)) {
            // Fallback for old format
            setAchievements(data);
          } else {
            setAchievements([]);
          }
        })
        .catch((error) => {
          console.error('Failed to fetch achievements:', error);
          setAchievements([]);
        })
        .finally(() => {
          setAchievementsLoading(false);
        });
    }
  }, [activeTab]);

  // Periodically check for new achievements
  useEffect(() => {
    const checkForNewAchievements = async () => {
      try {
        const result = await checkAchievements();
        if (result.newlyEarned && result.newlyEarned.length > 0) {
          // Show toast notifications for new achievements
          result.newlyEarned.forEach((achievement) => {
            toast.success(`🎉 New Achievement: ${achievement.name}!`, {
              description: achievement.description,
              duration: 5000,
            });
          });
          
          // Refresh achievements list
          const updated = await getUserAchievements();
          setAchievements(updated || []);
        }
      } catch (error) {
        console.error('Failed to check achievements:', error);
      }
    };

    // Check immediately on mount
    checkForNewAchievements();
    lastCheckedRef.current = new Date();

    // Then check every 30 seconds
    checkIntervalRef.current = setInterval(() => {
      checkForNewAchievements();
    }, 30000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDateLong = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (analytics.isLoading) {
    return (
      <>
        <Navbar />
        <QuickNav showBack={true} showHome={true} />
        <div className="min-h-screen bg-slate-50 px-4 pb-24 pt-6 dark:bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading analytics...</p>
          </div>
        </div>
        <BottomNav />
        <SimpleFooter variant="auth" />
      </>
    );
  }

  const hasNoData = analytics.totalSessions === 0;

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: LayoutDashboard },
    { id: 'progress' as TabType, label: 'Progress', icon: TrendingDown },
    { id: 'achievements' as TabType, label: 'Achievements', icon: Trophy },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/30 px-4 pb-24 pt-6 dark:from-slate-950 dark:via-indigo-950/20 dark:to-blue-950/20">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          {/* Header */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/60 bg-gradient-to-r from-white to-slate-50 p-6 shadow-[0_25px_50px_-24px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/60"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-600 dark:text-indigo-400">
                Analytics
              </p>
              <h1 className="mt-3 text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                Your Focus Analytics
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Track your productivity and focus session insights.
              </p>
            </div>
          </motion.section>

          {/* Tabs Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-sm p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900/80"
          >
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200',
                      'hover:bg-slate-100 dark:hover:bg-slate-800',
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/50'
                        : 'text-slate-600 dark:text-slate-400'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400')} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {hasNoData && activeTab !== 'achievements' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white bg-white p-12 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-slate-400" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                No data yet
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Start your first focus session to see analytics here
              </p>
            </motion.div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <Card className="border-2 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                                Total Sessions
                              </p>
                              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                                {analytics.totalSessions}
                              </p>
                            </div>
                            <CalendarDays className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <Card className="border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                Total Focus Time
                              </p>
                              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                                {formatDuration(analytics.totalFocusTime * 60)}
                              </p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <Card className="border-2 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                Success Rate
                              </p>
                              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                                {analytics.successRate}%
                              </p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <Card className="border-2 border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                                Current Streak
                              </p>
                              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                {analytics.currentStreak}
                              </p>
                            </div>
                            <Activity className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Session Breakdown & Top Topics */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Solo vs Partner Sessions */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Card className="border border-slate-200 dark:border-slate-800">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <PieChart className="h-5 w-5" />
                            Session Breakdown
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/30">
                              <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                <span className="font-medium text-slate-900 dark:text-white">Solo Sessions</span>
                              </div>
                              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                {analytics.soloSessions}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                              <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <span className="font-medium text-slate-900 dark:text-white">Partner Sessions</span>
                              </div>
                              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {analytics.partnerSessions}
                              </span>
                            </div>
                            {analytics.totalSessions > 0 && (
                              <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                  <span>Solo</span>
                                  <span>{Math.round((analytics.soloSessions / analytics.totalSessions) * 100)}%</span>
                                </div>
                                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-indigo-600 to-blue-500"
                                    style={{ width: `${(analytics.soloSessions / analytics.totalSessions) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Top Focus Topics */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Card className="border border-slate-200 dark:border-slate-800">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Top Focus Topics
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {analytics.topFocusTopics.length > 0 ? (
                            <div className="space-y-3">
                              {analytics.topFocusTopics.map((topic, index) => (
                                <div key={topic.topic} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                      {index + 1}
                                    </div>
                                    <span className="font-medium text-slate-900 dark:text-white">{topic.topic}</span>
                                  </div>
                                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                    {topic.count} {topic.count === 1 ? 'session' : 'sessions'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                              No focus topics yet
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </div>
              )}

              {/* Progress Tab */}
              {activeTab === 'progress' && (
                <div className="space-y-6">
                  {/* Daily Focus Minutes Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="border border-slate-200 dark:border-slate-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <LineChart className="h-5 w-5" />
                          Daily Focus Minutes (Last 7 Days)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {analytics.dailyData.length > 0 ? (
                          <div className="space-y-4">
                            <div className="flex items-end justify-between gap-2 h-48">
                              {analytics.dailyData.map((day, index) => {
                                const maxMinutes = Math.max(...analytics.dailyData.map(d => d.totalMinutes), 1);
                                const height = (day.totalMinutes / maxMinutes) * 100;
                                return (
                                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="relative w-full h-full flex items-end">
                                      <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                        className={cn(
                                          'w-full rounded-t-lg transition-all hover:opacity-80',
                                          'bg-gradient-to-t from-indigo-600 via-blue-500 to-sky-400'
                                        )}
                                        style={{ minHeight: day.totalMinutes > 0 ? '4px' : '0' }}
                                      />
                                    </div>
                                    <div className="text-xs text-slate-600 dark:text-slate-400 text-center">
                                      <div className="font-medium">{formatDate(day.date)}</div>
                                      <div className="text-slate-500 dark:text-slate-500">
                                        {day.totalMinutes}m
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            No data for the last 7 days
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Weekly Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="border border-slate-200 dark:border-slate-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Weekly Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">This Week</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                              {analytics.thisWeek.sessions}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-500">
                              {formatDuration(analytics.thisWeek.totalMinutes)} focused
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Last Week</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                              {analytics.lastWeek.sessions}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-500">
                              {formatDuration(analytics.lastWeek.totalMinutes)} focused
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Trend</p>
                            <div className="flex items-center gap-2">
                              {analytics.trends.sessionsChange >= 0 ? (
                                <>
                                  <TrendingUp className="h-5 w-5 text-green-600" />
                                  <p className="text-2xl font-bold text-green-600">
                                    +{analytics.trends.sessionsChange}%
                                  </p>
                                </>
                              ) : (
                                <>
                                  <TrendingUp className="h-5 w-5 text-red-600 rotate-180" />
                                  <p className="text-2xl font-bold text-red-600">
                                    {analytics.trends.sessionsChange}%
                                  </p>
                                </>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-500">vs last week</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Weekly Progress Visualization */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="border border-slate-200 dark:border-slate-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CalendarDays className="h-5 w-5" />
                          Weekly Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between gap-2">
                          {analytics.weeklyProgress.map((day, index) => (
                            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                              <div
                                className={cn(
                                  'h-12 w-12 rounded-full flex items-center justify-center font-semibold transition-all',
                                  day.hasSession
                                    ? 'bg-green-500 text-white shadow-lg'
                                    : day.isToday
                                    ? 'bg-indigo-500 text-white ring-2 ring-indigo-300 dark:ring-indigo-700'
                                    : day.isPast
                                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                                )}
                              >
                                {day.hasSession ? '✓' : day.day.charAt(0)}
                              </div>
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                {day.day}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              )}

              {/* Achievements Tab */}
              {activeTab === 'achievements' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="border border-slate-200 dark:border-slate-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Achievements ({achievements.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {achievementsLoading ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
                          <p className="text-slate-600 dark:text-slate-400">Loading achievements...</p>
                        </div>
                      ) : achievements.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                          <Trophy className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            No achievements yet
                          </h3>
                          <p className="text-sm">
                            Keep focusing to unlock badges and track your progress!
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {achievements.map((achievement: any) => {
                            const isEarned = achievement.unlocked || achievement.earned || achievement.earnedAt;
                            const progress = achievement.progress || 0;
                            return (
                              <motion.div
                                key={achievement.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: isEarned ? 1.05 : 1.02 }}
                                className={cn(
                                  'rounded-xl border-2 p-6 text-center shadow-sm transition-all relative',
                                  isEarned
                                    ? 'border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 hover:shadow-md'
                                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-60'
                                )}
                              >
                                {!isEarned && (
                                  <div className="absolute top-2 right-2">
                                    <Lock className="h-4 w-4 text-slate-400" />
                                  </div>
                                )}
                                <div className={cn('text-5xl mb-3', !isEarned && 'grayscale opacity-50')}>
                                  {achievement.icon || '🏆'}
                                </div>
                                <p className={cn(
                                  'font-bold text-lg mb-2',
                                  isEarned
                                    ? 'text-slate-900 dark:text-white'
                                    : 'text-slate-500 dark:text-slate-400'
                                )}>
                                  {achievement.name}
                                </p>
                                {achievement.description && (
                                  <p className={cn(
                                    'text-sm mb-3',
                                    isEarned
                                      ? 'text-slate-600 dark:text-slate-400'
                                      : 'text-slate-400 dark:text-slate-500'
                                  )}>
                                    {achievement.description}
                                  </p>
                                )}
                                {/* Progress bar for locked achievements */}
                                {!isEarned && progress > 0 && (
                                  <div className="mb-2">
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                      <div
                                        className="bg-indigo-600 h-2 rounded-full transition-all"
                                        style={{ width: `${progress}%` }}
                                      />
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                      {progress}% complete
                                    </p>
                                  </div>
                                )}
                                {achievement.earnedAt && (
                                  <p className="text-xs text-slate-500 dark:text-slate-500 font-medium">
                                    Unlocked {formatDateLong(achievement.earnedAt)}
                                  </p>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
      <BottomNav />
      <SimpleFooter variant="auth" />
    </>
  );
}
