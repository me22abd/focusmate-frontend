'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { saveGoal, Goal } from '@/lib/goals-data';

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (goal: Goal) => void;
}

const GOAL_CATEGORIES = ['Fitness', 'Study', 'Career', 'Health', 'Personal', 'Other'];

export function AddGoalDialog({ open, onOpenChange, onSave }: AddGoalDialogProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Study');
  const [description, setDescription] = useState('');
  const [currentMilestone, setCurrentMilestone] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;

    const goal = saveGoal({
      name: name.trim(),
      category,
      description: description.trim() || undefined,
      currentMilestone: currentMilestone.trim() || undefined,
    });

    onSave(goal);
    setName('');
    setCategory('Study');
    setDescription('');
    setCurrentMilestone('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Goal</DialogTitle>
          <DialogDescription>
            Set a goal to track your progress and milestones.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input
              id="name"
              placeholder="e.g., Complete Marathon Training"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
            >
              {GOAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="milestone">Current Milestone (Optional)</Label>
            <Input
              id="milestone"
              placeholder="e.g., Training for full marathon"
              value={currentMilestone}
              onChange={(e) => setCurrentMilestone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add more details about your goal..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Add Goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
















