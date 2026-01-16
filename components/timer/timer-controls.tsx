/**
 * ============================================================================
 * TIMER-CONTROLS.TSX - POMODORO TIMER CONTROL BUTTONS
 * ============================================================================
 * 
 * 📘 CODE ORIGIN: Button layout adapted from session controls.
 * Custom implementation: Pomodoro-specific actions (start/pause/reset/skip).
 * 
 * @author Marvelous Eromonsele
 * ============================================================================
 */

'use client';

import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
}

export function TimerControls({
  isRunning,
  onStart,
  onPause,
  onReset,
  onSkip,
}: TimerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {/* Start/Pause Button */}
      {!isRunning ? (
        <Button
          onClick={onStart}
          size="lg"
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8"
        >
          <Play className="mr-2 h-5 w-5" />
          Start
        </Button>
      ) : (
        <Button
          onClick={onPause}
          size="lg"
          variant="outline"
          className="px-8"
        >
          <Pause className="mr-2 h-5 w-5" />
          Pause
        </Button>
      )}

      {/* Reset Button */}
      <Button
        onClick={onReset}
        size="lg"
        variant="outline"
      >
        <RotateCcw className="h-5 w-5" />
      </Button>

      {/* Skip Button */}
      <Button
        onClick={onSkip}
        size="lg"
        variant="ghost"
      >
        <SkipForward className="h-5 w-5" />
      </Button>
    </div>
  );
}

















