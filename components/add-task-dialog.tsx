'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveTask, Task, TaskPriority, TASK_CATEGORIES, suggestCategory } from '@/lib/tasks-data';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: Task) => void;
}

export function AddTaskDialog({ open, onOpenChange, onSave }: AddTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Update category suggestions when title changes
  useEffect(() => {
    if (title.trim() && !category) {
      const suggestions = suggestCategory(title);
      if (suggestions.length > 0) {
        setCategory(suggestions[0]);
        setCategoryInput(suggestions[0]);
      }
    }
  }, [title, category]);

  // Filter categories based on input
  useEffect(() => {
    const input = categoryInput.toLowerCase().trim();
    if (!input) {
      setFilteredCategories(TASK_CATEGORIES.slice(0, 20));
      return;
    }

    const filtered = TASK_CATEGORIES.filter((cat) =>
      cat.toLowerCase().includes(input)
    );
    setFilteredCategories(filtered.slice(0, 20));
  }, [categoryInput]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node) &&
        !categoryInputRef.current?.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setCategoryInput(selectedCategory);
    setShowCategoryDropdown(false);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    if (!category.trim()) {
      setCategory('Personal'); // Default
    }

    const task = saveTask({
      title: title.trim(),
      category: category.trim() || 'Personal',
      scheduledDate,
      scheduledTime: scheduledTime || undefined,
      priority,
    });

    onSave(task);
    
    // Reset form
    setTitle('');
    setCategory('');
    setCategoryInput('');
    setScheduledDate(new Date().toISOString().split('T')[0]);
    setScheduledTime('');
    setPriority('medium');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Create a task with date, time, and category.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="e.g., Review quarterly reports"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>

          {/* Category with AI Suggestions */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  ref={categoryInputRef}
                  id="category"
                  placeholder="Type or select category..."
                  value={categoryInput}
                  onChange={(e) => {
                    setCategoryInput(e.target.value);
                    setCategory(e.target.value);
                    setShowCategoryDropdown(true);
                  }}
                  onFocus={() => setShowCategoryDropdown(true)}
                  className="pl-10"
                />
              </div>
              {showCategoryDropdown && filteredCategories.length > 0 && (
                <div
                  ref={categoryDropdownRef}
                  className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
                >
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      {cat}
                    </button>
                  ))}
                  {TASK_CATEGORIES.length > 20 && (
                    <div className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400 text-center border-t border-slate-200 dark:border-slate-700">
                      +{TASK_CATEGORIES.length - 20} more categories available
                    </div>
                  )}
                </div>
              )}
            </div>
            {title.trim() && !category && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                💡 AI suggestion: {suggestCategory(title)[0]}
              </p>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time (Optional)</Label>
              <Input
                id="time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="flex gap-3">
              {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    'flex-1 rounded-lg border-2 p-3 text-center transition-all capitalize',
                    priority === p
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-100'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Add Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

















