'use client';

import { useState, useRef, useEffect } from 'react';
import { X, RotateCw, ZoomIn, ZoomOut, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageCropperProps {
  imageSrc: string;
  onCrop: (croppedImage: string) => void;
  onCancel: () => void;
  aspectRatio?: number; // 1 for square, undefined for free
}

export function ImageCropper({ imageSrc, onCrop, onCancel, aspectRatio = 1 }: ImageCropperProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      setImageLoaded(true);
      // Center the image initially
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        setPosition({
          x: (containerWidth - img.width) / 2,
          y: (containerHeight - img.height) / 2,
        });
      }
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleCrop = () => {
    if (!imageRef.current || !containerRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cropSize = 512; // High resolution for avatar
    canvas.width = cropSize;
    canvas.height = cropSize;

    const containerRect = containerRef.current.getBoundingClientRect();
    const cropCenterX = containerRect.width / 2;
    const cropCenterY = containerRect.height / 2;
    const cropRadius = 256; // Half of crop size

    const img = imageRef.current;
    
    // Create a temporary canvas to handle rotation and scaling
    const tempCanvas = document.createElement('canvas');
    const imgNaturalWidth = img.naturalWidth || img.width;
    const imgNaturalHeight = img.naturalHeight || img.height;
    const scaledWidth = imgNaturalWidth * scale;
    const scaledHeight = imgNaturalHeight * scale;
    
    tempCanvas.width = Math.max(scaledWidth, cropSize * 2);
    tempCanvas.height = Math.max(scaledHeight, cropSize * 2);
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Draw rotated and scaled image to temp canvas
    tempCtx.save();
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempCtx.rotate((rotation * Math.PI) / 180);
    tempCtx.drawImage(
      img,
      -scaledWidth / 2 + (tempCanvas.width / 2 - position.x - cropCenterX) / scale,
      -scaledHeight / 2 + (tempCanvas.height / 2 - position.y - cropCenterY) / scale,
      scaledWidth,
      scaledHeight
    );
    tempCtx.restore();

    // Draw circular crop from center of temp canvas
    ctx.save();
    ctx.beginPath();
    ctx.arc(cropRadius, cropRadius, cropRadius, 0, Math.PI * 2);
    ctx.clip();
    
    const sourceX = (tempCanvas.width - cropSize) / 2;
    const sourceY = (tempCanvas.height - cropSize) / 2;
    
    ctx.drawImage(
      tempCanvas,
      sourceX,
      sourceY,
      cropSize,
      cropSize,
      0,
      0,
      cropSize,
      cropSize
    );
    ctx.restore();

    // Get cropped image as data URL
    const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
    onCrop(croppedImage);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-2xl mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold">Adjust Your Avatar</h3>
            <button
              onClick={onCancel}
              className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Image Container */}
          <div
            ref={containerRef}
            className="relative w-full h-96 bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {imageLoaded && (
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                className="absolute select-none"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                }}
                draggable={false}
              />
            )}
            
            {/* Crop Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 rounded-full border-4 border-white dark:border-slate-700 shadow-2xl" />
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={scale <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[60px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={scale >= 3}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRotate}
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Rotate
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCrop}
                className="flex-1 bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 text-white hover:opacity-90"
              >
                <Check className="h-4 w-4 mr-2" />
                Apply
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

