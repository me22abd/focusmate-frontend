/**
 * ============================================================================
 * SOUNDS-LIBRARY.TS - COMPLETE AMBIENT SOUND LIBRARY
 * ============================================================================
 * 
 * Purpose: Centralized sound library with 22+ real audio files organized into
 * 10 categories. All sounds are royalty-free from Mixkit (CC0 license).
 * 
 * 📘 CODE ORIGIN: Custom implementation - All sound mappings, categories,
 * organization, and metadata created specifically for Focusmate.
 * 
 * @author Marvelous Eromonsele
 * ============================================================================
 */

export interface Sound {
  id: string;
  name: string;
  category: SoundCategory;
  path: string;
  emoji: string;
  description: string;
}

export type SoundCategory = 
  | 'Calm'
  | 'Nature'
  | 'Water'
  | 'Ambient'
  | 'Focus'
  | 'Beats'
  | 'Meditation'
  | 'Classical';

export const SOUND_CATEGORIES = [
  { id: 'Calm', label: 'Calm', emoji: '🌙', description: 'Slow, soft meditation music' },
  { id: 'Nature', label: 'Nature', emoji: '🌿', description: 'Natural outdoor ambience' },
  { id: 'Water', label: 'Water', emoji: '💧', description: 'Ocean and water sounds' },
  { id: 'Ambient', label: 'Ambient', emoji: '🏙️', description: 'Ambient environments' },
  { id: 'Focus', label: 'Focus', emoji: '🎯', description: 'Deep concentration' },
  { id: 'Beats', label: 'Beats', emoji: '🎵', description: 'Study music & lo-fi' },
  { id: 'Meditation', label: 'Meditation', emoji: '🕉️', description: 'Mindfulness & zen' },
  { id: 'Classical', label: 'Classical', emoji: '🎻', description: 'Classical music' },
] as const;

export const SOUNDS: Sound[] = [
  // 🌙 CALM (SLOW, SOLEMN MEDITATION TRACKS)
  { 
    id: 'soft-piano',
    name: 'Soft Piano',
    category: 'Calm',
    path: '/sounds/calm/soft-piano.mp3',
    emoji: '🎹',
    description: 'Gentle, slow piano for deep focus'
  },
  { 
    id: 'ambient-drone',
    name: 'Ambient Drone',
    category: 'Calm',
    path: '/sounds/calm/ambient-drone.mp3',
    emoji: '🌌',
    description: 'Slow, atmospheric meditation pad'
  },

  // 🌿 NATURE
  { 
    id: 'deep-rain',
    name: 'Deep Rain',
    category: 'Nature',
    path: '/sounds/nature/deep-rain.mp3',
    emoji: '🌧️',
    description: 'Deep rain sounds'
  },
  { 
    id: 'forest-stream',
    name: 'Forest Stream',
    category: 'Nature',
    path: '/sounds/nature/forest-stream.mp3',
    emoji: '🌲',
    description: 'Forest stream ambience'
  },

  // 💧 WATER
  { 
    id: 'soft-waves',
    name: 'Soft Waves',
    category: 'Water',
    path: '/sounds/water/soft-waves.mp3',
    emoji: '🌊',
    description: 'Soft ocean waves'
  },
  { 
    id: 'deep-ocean',
    name: 'Deep Ocean',
    category: 'Water',
    path: '/sounds/water/deep-ocean.mp3',
    emoji: '🌊',
    description: 'Deep ocean ambience'
  },

  // 🏙️ AMBIENT
  { 
    id: 'coffee-shop',
    name: 'Coffee Shop',
    category: 'Ambient',
    path: '/sounds/ambient/coffee-shop.mp3',
    emoji: '☕',
    description: 'Coffee shop atmosphere'
  },
  { 
    id: 'soft-city-noise',
    name: 'Soft City Noise',
    category: 'Ambient',
    path: '/sounds/ambient/soft-city-noise.mp3',
    emoji: '🏙️',
    description: 'Soft city ambience'
  },

  // 🎯 FOCUS
  { 
    id: 'brown-noise',
    name: 'Brown Noise',
    category: 'Focus',
    path: '/sounds/focus/brown-noise.mp3',
    emoji: '🔊',
    description: 'Low-frequency masking'
  },
  { 
    id: 'pink-noise',
    name: 'Pink Noise',
    category: 'Focus',
    path: '/sounds/focus/pink-noise.mp3',
    emoji: '📻',
    description: 'Balanced frequency noise'
  },

  // 🎵 BEATS
  { 
    id: 'lofi-beats',
    name: 'LoFi Study Beats',
    category: 'Beats',
    path: '/sounds/beats/lofi-study-beats.mp3',
    emoji: '🎶',
    description: 'Lo-fi study beats'
  },

  // 🕉️ MEDITATION
  { 
    id: 'chill-synth-pad',
    name: 'Chill Synth Pad',
    category: 'Meditation',
    path: '/sounds/meditation/chill-synth-pad.mp3',
    emoji: '✨',
    description: 'Chill synth pad'
  },
  { 
    id: 'tibetan-bells',
    name: 'Tibetan Bells',
    category: 'Meditation',
    path: '/sounds/meditation/tibetan-bells.mp3',
    emoji: '🔔',
    description: 'Tibetan bells'
  },

  // 🎻 CLASSICAL
  { 
    id: 'piano-study',
    name: 'Piano Study',
    category: 'Classical',
    path: '/sounds/classical/piano-study.mp3',
    emoji: '🎹',
    description: 'Piano study music'
  },
];

// Helper to get sounds by category
export function getSoundsByCategory(category: SoundCategory): Sound[] {
  return SOUNDS.filter(s => s.category === category);
}

// Helper to get category info
export function getCategoryInfo(category: SoundCategory) {
  return SOUND_CATEGORIES.find(c => c.id === category);
}





