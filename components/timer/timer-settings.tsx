/**
 * ============================================================================
 * TIMER-SETTINGS.TSX - POMODORO SETTINGS MODAL
 * ============================================================================
 * 
 * 📘 CODE ORIGIN: Dialog pattern from ShadCN UI library.
 * Custom implementation: Pomodoro-specific settings (durations, cycles).
 * 
 * @author Marvelous Eromonsele
 * ============================================================================
 */

'use client';

import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface TimerSettingsProps {
  mode: 'classic' | 'custom';
  settings: {
    focusDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    cyclesBeforeLongBreak: number;
  };
  onModeChange: (mode: 'classic' | 'custom') => void;
  onSettingsChange: (settings: any) => void;
}

export function TimerSettings({
  mode,
  settings,
  onModeChange,
  onSettingsChange,
}: TimerSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSettingsChange(localSettings);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pomodoro Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mode Selector */}
          <div className="space-y-2">
            <Label>Timer Mode</Label>
            <div className="flex gap-2">
              <Button
                variant={mode === 'classic' ? 'default' : 'outline'}
                onClick={() => onModeChange('classic')}
                className="flex-1"
              >
                Classic (25/5/15)
              </Button>
              <Button
                variant={mode === 'custom' ? 'default' : 'outline'}
                onClick={() => onModeChange('custom')}
                className="flex-1"
              >
                Custom
              </Button>
            </div>
          </div>

          {/* Custom Settings (only show in custom mode) */}
          {mode === 'custom' && (
            <>
              <div className="space-y-2">
                <Label>Focus Duration (minutes)</Label>
                <Input
                  type="number"
                  min="1"
                  max="90"
                  value={localSettings.focusDuration}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, focusDuration: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Short Break (minutes)</Label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={localSettings.shortBreakDuration}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, shortBreakDuration: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Long Break (minutes)</Label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={localSettings.longBreakDuration}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, longBreakDuration: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Cycles Before Long Break</Label>
                <Input
                  type="number"
                  min="2"
                  max="8"
                  value={localSettings.cyclesBeforeLongBreak}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, cyclesBeforeLongBreak: parseInt(e.target.value) })
                  }
                />
              </div>

              <Button onClick={handleSave} className="w-full">
                Apply Settings
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
















