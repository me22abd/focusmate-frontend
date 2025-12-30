/**
 * Node.js script to extract sprites from sprite sheet
 * Requires: npm install sharp
 * 
 * Usage: node extract_with_node.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function extractSprites() {
  const spriteSheetPath = path.join(__dirname, 'focusai_spritesheet.png');
  
  if (!fs.existsSync(spriteSheetPath)) {
    console.error('❌ Sprite sheet not found!');
    return;
  }

  // Get image metadata
  const metadata = await sharp(spriteSheetPath).metadata();
  console.log(`📐 Image size: ${metadata.width}x${metadata.height}`);

  // Try different grid layouts
  const layouts = [
    { name: '3x3', cols: 3, rows: 3 },
    { name: '4x2', cols: 4, rows: 2 },
    { name: '2x4', cols: 2, rows: 4 },
  ];

  // Pose names in order (adjust based on your sprite sheet)
  const poseNames = [
    'focusai_idle',
    'focusai_wave',
    'focusai_help',
    'focusai_flip',
    'focusai_happy',
    'focusai_idea',
    'focusai_read',
    'focusai_neutral',
  ];

  // Try 3x3 layout first (most common for 8 sprites with 1 empty)
  const layout = layouts[0];
  const spriteWidth = Math.floor(metadata.width / layout.cols);
  const spriteHeight = Math.floor(metadata.height / layout.rows);

  console.log(`\n📦 Extracting with ${layout.name} layout`);
  console.log(`   Sprite size: ${spriteWidth}x${spriteHeight}\n`);

  let poseIndex = 0;
  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      // Skip empty cells in 3x3 grid (if applicable)
      if (layout.name === '3x3' && ((row === 1 && col < 2) || poseIndex >= poseNames.length)) {
        continue;
      }

      if (poseIndex >= poseNames.length) break;

      const x = col * spriteWidth;
      const y = row * spriteHeight;
      const poseName = poseNames[poseIndex];

      try {
        await sharp(spriteSheetPath)
          .extract({
            left: x,
            top: y,
            width: spriteWidth,
            height: spriteHeight,
          })
          .toFile(path.join(__dirname, `${poseName}.png`));

        console.log(`✅ Extracted ${poseName}.png from position (${x}, ${y})`);
        poseIndex++;
      } catch (error) {
        console.error(`❌ Failed to extract ${poseName}:`, error.message);
      }
    }
    if (poseIndex >= poseNames.length) break;
  }

  console.log(`\n🎉 Extraction complete! ${poseIndex} sprites extracted.`);
}

extractSprites().catch(console.error);

