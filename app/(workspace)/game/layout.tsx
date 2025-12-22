// UI Template inspired by original design © Michael Iloliev
// Customized and extended by Marvelous Eromonsele for FocusMate workspace system.

'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Trophy, Target, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { BottomNav } from '@/components/bottom-nav';
import { SimpleFooter } from '@/components/simple-footer';

type GameTabType = 'dashboard' | 'achievements' | 'challenges' | 'leaderboard';

const tabs = [
  { id: 'dashboard' as GameTabType, label: 'Dashboard', icon: LayoutDashboard, path: '/game/dashboard' },
  { id: 'achievements' as GameTabType, label: 'Achievements', icon: Trophy, path: '/game/achievements' },
  { id: 'challenges' as GameTabType, label: 'Challenges', icon: Target, path: '/game/challenges' },
  { id: 'leaderboard' as GameTabType, label: 'Leaderboard', icon: Users, path: '/game/leaderboard' },
];

export default function GameLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = tabs.find(tab => pathname?.startsWith(tab.path))?.id || 'dashboard';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/30 dark:from-slate-950 dark:via-indigo-950/20 dark:to-blue-950/20">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-24 pt-6">
          {/* Header - Template-based styling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/60 bg-gradient-to-r from-white to-slate-50 p-6 shadow-[0_25px_50px_-24px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/60"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-600 dark:text-indigo-400">
                Gamification
              </p>
              <h1 className="mt-3 text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                Game Hub
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Track your progress, earn achievements, and level up!
              </p>
            </div>
          </motion.div>

          {/* Tabs Navigation - Template-based card style with rounded corners and shadows */}
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
                    onClick={() => router.push(tab.path)}
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

          {/* Content Area */}
          <div className="min-h-[400px]">
            {children}
          </div>
        </div>
      </div>
      <BottomNav />
      <SimpleFooter variant="auth" />
    </>
  );
}



