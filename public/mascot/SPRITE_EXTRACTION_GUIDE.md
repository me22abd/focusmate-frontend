# FocusAI Mascot Sprite Extraction Guide

## Quick Extraction Methods

### Method 1: Online Sprite Splitter (Easiest)

1. Go to https://www.photopea.com/ (free online Photoshop alternative)
2. Open your sprite sheet image
3. Use the "Slice Tool" to divide the image into a grid
4. Export each slice as a separate PNG file
5. Name them according to the mapping below

### Method 2: Using Preview (Mac)

1. Open the sprite sheet in Preview
2. Use Tools → Rectangular Selection
3. Select each sprite one by one
4. Copy (Cmd+C) and paste into a new window
5. Save each as the appropriate filename

### Method 3: Using GIMP (Free)

1. Open sprite sheet in GIMP
2. Use Filters → Web → Slice
3. Set grid dimensions (likely 3x3 or 4x2)
4. Export each slice

## Sprite Mapping (Based on Image Description)

Based on the sprite sheet layout, extract in this order:

**If 3x3 Grid (9 cells, 1 empty):**
- Row 1, Col 1: `focusai_idle.png` (Top Left - standing, arms down, smile)
- Row 1, Col 2: `focusai_wave.png` (Top Middle - waving)
- Row 1, Col 3: `focusai_help.png` (Top Right - arms out, questioning)
- Row 2, Col 1: (empty or skip)
- Row 2, Col 2: (empty or skip)
- Row 2, Col 3: `focusai_flip.png` (Middle Right - upside down/handstand)
- Row 3, Col 1: `focusai_happy.png` (Bottom Left - arms out, welcoming)
- Row 3, Col 2: `focusai_idea.png` (Bottom Middle - holding lightbulb)
- Row 3, Col 3: `focusai_read.png` (Bottom Right - holding book)

**If 4x2 Grid (8 cells):**
- Row 1: idle, wave, help, flip
- Row 2: happy, idea, read, neutral

**If 2x4 Grid (8 cells):**
- Col 1: idle, wave, help, flip
- Col 2: happy, idea, read, neutral

## File Naming

Save all files in `/frontend/public/mascot/` with these exact names:
- `focusai_idle.png`
- `focusai_wave.png`
- `focusai_help.png`
- `focusai_flip.png`
- `focusai_happy.png`
- `focusai_idea.png`
- `focusai_read.png`
- `focusai_neutral.png` (if you have 8 poses, use the 8th one here)

## After Extraction

Once all 8 PNG files are in `/frontend/public/mascot/`, the component will automatically use them!

