/**
 * Script to remove white backgrounds from mascot PNG files
 * Makes white pixels transparent so mascot blends with app background
 * 
 * Usage: node remove-white-background.js
 * Requirements: npm install sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const MASCOT_DIR = __dirname;
const OUTPUT_DIR = path.join(MASCOT_DIR, 'processed');

// List of mascot files to process
const mascotFiles = [
  'focusai_idle.png',
  'focusai_wave.png',
  'focusai_help.png',
  'focusai_flip.png',
  'focusai_happy.png',
  'focusai_idea.png',
  'focusai_read.png',
  'focusai_neutral.png',
];

/**
 * Remove white background from an image
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path to save output image
 */
async function removeWhiteBackground(inputPath, outputPath) {
  try {
    console.log(`Processing: ${path.basename(inputPath)}...`);
    
    // Read the image
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Get image data
    const { data, info } = await image
      .ensureAlpha() // Ensure alpha channel exists
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Process pixels: make white/light pixels transparent
    const threshold = 240; // Pixels with RGB > 240 are considered "white"
    const newData = Buffer.from(data);
    
    for (let i = 0; i < newData.length; i += info.channels) {
      const r = newData[i];
      const g = newData[i + 1];
      const b = newData[i + 2];
      const alpha = info.channels === 4 ? newData[i + 3] : 255;
      
      // Check if pixel is white/light
      const isWhite = r > threshold && g > threshold && b > threshold;
      
      if (isWhite) {
        // Make white pixels fully transparent
        if (info.channels === 4) {
          newData[i + 3] = 0; // Set alpha to 0 (transparent)
        } else {
          // If no alpha channel, we need to add one
          // This shouldn't happen with ensureAlpha(), but just in case
          newData[i + 3] = 0;
        }
      } else {
        // For non-white pixels, keep original alpha or make fully opaque
        if (info.channels === 4) {
          // Keep existing alpha, but ensure it's not too low
          newData[i + 3] = Math.max(alpha, 255);
        }
      }
    }
    
    // Save the processed image
    await sharp(newData, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4, // RGBA
      },
    })
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Saved: ${path.basename(outputPath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${inputPath}:`, error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🎨 Removing white backgrounds from mascot images...\n');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created output directory: ${OUTPUT_DIR}\n`);
  }
  
  let successCount = 0;
  let failCount = 0;
  
  // Process each mascot file
  for (const filename of mascotFiles) {
    const inputPath = path.join(MASCOT_DIR, filename);
    const outputPath = path.join(OUTPUT_DIR, filename);
    
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  Skipping: ${filename} (file not found)`);
      failCount++;
      continue;
    }
    
    // Process the image
    const success = await removeWhiteBackground(inputPath, outputPath);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Successfully processed: ${successCount} files`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount} files`);
  }
  console.log('\n📁 Processed files are in:', OUTPUT_DIR);
  console.log('\n💡 Next steps:');
  console.log('   1. Review the processed images in the "processed" folder');
  console.log('   2. If they look good, replace the original files:');
  console.log('      cp processed/*.png .');
  console.log('   3. Or manually copy the files you want to keep');
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


