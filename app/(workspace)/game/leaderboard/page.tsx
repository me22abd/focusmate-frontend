// UI Template inspired by original design © Michael Iloliev
// Customized and extended by Marvelous Eromonsele for FocusMate workspace system.

/**
 * ============================================================================
 * GAME/LEADERBOARD/PAGE.TSX - USER RANKINGS
 * ============================================================================
 * 
 * Purpose: Displays top users ranked by XP, level, and streak. Shows user's
 * current position and highlights their entry. Matches template's ranking style.
 * 
 * Template-Based Elements:
 * - Rank badges (trophy for #1, medal for #2, award for #3)
 * - User entry cards with rounded corners
 * - Highlighted current user entry
 * - Stats display (level, XP, streak)
 * 
 * Custom Modifications:
 * - FocusMate brand colors
 * - Smooth animations
 * - Placeholder data (to be connected to API)
 * 
 * @author Marvelous Eromonsele
 * @page Frontend/Workspace/Game
 */

'use client';

import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Users, Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  level: number;
  streak: number;
  isCurrentUser?: boolean;
}

export default function GameLeaderboardPage() {
  useAuthGuard();

  // Placeholder leaderboard data - Template-based structure
  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'Focus Master', xp: 12500, level: 15, streak: 45 },
    { rank: 2, name: 'Productivity Pro', xp: 9800, level: 12, streak: 32 },
    { rank: 3, name: 'Study Champion', xp: 8700, level: 11, streak: 28 },
    { rank: 4, name: 'You', xp: 3200, level: 5, streak: 7, isCurrentUser: true },
    { rank: 5, name: 'Dedicated Learner', xp: 2100, level: 4, streak: 5 },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-7 w-7 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-7 w-7 text-slate-400" />;
    if (rank === 3) return <Award className="h-7 w-7 text-amber-600" />;
    return <span className="text-xl font-bold text-slate-400">#{rank}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header Card - Template-based */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200/60 bg-white dark:bg-slate-900 p-6 shadow-lg dark:border-slate-800"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-3">
            <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Leaderboard</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Top users ranked by XP and achievements
            </p>
          </div>
        </div>
      </motion.div>

      {/* Leaderboard List - Template-based card style */}
      <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border-2 transition-all shadow-sm hover:shadow-md',
                  entry.isCurrentUser
                    ? 'border-indigo-300 dark:border-indigo-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                )}
              >
                {/* Rank Icon - Template-based */}
                <div className="flex-shrink-0 w-12 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={cn(
                      'font-bold text-lg',
                      entry.isCurrentUser
                        ? 'text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-900 dark:text-white'
                    )}>
                      {entry.name}
                    </h3>
                    {entry.isCurrentUser && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Level {entry.level}</span>
                    <span>•</span>
                    <span className="font-semibold">{entry.xp.toLocaleString()} XP</span>
                    <span>•</span>
                    <span>{entry.streak} day streak</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card - Template-based */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center shadow-md"
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Leaderboard updates in real-time. Keep focusing to climb the ranks! 🚀
        </p>
      </motion.div>
    </div>
  );
}










