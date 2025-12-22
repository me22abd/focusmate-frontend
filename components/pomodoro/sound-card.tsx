/**
 * ============================================================================
 * SOUND-CARD.TSX - AMBIENT SOUND SELECTION CARD
 * ============================================================================
 * 
 * 📘 CODE ORIGIN: Card component from ShadCN UI, custom implementation for
 * sound selection with active state, playing indicator, and touch interaction.
 * 
 * @author Marvelous Eromonsele
 * ============================================================================
 */

'use client';

import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SoundCardProps {
  id: string;
  name: string;
  emoji: string;
  isActive: boolean;
  isPlaying: boolean;
  onClick: () => void;
  onToggle: () => void;
}

export function SoundCard({ name, emoji, isActive, isPlaying, onClick, onToggle }: SoundCardProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      className={cn(
        'relative flex flex-col items-center gap-2 rounded-xl p-4 border-2 transition-all',
        'hover:shadow-lg hover:scale-105',
        isActive
          ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50'
      )}
    >
      {/* Main Card - Click to Select */}
      <button
        type="button"
        onClick={onClick}
        className="w-full flex flex-col items-center gap-2"
      >
        {/* Emoji */}
        <div className="text-3xl">{emoji}</div>

        {/* Name */}
        <span className={cn(
          'text-sm font-medium',
          isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'
        )}>
          {name}
        </span>
      </button>

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={cn(
          'absolute bottom-2 right-2 p-1.5 rounded-full transition-all',
          isActive && isPlaying
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
        )}
      >
        {isActive && isPlaying ? (
          <Volume2 className="h-3 w-3 animate-pulse" />
        ) : (
          <Volume2 className="h-3 w-3" />
        )}
      </button>
    </motion.div>
  );
}

