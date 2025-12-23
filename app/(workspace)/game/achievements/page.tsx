// UI Template inspired by original design © Michael Iloliev
// Customized and extended by Marvelous Eromonsele for FocusMate workspace system.

/**
 * ============================================================================
 * GAME/ACHIEVEMENTS/PAGE.TSX - ACHIEVEMENTS GALLERY
 * ============================================================================
 * 
 * Purpose: Displays all available achievements in a grid layout. Shows
 * unlocked achievements in full color and locked achievements greyed out
 * with progress bars. Matches the template's badge/achievement card style.
 * 
 * Template-Based Elements:
 * - Badge cards with rounded corners and shadows (template's badge style)
 * - Unlocked badges in vibrant colors, locked badges greyed out
 * - Progress bars at bottom of locked badges
 * - Icon-centered design with title below
 * - Grid layout (responsive: 3 columns desktop, 2 tablet, 1 mobile)
 * 
 * Custom Modifications:
 * - FocusMate brand colors (indigo/blue gradients)
 * - Integrated with achievements API
 * - Summary card showing earned/total count
 * - Smooth animations on load
 * 
 * @author Marvelous Eromonsele
 * @page Frontend/Workspace/Game
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Trophy, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUserAchievements } from '@/lib/api/achievements';

interface Achievement {
  id: string;
  name: string;
  unlocked: boolean;
  progress: number;
}

export default function GameAchievementsPage() {
  useAuthGuard();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const data = await getUserAchievements();
        if (data && typeof data === 'object' && 'achievements' in data) {
          setAchievements(data.achievements || []);
        } else if (Array.isArray(data)) {
          setAchievements(data);
        } else {
          setAchievements([]);
        }
      } catch (error) {
        console.error('Failed to fetch achievements:', error);
        setAchievements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const earnedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card - Template-based */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200/60 bg-white dark:bg-slate-900 p-6 shadow-lg dark:border-slate-800"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Achievements Unlocked</p>
            <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
              {earnedCount} / {totalCount}
            </p>
          </div>
          <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-4">
            <Trophy className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <div className="mt-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${totalCount > 0 ? (earnedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </motion.div>

      {/* Achievements Grid - Template-based badge card style */}
      {achievements.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-md"
        >
          <Trophy className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            No achievements yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Keep focusing to unlock achievements!
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: achievement.unlocked ? 1.05 : 1.02, y: -4 }}
              className={cn(
                'rounded-2xl border-2 p-6 text-center shadow-md transition-all relative',
                'hover:shadow-lg',
                achievement.unlocked
                  ? 'border-indigo-300 dark:border-indigo-700 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-70'
              )}
            >
              {!achievement.unlocked && (
                <div className="absolute top-3 right-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
              )}
              {/* Icon - Template-based centered icon style */}
              <div className={cn(
                'text-6xl mb-4 transition-all',
                !achievement.unlocked && 'grayscale opacity-50'
              )}>
                🏆
              </div>
              {/* Title - Template-based typography */}
              <p className={cn(
                'font-bold text-lg mb-2',
                achievement.unlocked
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400'
              )}>
                {achievement.name}
              </p>
              {/* Progress bar for locked achievements - Template-based */}
              {!achievement.unlocked && achievement.progress > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all shadow-sm"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    {achievement.progress}% complete
                  </p>
                </div>
              )}
              {/* Unlocked badge - Template-based */}
              {achievement.unlocked && (
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold mt-2">
                  ✓ Unlocked
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}






