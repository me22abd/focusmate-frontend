/**
 * ============================================================================
 * TIMER-DISPLAY.TSX - CIRCULAR POMODORO TIMER DISPLAY
 * ============================================================================
 * 
 * 📘 CODE ORIGIN: Circular progress timer adapted from active session timer.
 * Custom implementation: Pomodoro-specific colors, phase labels, animations.
 * 
 * @author Marvelous Eromonsele
 * ============================================================================
 */

'use client';

import { motion } from 'framer-motion';

interface TimerDisplayProps {
  timeRemaining: number;
  phase: 'focus' | 'short-break' | 'long-break';
  progress: number;
}

export function TimerDisplay({ timeRemaining, phase, progress }: TimerDisplayProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const phaseConfig = {
    focus: { color: 'rgb(59, 130, 246)', label: 'Focus Time', emoji: '🎯' },
    'short-break': { color: 'rgb(34, 197, 94)', label: 'Short Break', emoji: '☕' },
    'long-break': { color: 'rgb(168, 85, 247)', label: 'Long Break', emoji: '🌟' },
  };

  const config = phaseConfig[phase];
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Phase Label */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <span className="text-4xl">{config.emoji}</span>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          {config.label}
        </h2>
      </motion.div>

      {/* Circular Timer */}
      <div className="relative">
        <svg width="280" height="280" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-slate-200 dark:text-slate-700"
          />
          {/* Progress circle */}
          <motion.circle
            cx="140"
            cy="140"
            r={radius}
            stroke={config.color}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>

        {/* Timer Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl font-bold text-slate-900 dark:text-white font-mono">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}















