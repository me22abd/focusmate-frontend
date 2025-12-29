/**
 * Glassmorphic Card Component
 * Premium glassmorphism effect with backdrop blur and subtle transparency
 * Inspired by: Notion + Headspace design aesthetic
 */
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export function GlassCard({ children, className, hover = true, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/20',
        'bg-white/40 dark:bg-white/5 backdrop-blur-xl',
        'shadow-lg shadow-black/5 dark:shadow-black/20',
        'transition-all duration-300',
        hover && 'hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30',
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

