'use client';

import { useEffect } from 'react';
import { preloadSounds } from '@/lib/sounds';

/**
 * Sound Preloader Component
 * 
 * Unlocks audio context on first user interaction for iOS compatibility.
 * This component should be included in the root layout.
 */
export function SoundPreloader() {
  useEffect(() => {
    preloadSounds();
  }, []);

  return null; // This component doesn't render anything
}





