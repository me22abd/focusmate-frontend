# FocusAI Mascot Sprite Extraction Instructions

The sprite sheet (`focusai_spritesheet.png`) contains 8 poses in a grid layout.

## Option 1: Manual Extraction (Recommended)

1. Open `focusai_spritesheet.png` in an image editor (Photoshop, GIMP, Preview, etc.)
2. Based on the grid layout, extract each pose as a separate PNG file
3. Save them with these exact names:
   - `focusai_idle.png`
   - `focusai_wave.png`
   - `focusai_help.png`
   - `focusai_flip.png`
   - `focusai_happy.png`
   - `focusai_idea.png`
   - `focusai_read.png`
   - `focusai_neutral.png`

## Option 2: Using Online Tools

1. Go to https://ezgif.com/split or similar sprite sheet splitter
2. Upload `focusai_spritesheet.png`
3. Set the grid dimensions (likely 3x3 or 4x2)
4. Extract individual sprites
5. Rename them according to the list above

## Option 3: Python Script (Requires Pillow)

If you have Python and Pillow installed:

```bash
cd frontend/public/mascot
pip install Pillow
python3 extract_sprites.py
```

Note: You may need to adjust the grid dimensions in the script based on the actual sprite sheet layout.

## Sprite Sheet Layout

Based on the description, the poses appear in this order:
- Top row: idle, wave, help, (empty or flip)
- Bottom row: happy, idea, read, neutral

The exact grid layout may vary - check the sprite sheet to determine if it's:
- 3 columns × 3 rows (8 sprites, 1 empty)
- 4 columns × 2 rows (8 sprites)
- Or another arrangement

Once extracted, place all 8 PNG files in `/public/mascot/` and the component will automatically use them!



