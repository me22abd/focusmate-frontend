/**
 * ============================================================================
 * FOCUS/PAGE.TSX - HYBRID POMODORO TIMER PAGE
 * ============================================================================
 * 
 * Purpose: Complete Pomodoro timer system with Classic (25/5/15) and Custom
 * modes, auto-phase switching, persistent timer, backend integration for
 * session tracking, and notification system.
 * 
 * ============================================================================
 * 📘 CODE ORIGIN (REQUIRED FOR ACADEMIC HONESTY)
 * ============================================================================
 * 
 * FRAMEWORK CODE:
 * - Next.js page structure, 'use client' directive
 * - React hooks (useState, useEffect)
 * 
 * ADAPTED PATTERNS:
 * - Timer persistence from app/session/active/page.tsx
 * - Page layout from existing dashboard structure
 * - Card components from ShadCN UI
 * 
 * MY CUSTOM CODE:
 * - Pomodoro state machine (Classic/Custom switching)
 * - Auto-cycle progression (4 focus → long break)
 * - Integration with existing session save endpoint
 * - Responsive layout for timer display
 * - All component composition and logic
 * 
 * @author Marvelous Eromonsele
 * @page Frontend/Focus
 * ============================================================================
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { QuickNav } from '@/components/quick-nav';
import { TimerDisplay } from '@/components/timer/timer-display';
import { TimerControls } from '@/components/timer/timer-controls';
import { CycleIndicator } from '@/components/timer/cycle-indicator';
import { TimerSettings } from '@/components/timer/timer-settings';
import { SoundPanel } from '@/components/pomodoro/sound-panel';
import { usePomodoro } from '@/hooks/use-pomodoro';
import { useSoundPlayer } from '@/hooks/use-sound-player';
import { useAuthStore } from '@/store/auth-store';

export default function FocusPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const pomodoro = usePomodoro();
  const sound = useSoundPlayer();

  // Auth guard
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Quick Navigation */}
      <QuickNav showBack={true} showHome={true} />

      {/* Header with Navigation */}
      <PageHeader
        title="Focus Timer"
        emoji="🎧"
        showBack={false}
        showHome={false}
        actions={
          <TimerSettings
            mode={pomodoro.mode}
            settings={pomodoro.settings}
            onModeChange={pomodoro.switchMode}
            onSettingsChange={pomodoro.updateSettings}
          />
        }
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Timer Display */}
              <TimerDisplay
                timeRemaining={pomodoro.timeRemaining}
                phase={pomodoro.phase}
                progress={100 - pomodoro.progress}
              />

              {/* Controls */}
              <TimerControls
                isRunning={pomodoro.isRunning}
                onStart={pomodoro.start}
                onPause={pomodoro.pause}
                onReset={pomodoro.reset}
                onSkip={pomodoro.skip}
              />

              {/* Cycle Indicator */}
              <CycleIndicator
                cycleCount={pomodoro.cycleCount}
                totalCycles={pomodoro.settings.cyclesBeforeLongBreak}
                completedPomodoros={pomodoro.completedPomodoros}
              />

              {/* Mode Badge */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2">
                  <div className={`h-2 w-2 rounded-full ${
                    pomodoro.mode === 'classic' ? 'bg-blue-500' : 'bg-purple-500'
                  }`} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {pomodoro.mode === 'classic' ? 'Classic Mode' : 'Custom Mode'}
                  </span>
                </div>
              </div>

              {/* Today's Achievement */}
              {pomodoro.completedPomodoros > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 p-4 border border-indigo-100 dark:border-indigo-900"
                >
                  <div className="flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-indigo-600" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {pomodoro.completedPomodoros * pomodoro.settings.focusDuration} minutes focused today!
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Keep up the great work! 🎯
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Ambient Sounds Section */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <SoundPanel
                  currentSound={sound.currentSound}
                  isPlaying={sound.isPlaying}
                  volume={sound.volume}
                  isMuted={sound.isMuted}
                  onSoundSelect={sound.playSound}
                  onVolumeChange={sound.updateVolume}
                  onToggleMute={sound.toggleMute}
                />
              </div>

              {/* Tips */}
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4">
                <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2">
                  💡 Pomodoro Tips
                </h3>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Eliminate all distractions during focus time</li>
                  <li>• Use breaks to rest your mind completely</li>
                  <li>• Don't skip breaks - they're part of the technique</li>
                  <li>• Track your progress and adjust settings as needed</li>
                </ul>
              </div>
            </motion.div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * ============================================================================
 * WHAT I BUILT VS WHAT I ADAPTED
 * ============================================================================
 * 
 * ADAPTED:
 * - Dialog component (ShadCN UI library)
 * - Card layout structure (existing Focusmate pattern)
 * - Timer persistence concept (from active session timer)
 * 
 * MY CUSTOM IMPLEMENTATIONS:
 * - Complete Pomodoro state machine
 * - Classic/Custom mode switching
 * - 4-cycle long break detection
 * - Auto-phase transitions
 * - Backend integration (save sessions)
 * - Notification triggers
 * - Cycle indicator UI
 * - Achievement display
 * - Tips section
 * - Responsive layout
 * 
 * ============================================================================
 * HOW TO EXPLAIN DURING VIVA
 * ============================================================================
 * 
 * "I built a complete Pomodoro timer system that extends Focusmate's existing
 * session tracking. The timer supports both Classic (25/5/15) and Custom modes,
 * automatically progresses through focus and break cycles, and persists across
 * page refreshes using localStorage with timestamp-based calculations.
 * 
 * I integrated it with the existing backend by saving completed Pomodoros as
 * solo sessions, which updates the user's streak and analytics. The state
 * machine handles automatic transitions - after 4 focus cycles, it triggers
 * a long break. All settings are customizable and persist locally.
 * 
 * The implementation reuses existing infrastructure (session API, notifications,
 * analytics) while adding a focused study technique that complements the
 * partner session system."
 * 
 * ============================================================================
 */

