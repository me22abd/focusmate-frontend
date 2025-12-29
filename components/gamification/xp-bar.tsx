/**
 * XP Bar Component
 * Gamified experience bar with smooth animations
 * Inspired by: Duolingo XP system
 */
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface XPBarProps {
  currentXP: number;
  nextLevelXP: number;
  level?: number;
  className?: string;
  showLabel?: boolean;
}

export function XPBar({ 
  currentXP, 
  nextLevelXP, 
  level = 1,
  className,
  showLabel = true 
}: XPBarProps) {
  const progress = Math.min((currentXP / nextLevelXP) * 100, 100);
  const remainingXP = nextLevelXP - currentXP;

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">
            Level {level}
          </span>
          <span className="text-muted-foreground">
            {remainingXP > 0 ? `${remainingXP} XP to next level` : 'Max level!'}
          </span>
        </div>
      )}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{currentXP} XP</span>
          <span>{nextLevelXP} XP</span>
        </div>
      )}
    </div>
  );
}

