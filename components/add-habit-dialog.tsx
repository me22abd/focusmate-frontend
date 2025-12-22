'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveHabit, Habit } from '@/lib/habits-data';
import { cn } from '@/lib/utils';

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (habit: Habit) => void;
}

export function AddHabitDialog({ open, onOpenChange, onSave }: AddHabitDialogProps) {
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');

  const handleSave = () => {
    if (!name.trim()) return;

    const habit = saveHabit({
      name: name.trim(),
      frequency,
      color: frequency === 'daily' ? 'green' : 'blue',
    });

    onSave(habit);
    setName('');
    setFrequency('daily');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
          <DialogDescription>
            Track a daily or weekly habit to build consistency.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              placeholder="e.g., Morning Meditation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
          <div className="space-y-2">
            <Label>Frequency</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFrequency('daily')}
                className={cn(
                  'flex-1 rounded-lg border-2 p-3 text-center transition-all',
                  frequency === 'daily'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-100'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                )}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setFrequency('weekly')}
                className={cn(
                  'flex-1 rounded-lg border-2 p-3 text-center transition-all',
                  frequency === 'weekly'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-100'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                )}
              >
                Weekly
              </button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Add Habit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

