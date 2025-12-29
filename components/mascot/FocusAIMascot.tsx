/**
 * FocusAI Mascot Component
 * Cute robot mascot with animations for the Focusmate app
 * Features: idle floating, breathing, hover wave, blinking eyes, smile
 */
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface FocusAIMascotProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function FocusAIMascot({ className, size = 'md', animated = true }: FocusAIMascotProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  // Random blinking animation
  useEffect(() => {
    if (!animated) return;

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000); // Blink every 3-5 seconds

    return () => clearInterval(blinkInterval);
  }, [animated]);

  const sizeMap = {
    sm: { container: 'w-12 h-16', svg: 48 },
    md: { container: 'w-16 h-20', svg: 64 },
    lg: { container: 'w-32 h-40', svg: 128 },
  };

  const currentSize = sizeMap[size];

  return (
    <motion.div
      className={cn('relative', currentSize.container, className)}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={
        animated
          ? {
              // Initial entrance + Floating animation
              opacity: 1,
              scale: [1, 1.02, 1],
              y: [0, -8, 0],
            }
          : {
              opacity: 1,
              scale: 1,
              y: 0,
            }
      }
      transition={
        animated
          ? {
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : {
              type: 'spring',
              stiffness: 200,
              damping: 15,
              duration: 0.6,
            }
      }
    >
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        animate={
          isHovered && animated
            ? {
                // Wave animation on hover
                rotate: [0, 10, -10, 10, -10, 0],
              }
            : {}
        }
        transition={
          isHovered && animated
            ? {
                duration: 0.6,
                ease: 'easeInOut',
              }
            : {}
        }
      >
        <svg
          width={currentSize.svg}
          height={currentSize.svg * 1.25}
          viewBox="0 0 120 150"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Head - White/Purple gradient */}
          <motion.ellipse
            cx="60"
            cy="45"
            rx="28"
            ry="30"
            fill="url(#headGradient)"
            stroke="url(#headStroke)"
            strokeWidth="2"
            animate={animated ? { scale: [1, 1.01, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Eyes */}
          <motion.circle
            cx="50"
            cy="40"
            r="6"
            fill="#4c1d95"
            animate={isBlinking ? { scaleY: 0.1 } : { scaleY: 1 }}
            transition={{ duration: 0.15 }}
          />
          <motion.circle
            cx="70"
            cy="40"
            r="6"
            fill="#4c1d95"
            animate={isBlinking ? { scaleY: 0.1 } : { scaleY: 1 }}
            transition={{ duration: 0.15 }}
          />
          {/* Eye highlights */}
          <circle cx="52" cy="38" r="2" fill="white" opacity="0.8" />
          <circle cx="72" cy="38" r="2" fill="white" opacity="0.8" />

          {/* Smile */}
          <motion.path
            d="M 45 52 Q 60 60 75 52"
            stroke="#6b21a8"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />

          {/* Purple band across face */}
          <rect x="35" y="48" width="50" height="8" fill="#a855f7" rx="4" />

          {/* Body - Purple gradient */}
          <motion.rect
            x="30"
            y="75"
            width="60"
            height="55"
            rx="12"
            fill="url(#bodyGradient)"
            stroke="url(#bodyStroke)"
            strokeWidth="2"
            animate={animated ? { scale: [1, 1.01, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* FocusAI Text on Chest */}
          <text
            x="60"
            y="100"
            textAnchor="middle"
            fill="white"
            fontSize={size === 'sm' ? '6' : size === 'md' ? '8' : '10'}
            fontWeight="bold"
            style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}
          >
            FocusAI
          </text>

          {/* Light blue accent panel on lower body */}
          <rect x="35" y="115" width="50" height="12" fill="#60a5fa" rx="6" />

          {/* Left Arm */}
          <motion.ellipse
            cx="20"
            cy="90"
            rx="8"
            ry="20"
            fill="#7c3aed"
            animate={isHovered && animated ? { rotate: [0, 20, -20, 0] } : {}}
            transition={{ duration: 0.6 }}
          />
          <ellipse cx="20" cy="110" rx="10" ry="8" fill="#a855f7" />
          <circle cx="20" cy="120" r="6" fill="#6b21a8" />

          {/* Right Arm */}
          <motion.ellipse
            cx="100"
            cy="90"
            rx="8"
            ry="20"
            fill="#7c3aed"
            animate={isHovered && animated ? { rotate: [0, -20, 20, 0] } : {}}
            transition={{ duration: 0.6 }}
          />
          <ellipse cx="100" cy="110" rx="10" ry="8" fill="#a855f7" />
          <circle cx="100" cy="120" r="6" fill="#6b21a8" />

          {/* Left Leg */}
          <ellipse cx="45" cy="140" rx="10" ry="8" fill="#6b21a8" />
          <rect x="38" y="140" width="14" height="10" rx="7" fill="#7c3aed" />

          {/* Right Leg */}
          <ellipse cx="75" cy="140" rx="10" ry="8" fill="#6b21a8" />
          <rect x="68" y="140" width="14" height="10" rx="7" fill="#7c3aed" />

          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="headGradient" x1="60" y1="15" x2="60" y2="75">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f3e8ff" />
            </linearGradient>
            <linearGradient id="headStroke" x1="60" y1="15" x2="60" y2="75">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="bodyGradient" x1="60" y1="75" x2="60" y2="130">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="bodyStroke" x1="60" y1="75" x2="60" y2="130">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </motion.div>
  );
}
