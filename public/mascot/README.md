# FocusAI Mascot Assets

Upload the following PNG image files to this directory (`/public/mascot/`):

## Required Image Files

1. **focusai.png** - Default/idle pose
2. **focusai_wave.png** - Waving pose (used on hover)
3. **focusai_smile.png** - Big smile pose (greeting)
4. **focusai_help.png** - "How can I help?" pose
5. **focusai_flip.png** - Playful flip animation
6. **focusai_idea.png** - Idea/lightbulb pose
7. **focusai_sleep.png** - Sleepy/idle pose
8. **focusai_notebook.png** - Holding notebook pose

## File Naming Convention

Make sure the files are named exactly as listed above (lowercase, with underscores).

## Image Specifications (Recommended)

- **Format**: PNG with transparency (RGBA)
- **Resolution**: 
  - Minimum: 512x512px
  - Recommended: 1024x1024px or higher for crisp display
- **Aspect Ratio**: 1:1 (square)
- **File Size**: Optimize for web (< 500KB per image if possible)

## Usage Locations

- **Landing Page**: Uses `idle` pose (220-280px responsive width)
- **Assistant Bubble**: Uses `wave` pose (48px)
- **Assistant Chat Header**: Uses dynamic poses based on chat state (70px)

## Pose Logic

- **Default**: `idle`
- **Hover (landing page)**: `wave`
- **Chat greeting**: `smile`
- **Chat opens**: `help`
- **Inactive 10+ seconds**: `sleep`
- **Productive questions**: `idea`
- **Structured advice**: `notebook`
- **Random (20-35s)**: `flip`



