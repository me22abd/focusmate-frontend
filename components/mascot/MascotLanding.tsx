/**
 * Mascot Landing Component
 * Large hero mascot with animations for the landing page
 * Features: idle floating, breathing, hover wave, entrance bounce
 */
'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface MascotLandingProps {
  className?: string;
}

export function MascotLanding({ className }: MascotLandingProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={cn('relative', className)}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 15,
        duration: 0.6,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Main Mascot Container */}
      <motion.div
        className="relative flex items-center justify-center"
        animate={{
          // Floating animation (gentle up and down)
          y: [0, -10, 0],
          // Breathing animation (gentle scale)
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400/30 via-blue-400/30 to-cyan-400/30 blur-2xl"
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Main Circle */}
        <motion.div
          className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 shadow-2xl border-4 border-white/20 dark:border-white/10"
          animate={
            isHovered
              ? {
                  // Wave animation on hover
                  rotate: [0, 10, -10, 10, -10, 0],
                  scale: [1, 1.05, 1.05, 1.05, 1.05, 1],
                }
              : {}
          }
          transition={
            isHovered
              ? {
                  duration: 0.6,
                  ease: 'easeInOut',
                }
              : {}
          }
        >
          {/* Sparkle effects */}
          <motion.div
            className="absolute top-4 left-4"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0,
            }}
          >
            <Sparkles className="w-8 h-8 text-white/80" />
          </motion.div>

          <motion.div
            className="absolute bottom-4 right-4"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              rotate: [0, -180, -360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1,
            }}
          >
            <Sparkles className="w-8 h-8 text-white/80" />
          </motion.div>

          <motion.div
            className="absolute top-1/2 right-4"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: 0.5,
            }}
          >
            <Sparkles className="w-6 h-6 text-white/60" />
          </motion.div>

          {/* Central Sparkle Icon (Mascot Face) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={
                isHovered
                  ? {
                      // Waving motion
                      rotate: [0, 20, -20, 20, -20, 0],
                    }
                  : {
                      // Gentle pulse
                      scale: [1, 1.1, 1],
                    }
              }
              transition={
                isHovered
                  ? {
                      duration: 0.6,
                      ease: 'easeInOut',
                    }
                  : {
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }
              }
            >
              <Sparkles className="w-24 h-24 md:w-32 md:h-32 text-white drop-shadow-lg" />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

