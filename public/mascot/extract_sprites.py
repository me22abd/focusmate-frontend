#!/usr/bin/env python3
"""
Extract individual poses from FocusAI sprite sheet
The sprite sheet appears to be a grid layout with 8 poses
"""

from PIL import Image
import os

# Open the sprite sheet
spritesheet_path = 'focusai_spritesheet.png'
img = Image.open(spritesheet_path)

# Get sprite sheet dimensions
sheet_width, sheet_height = img.size

# Based on the description, it's a 3x3 grid (with 8 poses, one empty space)
# Or it could be 2 rows x 4 columns, or 4x2
# Let's try to detect the grid layout automatically

# Common grid layouts for 8 sprites:
# Option 1: 3 columns x 3 rows (8 sprites, one empty)
# Option 2: 4 columns x 2 rows
# Option 3: 2 columns x 4 rows

# Based on typical sprite sheets, let's assume 3x3 grid
# Each sprite would be: sheet_width/3 x sheet_height/3

sprite_width = sheet_width // 3
sprite_height = sheet_height // 3

# Define the order of poses based on the description:
# Top row: idle, wave, help
# Middle row: (empty?), flip, (empty?)
# Bottom row: happy/smile, idea, read/notebook

# Actually, let's try 4 columns x 2 rows instead
sprite_width = sheet_width // 4
sprite_height = sheet_height // 2

# Pose names in order (left to right, top to bottom)
poses = [
    'focusai_idle',      # Top row, left
    'focusai_wave',      # Top row, 2nd
    'focusai_help',      # Top row, 3rd
    'focusai_flip',      # Top row, 4th (or could be in different position)
    'focusai_happy',     # Bottom row, left
    'focusai_idea',      # Bottom row, 2nd
    'focusai_read',      # Bottom row, 3rd
    'focusai_neutral',   # Bottom row, 4th (or could be in different position)
]

print(f"Sprite sheet size: {sheet_width}x{sheet_height}")
print(f"Individual sprite size: {sprite_width}x{sprite_height}")

# Extract each sprite
for idx, pose_name in enumerate(poses):
    row = idx // 4  # 4 columns
    col = idx % 4   # 4 columns
    
    x = col * sprite_width
    y = row * sprite_height
    
    # Crop the sprite
    sprite = img.crop((x, y, x + sprite_width, y + sprite_height))
    
    # Save as PNG
    output_path = f"{pose_name}.png"
    sprite.save(output_path, 'PNG')
    print(f"Extracted {output_path} from position ({x}, {y})")

print("\n✅ All sprites extracted!")
print("If the layout looks wrong, try adjusting the grid dimensions in the script.")



