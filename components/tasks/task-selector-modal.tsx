/**
 * ============================================================================
 * TASK-SELECTOR-MODAL.TSX - TASK SELECTION FOR SESSION SETUP
 * ============================================================================
 * 
 * 📘 CODE ORIGIN: Custom modal for selecting/creating tasks during session setup.
 * Framework: ShadCN Dialog component. Custom: Task list, create inline.
 * 
 * @author Marvelous Eromonsele
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Circle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getTasks, createTask, type Task } from '@/lib/api/tasks';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TaskSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (task: Task) => void;
}

export function TaskSelectorModal({ open, onClose, onSelect }: TaskSelectorModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadTasks();
    }
  }, [open]);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data.filter(t => !t.completed)); // Show only pending tasks
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const handleCreate = async () => {
    if (!newTaskTitle.trim()) return;
    
    setLoading(true);
    try {
      const newTask = await createTask({
        title: newTaskTitle,
        priority: 'medium',
        progress: 0,
      });
      
      setTasks([newTask, ...tasks]);
      setNewTaskTitle('');
      setShowCreate(false);
      toast.success('Task created!');
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (task: Task) => {
    onSelect(task);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select a Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create New Task */}
          {showCreate ? (
            <div className="flex gap-2">
              <Input
                placeholder="Enter task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
              <Button onClick={handleCreate} disabled={loading}>
                Add
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Task
            </Button>
          )}

          {/* Task List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {tasks.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-8">
                No pending tasks. Create one above!
              </p>
            ) : (
              tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleSelect(task)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border-2 transition-all hover:border-indigo-500',
                    'border-slate-200 dark:border-slate-700'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        {task.title}
                      </p>
                      {task.dueDate && (
                        <p className="text-xs text-slate-500 mt-1">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}















