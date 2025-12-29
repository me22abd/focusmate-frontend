/**
 * Streak Badge Component
 * Fire streak indicator with animations
 * Inspired by: Duolingo streak system
 */
'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakBadgeProps {
  days: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakBadge({ days, className, size = 'md' }: StreakBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs gap-1 px-2 py-1',
    md: 'text-sm gap-1.5 px-3 py-1.5',
    lg: 'text-base gap-2 px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <motion.div
      className={cn(
        'inline-flex items-center rounded-full',
        'bg-gradient-to-r from-orange-500 to-red-500',
        'text-white font-bold shadow-md',
        sizeClasses[size],
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, -10, 10, 0],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Flame className={cn(iconSizes[size], 'drop-shadow-sm')} fill="currentColor" />
      </motion.div>
      <span>{days} day{days !== 1 ? 's' : ''}</span>
    </motion.div>
  );
}

