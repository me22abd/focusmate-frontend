/**
 * FocusAI Character Component
 * Displays PNG mascot images with animations and pose switching
 * Uses official FocusAI mascot assets from /public/mascot/
 */
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export type FocusAIPose = 
  | 'idle' 
  | 'wave' 
  | 'smile' 
  | 'help' 
  | 'flip' 
  | 'idea' 
  | 'sleep' 
  | 'notebook';

interface FocusAICharacterProps {
  pose?: FocusAIPose;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  className?: string;
  onHoverPose?: FocusAIPose; // Pose to switch to on hover
  autoPose?: boolean; // Enable automatic pose switching
}

const poseImageMap: Record<FocusAIPose, string> = {
  idle: '/mascot/focusai.png',
  wave: '/mascot/focusai_wave.png',
  smile: '/mascot/focusai_smile.png',
  help: '/mascot/focusai_help.png',
  flip: '/mascot/focusai_flip.png',
  idea: '/mascot/focusai_idea.png',
  sleep: '/mascot/focusai_sleep.png',
  notebook: '/mascot/focusai_notebook.png',
};

const sizeMap = {
  sm: { width: 48, height: 48, className: 'w-12 h-12' },
  md: { width: 70, height: 70, className: 'w-[70px] h-[70px]' },
  lg: { width: 250, height: 250, className: 'w-[220px] md:w-[280px] h-auto' },
};

export function FocusAICharacter({
  pose = 'idle',
  size = 'md',
  animate = true,
  className,
  onHoverPose,
  autoPose = false,
}: FocusAICharacterProps) {
  const [currentPose, setCurrentPose] = useState<FocusAIPose>(pose);
  const [isHovered, setIsHovered] = useState(false);
  const [playfulPoseTimeout, setPlayfulPoseTimeout] = useState<NodeJS.Timeout | null>(null);

  // Update pose when prop changes
  useEffect(() => {
    if (!isHovered) {
      setCurrentPose(pose);
    }
  }, [pose, isHovered]);

  // Handle hover pose switching
  useEffect(() => {
    if (isHovered && onHoverPose) {
      setCurrentPose(onHoverPose);
    } else if (!isHovered && onHoverPose) {
      setCurrentPose(pose);
    }
  }, [isHovered, onHoverPose, pose]);

  // Random playful animation (flip pose every 20-35 seconds)
  useEffect(() => {
    if (!autoPose || !animate) return;

    const schedulePlayfulPose = () => {
      const delay = 20000 + Math.random() * 15000; // 20-35 seconds
      const timeout = setTimeout(() => {
        setCurrentPose('flip');
        setTimeout(() => {
          setCurrentPose(pose);
          schedulePlayfulPose();
        }, 2000); // Show flip for 2 seconds
      }, delay);
      setPlayfulPoseTimeout(timeout);
    };

    schedulePlayfulPose();

    return () => {
      if (playfulPoseTimeout) {
        clearTimeout(playfulPoseTimeout);
      }
    };
  }, [autoPose, animate, pose]);

  const currentSize = sizeMap[size];
  const imageSrc = poseImageMap[currentPose];

  return (
    <motion.div
      className={cn('relative flex items-center justify-center', currentSize.className, className)}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={
        animate
          ? {
              opacity: 1,
              scale: [1, 1.02, 0.98, 1], // Breathing animation
              y: [0, -4, 4, 0], // Floating animation
            }
          : {
              opacity: 1,
              scale: 1,
              y: 0,
            }
      }
      transition={
        animate
          ? {
              duration: 4,
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
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={
        animate
          ? {
              rotate: [0, -8, 8, -8, 0], // Hover wave animation
            }
          : {}
      }
    >
      <Image
        src={imageSrc}
        alt={`FocusAI mascot - ${currentPose} pose`}
        width={currentSize.width}
        height={currentSize.height}
        className={cn('object-contain w-full h-full', {
          'transition-all duration-300': animate,
        })}
        priority={size === 'lg'}
        unoptimized // For PNG images, disable optimization if needed
      />
    </motion.div>
  );
}

