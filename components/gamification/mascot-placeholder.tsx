/**
 * Mascot Placeholder Component
 * Placeholder for future AI assistant mascot
 * Inspired: Headspace + Duolingo mascots
 */
'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MascotPlaceholderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function MascotPlaceholder({ 
  className, 
  size = 'md',
  animated = true 
}: MascotPlaceholderProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <motion.div
      className={cn(
        'relative flex items-center justify-center rounded-full',
        'bg-gradient-to-br from-purple-400 via-blue-400 to-cyan-400',
        'shadow-lg',
        sizeClasses[size],
        className
      )}
      animate={animated ? {
        scale: [1, 1.05, 1],
        rotate: [0, 5, -5, 0],
      } : {}}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Sparkle effects */}
      {animated && (
        <>
          <motion.div
            className="absolute top-2 left-2"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0,
            }}
          >
            <Sparkles className={cn(iconSizes[size], 'text-white/60')} />
          </motion.div>
          <motion.div
            className="absolute bottom-2 right-2"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1,
            }}
          >
            <Sparkles className={cn(iconSizes[size], 'text-white/60')} />
          </motion.div>
        </>
      )}
      <Sparkles className={cn(iconSizes[size], 'text-white z-10')} />
    </motion.div>
  );
}

