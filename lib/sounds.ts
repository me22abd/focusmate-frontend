/**
 * ============================================================================
 * SOUNDS.TS - GLOBAL SOUND MANAGER FOR SESSION NOTIFICATIONS
 * ============================================================================
 * 
 * Purpose: Manages notification sounds for session events (end, countdown, task complete).
 * Handles iOS audio context unlock, sound preloading, and respects user settings.
 * 
 * ============================================================================
 */

'use client';

// Audio context for iOS compatibility
let audioContext: AudioContext | null = null;
let isAudioUnlocked = false;

/**
 * Unlock audio context on iOS (must be called after user interaction)
 */
function unlockAudioContext() {
  if (typeof window === 'undefined' || isAudioUnlocked) return;

  try {
    // Create audio context if it doesn't exist
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
      }
    }

    // Unlock audio context by creating and playing a silent buffer
    if (audioContext && audioContext.state === 'suspended') {
      const buffer = audioContext.createBuffer(1, 1, 22050);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
      audioContext.resume();
    }

    isAudioUnlocked = true;
  } catch (error) {
    console.warn('Failed to unlock audio context:', error);
  }
}

/**
 * Generate session end sound using Web Audio API
 * Creates a pleasant completion chime
 */
function generateSessionEndSound(volume: number = 0.5): void {
  if (typeof window === 'undefined') return;

  try {
    unlockAudioContext();

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      // Fallback to HTML5 Audio if Web Audio API not available
      playFallbackSound('end', volume);
      return;
    }

    const ctx = audioContext || new AudioContextClass();
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(ctx.destination);

    // Create a pleasant completion chime (ascending notes)
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    const duration = 0.3;
    const now = ctx.currentTime;

    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const oscGain = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      
      oscGain.gain.setValueAtTime(0, now + index * 0.1);
      oscGain.gain.linearRampToValueAtTime(volume * 0.3, now + index * 0.1 + 0.05);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.1 + duration);
      
      oscillator.connect(oscGain);
      oscGain.connect(gainNode);
      oscillator.start(now + index * 0.1);
      oscillator.stop(now + index * 0.1 + duration);
    });
  } catch (error) {
    console.warn('Failed to play session end sound:', error);
    playFallbackSound('end', volume);
  }
}

/**
 * Generate countdown sound (5-second countdown beeps)
 */
function generateCountdownSound(seconds: number, volume: number = 0.4): void {
  if (typeof window === 'undefined' || seconds <= 0) return;

  try {
    unlockAudioContext();

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      playFallbackSound('countdown', volume);
      return;
    }

    const ctx = audioContext || new AudioContextClass();
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;
    const beepDuration = 0.1;
    const frequency = seconds <= 3 ? 800 : 600; // Higher pitch for final 3 seconds

    const oscillator = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    
    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(volume * 0.4, now + 0.02);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + beepDuration);
    
    oscillator.connect(oscGain);
    oscGain.connect(gainNode);
    oscillator.start(now);
    oscillator.stop(now + beepDuration);
  } catch (error) {
    console.warn('Failed to play countdown sound:', error);
    playFallbackSound('countdown', volume);
  }
}

/**
 * Generate task complete sound (short success chime)
 */
function generateTaskCompleteSound(volume: number = 0.3): void {
  if (typeof window === 'undefined') return;

  try {
    unlockAudioContext();

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      playFallbackSound('task', volume);
      return;
    }

    const ctx = audioContext || new AudioContextClass();
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(ctx.destination);

    // Short success chime (two quick notes)
    const frequencies = [659.25, 783.99]; // E5, G5
    const duration = 0.15;
    const now = ctx.currentTime;

    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const oscGain = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      
      oscGain.gain.setValueAtTime(0, now + index * 0.08);
      oscGain.gain.linearRampToValueAtTime(volume * 0.25, now + index * 0.08 + 0.03);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.08 + duration);
      
      oscillator.connect(oscGain);
      oscGain.connect(gainNode);
      oscillator.start(now + index * 0.08);
      oscillator.stop(now + index * 0.08 + duration);
    });
  } catch (error) {
    console.warn('Failed to play task complete sound:', error);
    playFallbackSound('task', volume);
  }
}

/**
 * Fallback sound using HTML5 Audio (for browsers without Web Audio API)
 */
function playFallbackSound(type: 'end' | 'countdown' | 'task', volume: number): void {
  try {
    const audio = new Audio();
    audio.volume = volume;
    
    // Generate data URI for a simple beep
    // This is a minimal fallback - Web Audio API is preferred
    const sampleRate = 22050;
    const duration = type === 'end' ? 0.5 : type === 'countdown' ? 0.1 : 0.2;
    const frequency = type === 'end' ? 800 : type === 'countdown' ? 600 : 700;
    const samples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Generate sine wave
    for (let i = 0; i < samples; i++) {
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate);
      view.setInt16(44 + i * 2, sample * 0x7FFF, true);
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    audio.src = URL.createObjectURL(blob);
    audio.play().catch(() => {
      // Silently fail if audio can't play
    });
    
    // Clean up after playing
    audio.onended = () => {
      URL.revokeObjectURL(audio.src);
    };
  } catch (error) {
    // Silently fail if fallback also fails
    console.warn('Fallback sound failed:', error);
  }
}

/**
 * Preload audio context (call on app initialization or first user interaction)
 */
export function preloadSounds(): void {
  if (typeof window === 'undefined') return;
  
  // Unlock audio on any user interaction
  const unlockOnInteraction = () => {
    unlockAudioContext();
    // Remove listeners after first unlock
    document.removeEventListener('click', unlockOnInteraction);
    document.removeEventListener('touchstart', unlockOnInteraction);
    document.removeEventListener('keydown', unlockOnInteraction);
  };
  
  document.addEventListener('click', unlockOnInteraction, { once: true });
  document.addEventListener('touchstart', unlockOnInteraction, { once: true });
  document.addEventListener('keydown', unlockOnInteraction, { once: true });
}

/**
 * Play session end sound
 */
export function playSessionEndSound(volume: number = 0.5): void {
  generateSessionEndSound(volume);
}

/**
 * Play countdown sound (for 5-second countdown)
 */
export function playCountdownSound(seconds: number, volume: number = 0.4): void {
  generateCountdownSound(seconds, volume);
}

/**
 * Play task complete sound
 */
export function playTaskCompleteSound(volume: number = 0.3): void {
  generateTaskCompleteSound(volume);
}




