/**
 * ============================================================================
 * SOUND-PANEL.TSX - AMBIENT SOUND SELECTOR PANEL
 * ============================================================================
 * 
 * Purpose: Complete ambient sound selection UI with categorized sounds,
 * volume control, mute toggle, and visual feedback for active sound.
 * 
 * ============================================================================
 * 📘 CODE ORIGIN (REQUIRED FOR ACADEMIC HONESTY)
 * ============================================================================
 * 
 * FRAMEWORK CODE:
 * - React component structure
 * - Slider component (ShadCN UI)
 * 
 * ADAPTED PATTERNS:
 * - Grid layout for sound cards (common in music apps)
 * - Volume slider pattern (standard audio player UI)
 * 
 * MY CUSTOM CODE:
 * - Sound emoji mapping (30 sounds with visual identifiers)
 * - Category-based organization
 * - Active sound highlighting
 * - Playing indicator integration
 * - Volume + mute control layout
 * - Responsive grid design
 * 
 * @author Marvelous Eromonsele
 * ============================================================================
 */

"use client";

import * as React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { SoundCard } from "./sound-card";
import { SOUNDS, SOUND_CATEGORIES, getSoundsByCategory } from "@/lib/sounds-library";
import { cn } from "@/lib/utils";

interface SoundPanelProps {
  currentSound: string | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  onSoundSelect: (soundId: string) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export function SoundPanel({
  currentSound,
  isPlaying,
  volume,
  isMuted,
  onSoundSelect,
  onVolumeChange,
  onToggleMute,
}: SoundPanelProps) {
  const [activeCategory, setActiveCategory] = React.useState("Nature");

  const categorySounds = getSoundsByCategory(activeCategory as any);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-left">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            🎧 Ambient Sounds
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Layer calming background audio underneath your session.
          </p>
        </div>

        {/* Currently Playing Badge */}
        <div className="flex items-center justify-start sm:justify-end">
          {currentSound && (
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {isPlaying ? "Now playing" : "Paused"}
              </span>
              <span className="text-xs font-medium text-slate-800 dark:text-slate-100">
                {SOUNDS.find((s) => s.id === currentSound)?.emoji}{" "}
                {SOUNDS.find((s) => s.id === currentSound)?.name}
              </span>
            </div>
          )}
          {!currentSound && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              No sound selected
            </span>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {SOUND_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1",
              activeCategory === cat.id
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg scale-105"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Category Description */}
      <div className="text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {SOUND_CATEGORIES.find((c) => c.id === activeCategory)?.description}
        </p>
      </div>

      {/* Sound Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {categorySounds.map((sound) => (
          <SoundCard
            key={sound.id}
            id={sound.id}
            name={sound.name}
            emoji={sound.emoji}
            isActive={currentSound === sound.id}
            isPlaying={isPlaying && currentSound === sound.id}
            onClick={() => onSoundSelect(sound.id)}
            onToggle={() => {
              if (currentSound === sound.id && isPlaying) {
                onSoundSelect('STOP');
              } else {
                onSoundSelect(sound.id);
              }
            }}
          />
        ))}
      </div>

      {/* Volume Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Volume
          </label>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {isMuted ? 'Muted' : `${volume}%`}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Mute Button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onToggleMute}
            className="shrink-0"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>

          {/* Volume Slider */}
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={(values) => onVolumeChange(values[0])}
            max={100}
            step={1}
            className="flex-1"
            disabled={isMuted}
          />
        </div>
      </div>

      {/* Currently Playing */}
      {currentSound && (
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isPlaying ? '🎵 Now playing: ' : '⏸️ Paused: '}
            <span className="font-medium">
              {SOUNDS.find(s => s.id === currentSound)?.name}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

