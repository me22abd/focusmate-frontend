// UI Template inspired by original design © Michael Iloliev
// Customized and extended by Marvelous Eromonsele for FocusMate workspace system.

/**
 * ============================================================================
 * GAME/DASHBOARD/PAGE.TSX - GAMIFICATION DASHBOARD
 * ============================================================================
 * 
 * Purpose: Displays user's gamification stats including XP bar, current level,
 * streak tracker, productivity score, and recent activity. This is the main
 * hub for users to track their progress and see their overall gamification status.
 * 
 * Template-Based Elements:
 * - XP bar with level display (inspired by template's "Poin" and "Level" sections)
 * - Streak tracker with flame icon (inspired by template's "D0" streak display)
 * - Card-based layout with rounded corners and shadows
 * - Typography hierarchy (large numbers, smaller labels)
 * - Spacing and padding system
 * 
 * Custom Modifications:
 * - Adapted to FocusMate brand colors (indigo, blue, purple accents)
 * - Integrated with real analytics data via useAnalytics hook
 * - Connected to gamification API for XP/coins/level data
 * - Added productivity score card
 * - Responsive grid layout (desktop: 4 columns, mobile: stacked)
 * 
 * @author Marvelous Eromonsele
 * @page Frontend/Workspace/Game
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  Zap,
  TrendingUp,
  Flame,
  Star,
  Coins,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getGamificationStats, GamificationStats } from '@/lib/api/gamification';
import { useAnalytics } from '@/hooks/use-analytics';

export default function GameDashboardPage() {
  useAuthGuard();
  const analytics = useAnalytics();
  const [stats, setStats] = useState<GamificationStats>({ xp: 0, level: 1, nextLevelXp: 500, coins: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getGamificationStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch gamification stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const xpProgress = stats.nextLevelXp > 0 
    ? Math.min(100, (stats.xp / stats.nextLevelXp) * 100)
    : 0;

  const xpNeeded = Math.max(0, stats.nextLevelXp - stats.xp);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading game stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* XP Bar & Level Display - Template-based */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200/60 bg-white dark:bg-slate-900 p-6 shadow-lg dark:border-slate-800"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Level</p>
            <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{stats.level}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">XP</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.xp.toLocaleString()} / {stats.nextLevelXp.toLocaleString()}
            </p>
          </div>
        </div>
        {/* XP Progress Bar - Template-based gradient style */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-400 rounded-full shadow-sm"
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
          {xpNeeded.toLocaleString()} XP needed for level {stats.level + 1}
        </p>
      </motion.div>

      {/* Stats Grid - Template-based card layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Coins Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <Card className="rounded-2xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 dark:border-yellow-800 dark:from-yellow-950/30 dark:to-amber-950/30 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Coins</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.coins}
                  </p>
                </div>
                <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-3">
                  <Coins className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Streak Card - Template-based */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <Card className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 dark:border-orange-800 dark:from-orange-950/30 dark:to-red-950/30 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-1">Streak</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {analytics.currentStreak}
                  </p>
                  <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">days</p>
                </div>
                <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-3">
                  <Flame className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total XP Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <Card className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">Total XP</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.xp.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
                  <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Productivity Score Card - Custom addition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <Card className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:border-purple-800 dark:from-purple-950/30 dark:to-pink-950/30 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-1">Productivity</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {analytics.successRate}%
                  </p>
                </div>
                <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3">
                  <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Additional Stats - Template-based card structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Sessions Completed</span>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{analytics.totalSessions}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Focus Time</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(analytics.totalFocusTime)}h
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Level Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Level Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Level {stats.level} → Level {stats.level + 1}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{Math.round(xpProgress)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                </div>
                <div className="text-center pt-2">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.xp.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Experience Points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}






