'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CircularTimerProps {
  secondsRemaining: number;
  totalSeconds: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CircularTimer({
  secondsRemaining,
  totalSeconds,
  size = 200,
  strokeWidth = 12,
  className,
}: CircularTimerProps) {
  const progress = ((totalSeconds - secondsRemaining) / totalSeconds) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-700"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-orange-500 dark:text-orange-400"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'linear' }}
          strokeDasharray={circumference}
        />
      </svg>
      {/* Time text in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          key={secondsRemaining}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className="text-center"
        >
          <div className="text-4xl sm:text-5xl font-bold tabular-nums text-slate-900 dark:text-white">
            {formatTime(secondsRemaining)}
          </div>
        </motion.div>
      </div>
    </div>
  );
}


















