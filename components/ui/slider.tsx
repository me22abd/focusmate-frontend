/**
 * Simple custom slider component for volume control
 * Built without external dependencies
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ value, onValueChange, max = 100, step = 1, disabled = false, className }, ref) => {
    const sliderValue = value[0] || 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange([parseInt(e.target.value)]);
    };

    return (
      <div ref={ref} className={cn('relative flex items-center w-full', className)}>
        <input
          type="range"
          min="0"
          max={max}
          step={step}
          value={sliderValue}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            'w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:w-4',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-white',
            '[&::-webkit-slider-thumb]:border-2',
            '[&::-webkit-slider-thumb]:border-indigo-600',
            '[&::-webkit-slider-thumb]:shadow',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-moz-range-thumb]:h-4',
            '[&::-moz-range-thumb]:w-4',
            '[&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:bg-white',
            '[&::-moz-range-thumb]:border-2',
            '[&::-moz-range-thumb]:border-indigo-600',
            '[&::-moz-range-thumb]:shadow',
            '[&::-moz-range-thumb]:cursor-pointer'
          )}
          style={{
            background: `linear-gradient(to right, rgb(79, 70, 229) 0%, rgb(79, 70, 229) ${sliderValue}%, rgb(226, 232, 240) ${sliderValue}%, rgb(226, 232, 240) 100%)`
          }}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };

