/**
 * ============================================================================
 * USE-POMODORO.TS - POMODORO TIMER STATE MANAGEMENT HOOK
 * ============================================================================
 * 
 * Purpose: Custom React hook that manages all Pomodoro timer logic including
 * Classic (25/5/15) and Custom modes, timer persistence, auto-phase switching,
 * notification triggers, and backend integration for session tracking.
 * 
 * ============================================================================
 * 📘 CODE ORIGIN (REQUIRED FOR ACADEMIC HONESTY)
 * ============================================================================
 * 
 * FRAMEWORK CODE:
 * - useState, useEffect, useCallback hooks (React library)
 * - localStorage API (Browser standard)
 * 
 * ADAPTED PATTERNS:
 * - Timer persistence pattern (similar to session timer in active/page.tsx)
 * - State machine for timer phases (adapted from Pomodoro technique)
 * 
 * MY CUSTOM CODE:
 * - Classic/Custom mode switching
 * - 4-cycle long break detection
 * - Auto-phase transition logic
 * - Notification integration
 * - Backend session saving on focus completion
 * - All timer calculations and state management
 * 
 * @author Marvelous Eromonsele
 * @module Frontend/Hooks
 * ============================================================================
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { saveSession } from '@/lib/api/sessions';
import { useAuthStore } from '@/store/auth-store';

type PomodoroPhase = 'focus' | 'short-break' | 'long-break';
type TimerMode = 'classic' | 'custom';

interface PomodoroSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  cyclesBeforeLongBreak: number;
}

interface PomodoroState {
  phase: PomodoroPhase;
  timeRemaining: number;
  isRunning: boolean;
  cycleCount: number;
  completedPomodoros: number;
  mode: TimerMode;
  settings: PomodoroSettings;
}

const CLASSIC_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  cyclesBeforeLongBreak: 4,
};

const DEFAULT_CUSTOM_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  cyclesBeforeLongBreak: 4,
};

export function usePomodoro() {
  const { user } = useAuthStore();
  
  // Load persisted state from localStorage
  const loadState = useCallback((): PomodoroState => {
    if (typeof window === 'undefined') return getInitialState();
    
    const stored = localStorage.getItem('pomodoro_state');
    if (!stored) return getInitialState();
    
    try {
      const parsed = JSON.parse(stored);
      const startTime = localStorage.getItem('pomodoro_start_time');
      
      if (parsed.isRunning && startTime) {
        // Recalculate time based on elapsed time
        const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
        const initialDuration = getPhaseDuration(parsed.phase, parsed.settings);
        const remaining = Math.max(0, initialDuration * 60 - elapsed);
        
        return { ...parsed, timeRemaining: remaining };
      }
      
      return parsed;
    } catch {
      return getInitialState();
    }
  }, []);

  function getInitialState(): PomodoroState {
    const customSettings = loadCustomSettings();
    return {
      phase: 'focus',
      timeRemaining: CLASSIC_SETTINGS.focusDuration * 60,
      isRunning: false,
      cycleCount: 0,
      completedPomodoros: 0,
      mode: 'classic',
      settings: customSettings,
    };
  }

  const [state, setState] = useState<PomodoroState>(getInitialState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load custom settings from localStorage
  function loadCustomSettings(): PomodoroSettings {
    if (typeof window === 'undefined') return DEFAULT_CUSTOM_SETTINGS;
    const stored = localStorage.getItem('pomodoro_custom_settings');
    return stored ? JSON.parse(stored) : DEFAULT_CUSTOM_SETTINGS;
  }

  // Get phase duration based on mode and settings
  function getPhaseDuration(phase: PomodoroPhase, settings: PomodoroSettings): number {
    switch (phase) {
      case 'focus': return settings.focusDuration;
      case 'short-break': return settings.shortBreakDuration;
      case 'long-break': return settings.longBreakDuration;
    }
  }

  // Persist state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoro_state', JSON.stringify(state));
    }
  }, [state]);

  // Timer tick logic
  useEffect(() => {
    if (!state.isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.timeRemaining <= 1) {
          // Phase complete - auto-switch
          handlePhaseComplete(prev);
          return prev;
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isRunning]);

  // Handle phase completion
  async function handlePhaseComplete(currentState: PomodoroState) {
    const { phase, cycleCount, completedPomodoros, settings } = currentState;

    if (intervalRef.current) clearInterval(intervalRef.current);

    // Notifications
    if (phase === 'focus') {
      toast.success('🎯 Focus session complete!', {
        description: 'Great work! Take a break.',
      });
      
      // Save to backend
      if (user) {
        try {
          await saveSession(user.id, {
            mode: 'solo',
            focusTopic: 'Pomodoro Timer',
            durationMinutes: settings.focusDuration,
            startedAt: new Date(Date.now() - settings.focusDuration * 60 * 1000).toISOString(),
            endedAt: new Date().toISOString(),
            notes: `Completed Pomodoro #${completedPomodoros + 1}`,
          });
        } catch (error) {
          console.error('Failed to save pomodoro session:', error);
        }
      }

      // Determine next break type
      const nextCycleCount = cycleCount + 1;
      const isLongBreak = nextCycleCount >= settings.cyclesBeforeLongBreak;
      const nextPhase = isLongBreak ? 'long-break' : 'short-break';
      const nextDuration = getPhaseDuration(nextPhase, settings);

      setState({
        ...currentState,
        phase: nextPhase,
        timeRemaining: nextDuration * 60,
        isRunning: false,
        cycleCount: isLongBreak ? 0 : nextCycleCount,
        completedPomodoros: completedPomodoros + 1,
      });
    } else {
      // Break complete
      toast.info(phase === 'short-break' ? '☕ Break over!' : '🌟 Long break over!', {
        description: 'Ready for another focus session?',
      });

      setState({
        ...currentState,
        phase: 'focus',
        timeRemaining: settings.focusDuration * 60,
        isRunning: false,
      });
    }
  }

  // Start timer
  const start = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: true }));
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoro_start_time', Date.now().toString());
    }
  }, []);

  // Pause timer
  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false }));
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  // Reset timer
  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState((prev) => ({
      ...prev,
      timeRemaining: getPhaseDuration(prev.phase, prev.settings) * 60,
      isRunning: false,
    }));
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pomodoro_start_time');
    }
  }, []);

  // Skip to next phase
  const skip = useCallback(() => {
    setState((prev) => {
      const nextPhase = prev.phase === 'focus' ? 'short-break' : 'focus';
      const nextDuration = getPhaseDuration(nextPhase, prev.settings);
      return {
        ...prev,
        phase: nextPhase,
        timeRemaining: nextDuration * 60,
        isRunning: false,
      };
    });
  }, []);

  // Switch mode (Classic ↔ Custom)
  const switchMode = useCallback((newMode: TimerMode) => {
    const settings = newMode === 'classic' ? CLASSIC_SETTINGS : loadCustomSettings();
    setState((prev) => ({
      ...prev,
      mode: newMode,
      settings,
      timeRemaining: getPhaseDuration(prev.phase, settings) * 60,
      isRunning: false,
    }));
  }, []);

  // Update custom settings
  const updateSettings = useCallback((newSettings: Partial<PomodoroSettings>) => {
    const updated = { ...state.settings, ...newSettings };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoro_custom_settings', JSON.stringify(updated));
    }
    
    setState((prev) => ({
      ...prev,
      settings: updated,
      timeRemaining: getPhaseDuration(prev.phase, updated) * 60,
    }));
  }, [state.settings]);

  // Initialize on mount
  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
  }, [loadState]);

  return {
    ...state,
    start,
    pause,
    reset,
    skip,
    switchMode,
    updateSettings,
    progress: (state.timeRemaining / (getPhaseDuration(state.phase, state.settings) * 60)) * 100,
  };
}











