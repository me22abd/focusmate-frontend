/**
 * FocusAI Mascot Component
 * 3D chibi-style robot mascot with animations
 * Features: idle floating, breathing, hover wave, blinking eyes, smile
 * Color scheme: Purple and white to match Focusmate branding
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
          height={currentSize.svg * 1.4}
          viewBox="0 0 100 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Head - White spherical */}
          <motion.circle
            cx="50"
            cy="40"
            r="28"
            fill="white"
            stroke="#c084fc"
            strokeWidth="1.5"
          />

          {/* Pink ear-like structures (changed to purple) */}
          <circle cx="25" cy="40" r="10" fill="#e9d5ff" />
          <circle cx="75" cy="40" r="10" fill="#e9d5ff" />
          <circle cx="25" cy="40" r="8" fill="white" opacity="0.7" />
          <circle cx="75" cy="40" r="8" fill="white" opacity="0.7" />

          {/* Light blue band across face (changed to soft blue/white) */}
          <rect x="22" y="45" width="56" height="12" rx="6" fill="#93c5fd" />

          {/* Eyes - Large circular black with white reflections */}
          <motion.circle
            cx="38"
            cy="38"
            r="8"
            fill="#1e1b4b"
            animate={isBlinking ? { scaleY: 0.1 } : { scaleY: 1 }}
            transition={{ duration: 0.15 }}
          />
          <motion.circle
            cx="62"
            cy="38"
            r="8"
            fill="#1e1b4b"
            animate={isBlinking ? { scaleY: 0.1 } : { scaleY: 1 }}
            transition={{ duration: 0.15 }}
          />
          {/* Eye highlights - white reflections */}
          <circle cx="40" cy="36" r="3" fill="white" />
          <circle cx="64" cy="36" r="3" fill="white" />

          {/* Smile - curved line on the blue band */}
          <motion.path
            d="M 32 52 Q 50 58 68 52"
            stroke="#4c1d95"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />

          {/* Antennae (optional, can be purple) */}
          <line x1="50" y1="12" x2="45" y2="20" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" />
          <line x1="50" y1="12" x2="55" y2="20" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" />
          <circle cx="45" cy="20" r="2" fill="#9333ea" />
          <circle cx="55" cy="20" r="2" fill="#9333ea" />

          {/* Body - Rounded barrel shape (changed from orange to purple) */}
          <motion.ellipse
            cx="50"
            cy="85"
            rx="32"
            ry="28"
            fill="#a855f7"
            stroke="#9333ea"
            strokeWidth="1.5"
            animate={animated ? { scale: [1, 1.01, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Light blue accent panel on lower body (inverted trapezoid) */}
          <path
            d="M 25 95 L 75 95 L 70 105 L 30 105 Z"
            fill="#93c5fd"
          />
          {/* Rivets on accent panel */}
          <circle cx="35" cy="100" r="1.5" fill="#4c1d95" />
          <circle cx="65" cy="100" r="1.5" fill="#4c1d95" />

          {/* Circular button/sensor on upper torso (light blue) */}
          <circle cx="50" cy="75" r="6" fill="#93c5fd" />
          <circle cx="50" cy="75" r="4.5" fill="#dbeafe" stroke="#4c1d95" strokeWidth="0.5" />

          {/* FocusAI Text on Chest */}
          <text
            x="50"
            y="88"
            textAnchor="middle"
            fill="white"
            fontSize={size === 'sm' ? '5' : size === 'md' ? '6' : '8'}
            fontWeight="bold"
            style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}
          >
            FocusAI
          </text>

          {/* Left Arm - Segmented */}
          <motion.g
            animate={isHovered && animated ? { rotate: [0, 20, -20, 0] } : {}}
            style={{ transformOrigin: '50px 85px' }}
            transition={{ duration: 0.6 }}
          >
            {/* Upper arm joint (dark grey) */}
            <circle cx="22" cy="80" r="5" fill="#4b5563" />
            {/* Upper arm segment (white) */}
            <ellipse cx="18" cy="88" rx="6" ry="12" fill="#f3f4f6" />
            {/* Forearm (purple) */}
            <ellipse cx="15" cy="100" rx="8" ry="10" fill="#9333ea" />
            {/* Hand (dark grey claws) */}
            <circle cx="12" cy="108" r="4" fill="#4b5563" />
            <rect x="9" y="108" width="2" height="4" rx="1" fill="#1f2937" />
            <rect x="12" y="108" width="2" height="4" rx="1" fill="#1f2937" />
            <rect x="15" y="108" width="2" height="4" rx="1" fill="#1f2937" />
          </motion.g>

          {/* Right Arm - Segmented */}
          <motion.g
            animate={isHovered && animated ? { rotate: [0, -20, 20, 0] } : {}}
            style={{ transformOrigin: '50px 85px' }}
            transition={{ duration: 0.6 }}
          >
            {/* Upper arm joint (dark grey) */}
            <circle cx="78" cy="80" r="5" fill="#4b5563" />
            {/* Upper arm segment (white) */}
            <ellipse cx="82" cy="88" rx="6" ry="12" fill="#f3f4f6" />
            {/* Forearm (purple) */}
            <ellipse cx="85" cy="100" rx="8" ry="10" fill="#9333ea" />
            {/* Hand (dark grey claws) */}
            <circle cx="88" cy="108" r="4" fill="#4b5563" />
            <rect x="85" y="108" width="2" height="4" rx="1" fill="#1f2937" />
            <rect x="88" y="108" width="2" height="4" rx="1" fill="#1f2937" />
            <rect x="91" y="108" width="2" height="4" rx="1" fill="#1f2937" />
          </motion.g>

          {/* Left Leg - Short and stout */}
          <g>
            {/* Leg joint (dark grey) */}
            <circle cx="38" cy="108" r="5" fill="#4b5563" />
            {/* Upper leg segment (white) */}
            <ellipse cx="38" cy="115" rx="6" ry="8" fill="#f3f4f6" />
            {/* Foot (purple boot) */}
            <ellipse cx="38" cy="125" rx="10" ry="8" fill="#9333ea" />
            {/* Light blue stripe on bottom of foot */}
            <rect x="30" y="128" width="16" height="2" rx="1" fill="#93c5fd" />
          </g>

          {/* Right Leg - Short and stout */}
          <g>
            {/* Leg joint (dark grey) */}
            <circle cx="62" cy="108" r="5" fill="#4b5563" />
            {/* Upper leg segment (white) */}
            <ellipse cx="62" cy="115" rx="6" ry="8" fill="#f3f4f6" />
            {/* Foot (purple boot) */}
            <ellipse cx="62" cy="125" rx="10" ry="8" fill="#9333ea" />
            {/* Light blue stripe on bottom of foot */}
            <rect x="54" y="128" width="16" height="2" rx="1" fill="#93c5fd" />
          </g>
        </svg>
      </motion.div>
    </motion.div>
  );
}
