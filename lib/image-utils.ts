/**
 * Image compression and resizing utilities
 */

export interface ImageResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  maxSizeKB?: number; // Target max file size in KB
}

/**
 * Resize and compress an image file
 * Returns a Promise that resolves to a base64 data URL
 */
export function resizeAndCompressImage(
  file: File,
  options: ImageResizeOptions = {}
): Promise<string> {
  const {
    maxWidth = 256,
    maxHeight = 256,
    quality = 0.65,
    maxSizeKB = 50, // Very small default to avoid backend request entity limits
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // For avatars, always create a square (center-cropped)
        const size = Math.min(maxWidth, maxHeight);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Improve image quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Calculate center crop
        const sourceSize = Math.min(img.width, img.height);
        const sourceX = (img.width - sourceSize) / 2;
        const sourceY = (img.height - sourceSize) / 2;
        
        // Draw center-cropped square image
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceSize, sourceSize, // Source: center square
          0, 0, size, size // Destination: full canvas
        );
        
        // Compress to target size with aggressive iterative quality reduction
        let currentQuality = quality;
        let dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
        let sizeKB = (dataUrl.length * 3) / 4 / 1024;
        
        // If still too large, aggressively reduce quality
        let attempts = 0;
        const maxAttempts = 15; // More attempts
        while (sizeKB > maxSizeKB && attempts < maxAttempts && currentQuality > 0.1) {
          // More aggressive reduction
          currentQuality = Math.max(0.1, currentQuality * 0.8);
          dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
          sizeKB = (dataUrl.length * 3) / 4 / 1024;
          attempts++;
        }
        
        // If still too large after quality reduction, reduce dimensions
        if (sizeKB > maxSizeKB && size > 200) {
          const reductionFactor = Math.sqrt(maxSizeKB / sizeKB) * 0.9;
          const newSize = Math.max(200, Math.round(size * reductionFactor));
          
          canvas.width = newSize;
          canvas.height = newSize;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(
            img,
            sourceX, sourceY, sourceSize, sourceSize,
            0, 0, newSize, newSize
          );
          
          currentQuality = 0.7;
          dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
        }
        
        resolve(dataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please upload an image file (JPG, PNG, GIF, etc.)' };
  }
  
  // Check file size (allow up to 50MB before compression - we'll compress it down)
  const maxSizeMB = 50;
  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      valid: false,
      error: `Image size must be less than ${maxSizeMB}MB. We'll compress it automatically.`,
    };
  }
  
  return { valid: true };
}

