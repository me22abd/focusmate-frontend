/**
 * Animated Button Component
 * Premium button with micro-interactions and smooth animations
 * Inspired by: Duolingo + Headspace button design
 */
'use client';

import { motion } from 'framer-motion';
import { Button, ButtonProps } from './button';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends ButtonProps {
  pulse?: boolean;
  glow?: boolean;
}

export function AnimatedButton({ 
  children, 
  className, 
  pulse = false,
  glow = false,
  ...props 
}: AnimatedButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={pulse ? { 
        boxShadow: [
          '0 0 0 0 rgba(139, 92, 246, 0)',
          '0 0 0 8px rgba(139, 92, 246, 0.1)',
          '0 0 0 0 rgba(139, 92, 246, 0)',
        ]
      } : {}}
      transition={pulse ? { 
        duration: 2, 
        repeat: Infinity,
        ease: 'easeInOut'
      } : { duration: 0.2 }}
    >
      <Button
        className={cn(
          'relative overflow-hidden',
          glow && 'shadow-lg shadow-primary/50',
          className
        )}
        {...props}
      >
        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
        <span className="relative z-10">{children}</span>
      </Button>
    </motion.div>
  );
}

