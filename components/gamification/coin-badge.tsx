/**
 * Coin Badge Component
 * Gamified currency display with animations
 * Inspired by: Duolingo coins system
 */
'use client';

import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoinBadgeProps {
  amount: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function CoinBadge({ amount, className, size = 'md', animated = true }: CoinBadgeProps) {
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
        'bg-gradient-to-r from-amber-400 to-orange-500',
        'text-white font-bold shadow-md',
        sizeClasses[size],
        className
      )}
      animate={animated ? {
        scale: [1, 1.05, 1],
        rotate: [0, 5, -5, 0],
      } : {}}
      transition={animated ? {
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 2,
      } : {}}
    >
      <Coins className={cn(iconSizes[size], 'drop-shadow-sm')} />
      <span>{amount.toLocaleString()}</span>
    </motion.div>
  );
}

