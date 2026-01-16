'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/glass-card';
import { getAllAchievements, type Achievement } from '@/lib/api/admin';
import { Award, Loader2 } from 'lucide-react';

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAchievements() {
      try {
        const data = await getAllAchievements();
        setAchievements(data);
      } catch (error: any) {
        console.error('Failed to load achievements:', error);
        // Silently handle errors - show empty state
      } finally {
        setLoading(false);
      }
    }
    loadAchievements();
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-slate-600 dark:text-slate-400">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-900">
      {/* Floating gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10 px-4 sm:px-6 pb-24 pt-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
              Achievements Panel
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
              View and manage user achievements
            </p>
          </motion.div>

          <GlassCard delay={0.1}>
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                  All Achievements ({achievements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {achievements.length === 0 ? (
                    <p className="text-center text-muted-foreground col-span-full py-8">
                      No achievements found
                    </p>
                  ) : (
                    achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg border bg-white/40 dark:bg-white/5 backdrop-blur-sm border-white/20"
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{achievement.icon || '🏆'}</div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{achievement.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {achievement.description}
                            </p>
                            <div className="mt-2">
                              <span className="text-xs px-2 py-1 rounded bg-white/50 dark:bg-white/10">
                                {achievement.type}
                              </span>
                              {achievement.earnedAt && (
                                <span className="text-xs text-green-600 dark:text-green-400 ml-2">
                                  ✓ Earned
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </GlassCard>

          <GlassCard delay={0.15}>
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Manage Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Achievement management functionality would be implemented here:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Edit achievement title and description</li>
                  <li>Assign achievements to specific users</li>
                  <li>View achievement statistics</li>
                  <li>Create new achievements</li>
                </ul>
              </CardContent>
            </Card>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}












