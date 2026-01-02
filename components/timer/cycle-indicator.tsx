/**
 * ============================================================================
 * CYCLE-INDICATOR.TSX - POMODORO CYCLE PROGRESS INDICATOR
 * ============================================================================
 * 
 * 📘 CODE ORIGIN: Custom implementation showing completed Pomodoro cycles.
 * Displays visual dots for cycle progress (4 cycles before long break).
 * 
 * @author Marvelous Eromonsele
 * ============================================================================
 */

'use client';

import { motion } from 'framer-motion';

interface CycleIndicatorProps {
  cycleCount: number;
  totalCycles: number;
  completedPomodoros: number;
}

export function CycleIndicator({
  cycleCount,
  totalCycles,
  completedPomodoros,
}: CycleIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Cycle Dots */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalCycles }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8 }}
            animate={{ scale: i < cycleCount ? 1 : 0.8 }}
            className={`h-3 w-3 rounded-full transition-all ${
              i < cycleCount
                ? 'bg-indigo-600'
                : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Cycle {cycleCount + 1}/{totalCycles} • {completedPomodoros} completed today
        </p>
      </div>
    </div>
  );
}
















