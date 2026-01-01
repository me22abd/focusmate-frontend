/**
 * ============================================================================
 * COMPONENTS/SESSIONS/TASKS-PANEL.TSX - TASKS PANEL WITH AUTOMATION
 * ============================================================================
 * 
 * Purpose: Automated task management panel with auto-complete, overdue detection,
 * and progress tracking. Tasks update automatically based on time rules.
 * 
 * 📘 CODE ORIGIN: Custom task panel with automation logic.
 * Framework: React hooks, Framer Motion. Custom: Automation rules, status colors.
 * 
 * @author Marvelous Eromonsele
 * ============================================================================
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle2,
  Circle,
  Clock,
  Flag,
  Plus,
  Calendar,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getTasks, createTask, updateTask, deleteTask, getTaskStats, toggleTaskComplete, type Task, type TaskStats } from '@/lib/api/tasks';
import { getModules, type Module } from '@/lib/api/modules';
import { playTaskCompleteSound } from '@/lib/sounds';
import { useSettingsStore } from '@/store/settings-store';
import { optimizeTasks, type TaskOptimizationResponse } from '@/lib/api/ai';
import { Sparkles, Loader2 } from 'lucide-react';

export function TasksPanel() {
  const { user } = useAuthStore();
  const { notifications } = useSettingsStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({ total: 0, completed: 0, pending: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedFields, setOptimizedFields] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    moduleId: '',
    autoComplete: false,
  });

  // Fetch modules for dropdown
  useEffect(() => {
    if (!user?.id) return;

    const fetchModules = async () => {
      try {
        const moduleList = await getModules();
        setModules(moduleList);
      } catch (error) {
        console.error('Failed to fetch modules:', error);
      }
    };

    fetchModules();
  }, [user?.id]);

  // Auto-update tasks every 60 seconds
  useEffect(() => {
    if (!user?.id) return;

    const fetchTasks = async () => {
      try {
        const taskList = await getTasks();
        setTasks(taskList);
        
        const taskStats = await getTaskStats();
        setStats({
          ...taskStats,
          autoCompletedToday: taskStats.autoCompletedToday ?? 0,
          completionRate: taskStats.completionRate ?? 0,
        });
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
    
    // Auto-update every 60 seconds
    const interval = setInterval(fetchTasks, 60000);
    
    return () => clearInterval(interval);
  }, [user?.id]);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20';
      case 'overdue':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20';
      case 'pending':
      default:
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-orange-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-slate-400';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate.getTime() === today.getTime()) return 'Today';
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (taskDate.getTime() === tomorrow.getTime()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      moduleId: '',
      autoComplete: false,
    });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      moduleId: '',
      autoComplete: false,
    });
    setOptimizedFields(new Set()); // Clear optimized fields when dialog closes
  };

  const handleToggleTaskComplete = async (taskId: string, currentStatus: string) => {
    try {
      const updatedTask = await toggleTaskComplete(taskId);
      
      // Play sound if task was completed (not uncompleted)
      if (updatedTask.status === 'completed' && currentStatus !== 'completed' && notifications.sessionSoundEnabled) {
        const volume = notifications.sessionSoundVolume / 100;
        playTaskCompleteSound(volume);
      }
      
      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task))
      );
      
      // Update stats
      const taskStats = await getTaskStats();
      setStats(taskStats);
      
      toast.success(
        updatedTask.status === 'completed' ? 'Task completed!' : 'Task marked as pending'
      );
    } catch (error: any) {
      console.error('Failed to toggle task:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update task';
      toast.error(errorMessage);
    }
  };

  const handleOptimizeTask = async () => {
    if (!formData.title.trim() && !formData.description.trim()) {
      toast.error('Please enter a task title or description first');
      return;
    }

    setIsOptimizing(true);
    try {
      const optimizationResult = await optimizeTasks({
        userId: user?.id || '',
        tasks: [{
          id: 'temp',
          title: formData.title || 'Untitled Task',
          description: formData.description || undefined,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        }],
      });

      if (optimizationResult.optimizedTasks && optimizationResult.optimizedTasks.length > 0) {
        const optimized = optimizationResult.optimizedTasks[0];
        const newOptimizedFields = new Set<string>();
        
        // Update form data and track which fields were optimized
        if (!optimized.improvedText.includes('\n') && optimized.improvedText) {
          // Title was optimized
          newOptimizedFields.add('title');
          setFormData({
            ...formData,
            title: optimized.improvedText,
          });
        } else if (optimized.improvedText.includes('\n')) {
          // Description was optimized
          newOptimizedFields.add('description');
          setFormData({
            ...formData,
            description: optimized.improvedText,
          });
        }
        
        // Track optimized fields
        setOptimizedFields(newOptimizedFields);
        
        // Remove glow after 3 seconds
        setTimeout(() => {
          setOptimizedFields(new Set());
        }, 3000);
        
        toast.success('Task optimized by FocusAI ✨');
      }
    } catch (error: any) {
      console.error('Failed to optimize task:', error);
      toast.error('Failed to optimize task. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const taskData: any = {
        title: formData.title,
        description: formData.description || undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        moduleId: formData.moduleId || undefined,
      };

      await createTask(taskData);
      
      toast.success('Task created successfully');
      handleCloseDialog();
      
      // Refetch tasks
      const taskList = await getTasks();
      setTasks(taskList);
      
      const taskStats = await getTaskStats();
      setStats(taskStats);
    } catch (error: any) {
      console.error('Failed to create task:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create task';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.total}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Tasks</div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.completed}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Completed</div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.pending}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Pending</div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.overdue}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Overdue</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Today's Progress
            </span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {stats.completionRate}%
            </span>
          </div>
          <Progress value={stats.completionRate} className="h-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {stats.autoCompletedToday} tasks auto-completed today
          </p>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'pending', 'completed', 'overdue'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
              filter === f
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            )}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card className="p-12 text-center border-2 border-dashed">
            <Circle className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No tasks {filter !== 'all' ? filter : ''}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {filter === 'all' ? 'Create your first task to get started' : `No ${filter} tasks`}
            </p>
            <Button onClick={handleOpenDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </Card>
        ) : (
          filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn('border-2 transition-all', getStatusColor(task.status))}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Status Icon - Clickable to toggle completion */}
                    <button
                      onClick={() => handleToggleTaskComplete(task.id, task.status || 'pending')}
                      className="mt-1 hover:opacity-80 transition-opacity"
                      aria-label={task.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : task.status === 'overdue' ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-yellow-500" />
                      )}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        'font-semibold text-slate-900 dark:text-white mb-1',
                        task.status === 'completed' && 'line-through text-slate-500'
                      )}>
                        {task.title}
                      </h3>
                      
                      {task.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 flex-wrap mt-2">
                        {task.dueDate && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <Calendar className="h-3 w-3" />
                            {formatDate(task.dueDate)}
                          </div>
                        )}
                        
                        {task.plannedEndTime && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <Clock className="h-3 w-3" />
                            {new Date(task.plannedEndTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </div>
                        )}

                        <Flag className={cn('h-4 w-4', getPriorityColor(task.priority))} />
                      </div>

                      {/* Progress Bar */}
                      {task.progress > 0 && task.progress < 100 && (
                        <div className="mt-3">
                          <Progress value={task.progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task to track your progress and stay organized.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <motion.div
                  animate={optimizedFields.has('title') ? {
                    boxShadow: [
                      '0 0 0px rgba(99, 102, 241, 0)',
                      '0 0 20px rgba(99, 102, 241, 0.5)',
                      '0 0 0px rgba(99, 102, 241, 0)',
                    ],
                  } : {}}
                  transition={{ duration: 1.5, repeat: 2 }}
                  className="rounded-md"
                >
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      setOptimizedFields(prev => {
                        const next = new Set(prev);
                        next.delete('title');
                        return next;
                      });
                    }}
                    placeholder="Enter task title"
                    required
                    className={cn(
                      optimizedFields.has('title') && 'ring-2 ring-indigo-400 ring-opacity-75'
                    )}
                  />
                </motion.div>
                {optimizedFields.has('title') && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    Optimized by FocusAI
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleOptimizeTask}
                    disabled={isOptimizing || (!formData.title.trim() && !formData.description.trim())}
                    className="text-xs"
                  >
                    {isOptimizing ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Optimizing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 mr-1" />
                        Optimize with AI
                      </>
                    )}
                  </Button>
                </div>
                <motion.div
                  animate={optimizedFields.has('description') ? {
                    boxShadow: [
                      '0 0 0px rgba(99, 102, 241, 0)',
                      '0 0 20px rgba(99, 102, 241, 0.5)',
                      '0 0 0px rgba(99, 102, 241, 0)',
                    ],
                  } : {}}
                  transition={{ duration: 1.5, repeat: 2 }}
                  className="rounded-md"
                >
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      setOptimizedFields(prev => {
                        const next = new Set(prev);
                        next.delete('description');
                        return next;
                      });
                    }}
                    placeholder="Enter task description (optional)"
                    rows={3}
                    className={cn(
                      optimizedFields.has('description') && 'ring-2 ring-indigo-400 ring-opacity-75'
                    )}
                  />
                </motion.div>
                {optimizedFields.has('description') && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    Optimized by FocusAI
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="moduleId">Module</Label>
                <select
                  id="moduleId"
                  value={formData.moduleId}
                  onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                >
                  <option value="">Select a module (optional)</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoComplete"
                  checked={formData.autoComplete}
                  onChange={(e) => setFormData({ ...formData, autoComplete: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor="autoComplete" className="cursor-pointer">
                  Auto-complete when due date passes
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}




