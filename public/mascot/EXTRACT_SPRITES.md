# 🎨 FocusAI Mascot Sprite Extraction - Step by Step

## Based on Your Sprite Sheet Layout

Your sprite sheet shows 7-8 poses in a grid. Here's how to extract them:

### Sprite Order (Based on Image Description):

1. **Top Left** → `focusai_idle.png` (Standing, arms down, cheerful smile)
2. **Top Middle** → `focusai_wave.png` (Waving gesture, happy smile)
3. **Top Right** → `focusai_help.png` (Arms out, questioning pose, slight frown)
4. **Middle Right** → `focusai_flip.png` (Upside down/handstand)
5. **Bottom Left** → `focusai_happy.png` (Arms out, welcoming, big smile)
6. **Bottom Middle** → `focusai_idea.png` (Holding yellow lightbulb)
7. **Bottom Right** → `focusai_read.png` (Holding blue book)
8. **If 8th exists** → `focusai_neutral.png` (Neutral expression)

## Extraction Methods

### ✅ Method 1: Photopea (Free Online - Recommended)

1. Go to https://www.photopea.com/
2. File → Open → Upload your sprite sheet
3. Select "Slice Tool" from toolbar
4. Right-click → "Divide Slice" → Set to 3 columns × 3 rows (or 4×2, 2×4)
5. File → Export As → PNG-24
6. For each slice, save with the correct filename above

### ✅ Method 2: Preview (Mac)

1. Open sprite sheet in Preview
2. Tools → Rectangular Selection
3. Select first sprite (top left)
4. Edit → Copy
5. File → New from Clipboard
6. File → Export → Save as `focusai_idle.png`
7. Repeat for all 8 sprites

### ✅ Method 3: GIMP (Free Desktop App)

1. Open sprite sheet in GIMP
2. Filters → Web → Slice
3. Set grid: 3×3 or 4×2 (depending on your layout)
4. Export each slice with correct filename

### ✅ Method 4: Online Sprite Splitter

1. Go to https://ezgif.com/split
2. Upload your sprite sheet
3. Set grid dimensions
4. Download individual sprites
5. Rename them according to the list above

## After Extraction

1. Place all 8 PNG files in: `/frontend/public/mascot/`
2. Ensure exact filenames match:
   - `focusai_idle.png`
   - `focusai_wave.png`
   - `focusai_help.png`
   - `focusai_flip.png`
   - `focusai_happy.png`
   - `focusai_idea.png`
   - `focusai_read.png`
   - `focusai_neutral.png`

3. The component will automatically use them! ✨

## Verification

After extraction, you should have 8 PNG files in `/public/mascot/`. The component is already configured to use these exact filenames.

