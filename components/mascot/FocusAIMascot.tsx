/**
 * FocusAI Mascot Component
 * Sleek futuristic mini robot assistant
 * Features: idle floating, breathing (scale), wave on hover, smile expression, bounce on mount
 * Color scheme: Soft gradient colors (purple → blue), modern robotic design
 * 
 * Variants: idle, wave, happy
 */
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface FocusAIMascotProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  variant?: 'idle' | 'wave' | 'happy';
}

export function FocusAIMascot({ 
  className, 
  size = 'md', 
  animated = true,
  variant = 'idle'
}: FocusAIMascotProps) {
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
    sm: { container: 'w-12 h-16', svg: 80, fontSize: 4 },
    md: { container: 'w-16 h-20', svg: 100, fontSize: 5 },
    lg: { container: 'w-32 h-40', svg: 160, fontSize: 7 },
  };

  const currentSize = sizeMap[size];

  // Determine if should wave based on variant or hover
  const shouldWave = variant === 'wave' || (isHovered && animated);
  const isHappy = variant === 'happy';

  return (
    <motion.div
      className={cn('relative', currentSize.container, className)}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={
        animated
          ? {
              // Idle floating + breathing (scale up/down)
              opacity: 1,
              scale: [1, 1.03, 1], // Subtle breathing animation
              y: [0, -8, 0], // Floating animation
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
      {/* Subtle glow effect background */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-400/20 via-purple-400/20 to-blue-400/20 blur-lg"
        animate={
          animated
            ? {
                opacity: [0.2, 0.4, 0.2],
                scale: [1, 1.1, 1],
              }
            : {}
        }
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        animate={
          shouldWave && animated
            ? {
                // Wave animation on hover
                rotate: [0, 12, -12, 12, -12, 0],
              }
            : {}
        }
        transition={
          shouldWave && animated
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
          viewBox="0 0 100 125"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Main body gradient - Purple to Blue */}
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            
            {/* Head gradient - Lighter purple-blue */}
            <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
            
            {/* Accent gradient - Bright blue-purple */}
            <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            
            {/* Shadow gradient for depth */}
            <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.5" />
            </linearGradient>
            
            {/* Glow effect */}
            <radialGradient id="glowGradient" cx="50%" cy="30%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Head - Rounded rectangle with modern proportions */}
          <motion.rect
            x="20"
            y="8"
            width="60"
            height="50"
            rx="12"
            fill="url(#headGradient)"
            stroke="url(#accentGradient)"
            strokeWidth="1.5"
            animate={animated ? { scale: [1, 1.01, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          
          {/* Head highlight/shine */}
          <rect
            x="22"
            y="10"
            width="56"
            height="20"
            rx="10"
            fill="url(#glowGradient)"
            opacity="0.6"
          />

          {/* Eyes - Modern, expressive, larger */}
          <motion.g
            animate={isBlinking ? { scaleY: 0.05 } : { scaleY: 1 }}
            transition={{ duration: 0.15 }}
          >
            {/* Left eye */}
            <ellipse cx="38" cy="32" rx="7" ry="9" fill="#ffffff" />
            <ellipse cx="38" cy="32" rx="5" ry="7" fill="url(#bodyGradient)" />
            <circle cx="37" cy="30" r="2.5" fill="#1e1b4b" />
            <circle cx="36.5" cy="29" r="1.5" fill="#ffffff" opacity="0.9" />
            
            {/* Right eye */}
            <ellipse cx="62" cy="32" rx="7" ry="9" fill="#ffffff" />
            <ellipse cx="62" cy="32" rx="5" ry="7" fill="url(#bodyGradient)" />
            <circle cx="63" cy="30" r="2.5" fill="#1e1b4b" />
            <circle cx="63.5" cy="29" r="1.5" fill="#ffffff" opacity="0.9" />
          </motion.g>

          {/* Smile expression - Subtle, professional */}
          <motion.path
            d={isHappy ? "M 30 48 Q 50 55 70 48" : "M 32 50 Q 50 54 68 50"}
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />

          {/* Head accent lines - Modern robotic detail */}
          <line x1="30" y1="20" x2="70" y2="20" stroke="url(#accentGradient)" strokeWidth="1" opacity="0.6" />
          <line x1="28" y1="25" x2="72" y2="25" stroke="url(#accentGradient)" strokeWidth="0.8" opacity="0.4" />

          {/* Body - Sleek rounded rectangle */}
          <motion.rect
            x="15"
            y="58"
            width="70"
            height="55"
            rx="14"
            fill="url(#bodyGradient)"
            stroke="url(#accentGradient)"
            strokeWidth="1.5"
            animate={animated ? { scale: [1, 1.01, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          
          {/* Body shadow for depth */}
          <rect
            x="15"
            y="58"
            width="70"
            height="55"
            rx="14"
            fill="url(#shadowGradient)"
            opacity="0.3"
          />

          {/* Chest panel - Where FocusAI text goes */}
          <rect
            x="25"
            y="70"
            width="50"
            height="25"
            rx="6"
            fill="url(#accentGradient)"
            opacity="0.3"
          />
          
          {/* Chest panel border */}
          <rect
            x="25"
            y="70"
            width="50"
            height="25"
            rx="6"
            fill="none"
            stroke="url(#accentGradient)"
            strokeWidth="1"
            opacity="0.6"
          />

          {/* FocusAI Text on Chest */}
          <text
            x="50"
            y="87"
            textAnchor="middle"
            fill="white"
            fontSize={currentSize.fontSize}
            fontWeight="600"
            letterSpacing="0.5"
            style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}
          >
            FocusAI
          </text>

          {/* Modern robotic details - Side panels */}
          <rect x="18" y="65" width="3" height="12" rx="1.5" fill="url(#accentGradient)" opacity="0.7" />
          <rect x="79" y="65" width="3" height="12" rx="1.5" fill="url(#accentGradient)" opacity="0.7" />
          
          {/* Status indicator lights */}
          <circle cx="28" cy="102" r="2" fill="#60a5fa" opacity="0.8">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="72" cy="102" r="2" fill="#a78bfa" opacity="0.8">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" begin="1s" repeatCount="indefinite" />
          </circle>

          {/* Base/Stand - Modern rounded platform */}
          <ellipse
            cx="50"
            cy="118"
            rx="32"
            ry="6"
            fill="url(#bodyGradient)"
            opacity="0.8"
          />
          <ellipse
            cx="50"
            cy="118"
            rx="32"
            ry="6"
            fill="none"
            stroke="url(#accentGradient)"
            strokeWidth="1"
            opacity="0.6"
          />

          {/* Decorative accent dots - Subtle, professional */}
          <circle cx="35" cy="80" r="1.5" fill="#ffffff" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="65" cy="80" r="1.5" fill="#ffffff" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3s" begin="1.5s" repeatCount="indefinite" />
          </circle>
        </svg>
      </motion.div>
    </motion.div>
  );
}
