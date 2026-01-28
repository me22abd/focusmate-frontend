/**
 * ============================================================================
 * USE-SOUND-PLAYER.TS - AMBIENT SOUND PLAYER HOOK
 * ============================================================================
 * 
 * Purpose: Manages ambient sound playback for Pomodoro timer. Handles audio
 * loading, play/pause, volume control, looping, and localStorage persistence.
 * 
 * ============================================================================
 * 📘 CODE ORIGIN (REQUIRED FOR ACADEMIC HONESTY)
 * ============================================================================
 * 
 * FRAMEWORK CODE:
 * - useState, useEffect, useRef (React hooks)
 * - Audio API (Browser standard Web Audio API)
 * - localStorage (Browser storage API)
 * 
 * ADAPTED PATTERNS:
 * - Audio playback pattern (common in music/meditation apps)
 * - Volume slider state management (standard UI pattern)
 * 
 * MY CUSTOM CODE:
 * - Sound category organization (recommended, nature, calm, focus, white-noise, beats)
 * - Auto-restore from localStorage on mount
 * - Mute/unmute toggle logic
 * - Sound switching with cleanup
 * - Loop handling
 * - All state management
 * 
 * @author Marvelous Eromonsele
 * @module Frontend/Hooks
 * ============================================================================
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { SOUNDS, type Sound } from "@/lib/sounds-library";

export function useSoundPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const savedSound = localStorage.getItem("pomodoro_sound");
    const savedVolume = localStorage.getItem("pomodoro_volume");
    const savedMuted = localStorage.getItem("pomodoro_muted");
    
    if (savedSound) setCurrentSound(savedSound);
    if (savedVolume) setVolume(parseInt(savedVolume));
    if (savedMuted) setIsMuted(savedMuted === "true");
  }, []);

  // Stop sound (define first)
  const stopSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setCurrentSound(null);
    setIsPlaying(false);
  }, []);

  // Play sound
  const playSound = useCallback((soundId: string) => {
    // Special case: Stop sound
    if (soundId === "STOP") {
      stopSound();
      return;
    }

    const sound = SOUNDS.find(s => s.id === soundId);
    if (!sound) {
      toast.error("Sound not found", {
        description: "This sound is not configured correctly. Please try another option.",
      });
      return;
    }

    // If same sound is already playing, stop it
    if (currentSound === soundId && isPlaying) {
      stopSound();
      return;
    }

    // Stop previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Create new audio
    const audio = new Audio(sound.path);
    audio.loop = true;
    audio.volume = isMuted ? 0 : volume / 100;
    
    audio.play()
      .then(() => {
        console.log("✅ Playing:", sound.name);
      })
      .catch((error) => {
        console.warn("⚠️ Sound file not found or failed to load:", sound.path, error);
        toast.error("Unable to play sound", {
          description: `The "${sound.name}" track could not be loaded. Please try a different sound.`,
        });
        // Ensure state stays consistent if playback fails
        setIsPlaying(false);
        return;
      });

    audioRef.current = audio;
    setCurrentSound(soundId);
    setIsPlaying(true);
    
    // Save preference
    if (typeof window !== "undefined") {
      localStorage.setItem("pomodoro_sound", soundId);
    }
  }, [volume, isMuted, currentSound, isPlaying, stopSound]);

  // Update volume
  const updateVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = newVolume / 100;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("pomodoro_volume", newVolume.toString());
    }
  }, [isMuted]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : volume / 100;
    }
    
    if (typeof window !== "undefined") {
      localStorage.setItem("pomodoro_muted", newMuted.toString());
    }
  }, [isMuted, volume]);

  // Update audio volume when volume or mute changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    currentSound,
    volume,
    isMuted,
    isPlaying,
    playSound,
    stopSound,
    updateVolume,
    toggleMute,
  };
}

