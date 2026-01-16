// UI Template inspired by original design © Michael Iloliev
// Customized and extended by Marvelous Eromonsele for FocusMate workspace system.

/**
 * ============================================================================
 * GAME/CHALLENGES/PAGE.TSX - DAILY & WEEKLY CHALLENGES
 * ============================================================================
 * 
 * Purpose: Displays daily and weekly challenges/missions that users can complete
 * to earn XP and coins. Matches the template's "Misi" (Mission) section style.
 * 
 * Template-Based Elements:
 * - Challenge cards with rounded corners and borders
 * - Icon + title + description layout
 * - Progress indicators (X/Y format)
 * - Reward display (XP + coins)
 * - Completed state with checkmark
 * - Progress bars for incomplete challenges
 * 
 * Custom Modifications:
 * - Separated into Daily and Weekly sections
 * - FocusMate brand colors
 * - Smooth animations
 * - Task-linked challenges (placeholder for future integration)
 * 
 * @author Marvelous Eromonsele
 * @page Frontend/Workspace/Game
 */

'use client';

import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Target, Calendar, CheckCircle2, Circle, Zap, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  target: number;
  current: number;
  reward: { xp: number; coins: number };
  completed: boolean;
  icon?: string;
}

export default function GameChallengesPage() {
  useAuthGuard();

  // Placeholder challenges - Template-based structure
  const challenges: Challenge[] = [
    {
      id: 'daily-1',
      title: 'Complete 3 Sessions',
      description: 'Finish 3 focus sessions today',
      type: 'daily',
      target: 3,
      current: 1,
      reward: { xp: 150, coins: 15 },
      completed: false,
      icon: '⚡',
    },
    {
      id: 'daily-2',
      title: 'Study for 2 Hours',
      description: 'Accumulate 2 hours of focus time today',
      type: 'daily',
      target: 120,
      current: 45,
      reward: { xp: 200, coins: 20 },
      completed: false,
      icon: '⏰',
    },
    {
      id: 'weekly-1',
      title: '7-Day Streak',
      description: 'Maintain a focus streak for 7 consecutive days',
      type: 'weekly',
      target: 7,
      current: 3,
      reward: { xp: 500, coins: 50 },
      completed: false,
      icon: '🔥',
    },
    {
      id: 'weekly-2',
      title: 'Complete 20 Tasks',
      description: 'Finish 20 tasks this week',
      type: 'weekly',
      target: 20,
      current: 8,
      reward: { xp: 400, coins: 40 },
      completed: false,
      icon: '✅',
    },
  ];

  const dailyChallenges = challenges.filter(c => c.type === 'daily');
  const weeklyChallenges = challenges.filter(c => c.type === 'weekly');

  return (
    <div className="space-y-6">
      {/* Daily Challenges - Template-based card style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Daily Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyChallenges.length === 0 ? (
              <p className="text-center py-8 text-slate-500 dark:text-slate-400">
                No daily challenges available
              </p>
            ) : (
              <div className="space-y-4">
                {dailyChallenges.map((challenge, index) => {
                  const progress = Math.min(100, (challenge.current / challenge.target) * 100);
                  return (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        'rounded-xl border-2 p-4 transition-all shadow-sm hover:shadow-md',
                        challenge.completed
                          ? 'border-green-300 dark:border-green-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                      )}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className={cn(
                          'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-2xl',
                          challenge.completed
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-indigo-100 dark:bg-indigo-900/30'
                        )}>
                          {challenge.icon || '⚡'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {challenge.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                            ) : (
                              <Circle className="h-5 w-5 text-slate-400 flex-shrink-0" />
                            )}
                            <h3 className={cn(
                              'font-bold text-lg',
                              challenge.completed
                                ? 'text-green-700 dark:text-green-300'
                                : 'text-slate-900 dark:text-white'
                            )}>
                              {challenge.title}
                            </h3>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 ml-7">
                            {challenge.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 ml-7">
                            <span className="font-medium">
                              {challenge.current} / {challenge.target}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Zap className="h-3 w-3 text-yellow-500" />
                              <span className="font-semibold">{challenge.reward.xp} XP</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Coins className="h-3 w-3 text-yellow-500" />
                              <span className="font-semibold">{challenge.reward.coins} coins</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      {!challenge.completed && (
                        <div className="ml-13 mt-3">
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 shadow-inner">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500 shadow-sm"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Challenges - Template-based */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Weekly Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyChallenges.length === 0 ? (
              <p className="text-center py-8 text-slate-500 dark:text-slate-400">
                No weekly challenges available
              </p>
            ) : (
              <div className="space-y-4">
                {weeklyChallenges.map((challenge, index) => {
                  const progress = Math.min(100, (challenge.current / challenge.target) * 100);
                  return (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        'rounded-xl border-2 p-4 transition-all shadow-sm hover:shadow-md',
                        challenge.completed
                          ? 'border-green-300 dark:border-green-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                      )}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className={cn(
                          'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-2xl',
                          challenge.completed
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-purple-100 dark:bg-purple-900/30'
                        )}>
                          {challenge.icon || '🎯'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {challenge.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                            ) : (
                              <Circle className="h-5 w-5 text-slate-400 flex-shrink-0" />
                            )}
                            <h3 className={cn(
                              'font-bold text-lg',
                              challenge.completed
                                ? 'text-green-700 dark:text-green-300'
                                : 'text-slate-900 dark:text-white'
                            )}>
                              {challenge.title}
                            </h3>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 ml-7">
                            {challenge.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 ml-7">
                            <span className="font-medium">
                              {challenge.current} / {challenge.target}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Zap className="h-3 w-3 text-yellow-500" />
                              <span className="font-semibold">{challenge.reward.xp} XP</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Coins className="h-3 w-3 text-yellow-500" />
                              <span className="font-semibold">{challenge.reward.coins} coins</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      {!challenge.completed && (
                        <div className="ml-13 mt-3">
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 shadow-inner">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 shadow-sm"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}












