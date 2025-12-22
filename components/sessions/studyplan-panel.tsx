/**
 * ============================================================================
 * COMPONENTS/SESSIONS/STUDYPLAN-PANEL.TSX - STUDY PLAN PANEL
 * ============================================================================
 * 
 * Purpose: 7-day auto-generated study plan with regenerate, completion tracking.
 * 
 * @author Marvelous Eromonsele
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar, RefreshCw, CheckCircle, Clock, AlertCircle, ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { getStudyPlan, generateStudyPlan, updateStudyPlanDay, type StudyPlan, type StudyPlanDay } from '@/lib/api/studyplan';
import { getTasks, type Task } from '@/lib/api/tasks';
import { cn } from '@/lib/utils';

export function StudyPlanPanel() {
  const { user } = useAuthStore();
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchPlan();
      fetchTasks();
    }
  }, [user?.id]);

  const fetchPlan = async () => {
    try {
      setError(null);
      const data = await getStudyPlan();
      setPlan(data);
    } catch (error: any) {
      console.error('Failed to fetch study plan:', error);
      if (error.response?.status !== 404) {
        setError('Failed to load study plan');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const taskList = await getTasks();
      setTasks(taskList);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const handleRegenerate = async () => {
    if (!user?.id) return;
    
    setGenerating(true);
    setError(null);
    try {
      await generateStudyPlan();
      // Fetch the newly generated plan
      const newPlan = await getStudyPlan();
      setPlan(newPlan);
      toast.success('Study plan generated successfully');
    } catch (error: any) {
      console.error('Error generating study plan:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate study plan';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleEditDay = (date: string) => {
    setEditingDay(date);
    setIsEditDialogOpen(true);
  };

  const handleSaveDayEdit = async (tasks: string[]) => {
    if (!editingDay) return;

    try {
      await updateStudyPlanDay(editingDay, { tasks });
      toast.success('Day updated successfully');
      setIsEditDialogOpen(false);
      setEditingDay(null);
      // Refresh plan
      const updatedPlan = await getStudyPlan();
      setPlan(updatedPlan);
    } catch (error: any) {
      console.error('Error updating day:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update day';
      toast.error(errorMessage);
    }
  };

  const getTaskTitle = (taskId: string): string => {
    const task = tasks.find(t => t.id === taskId);
    return task?.title || `Task ${taskId.slice(0, 8)}`;
  };

  const calculateDayProgress = (day: StudyPlanDay): number => {
    if (!day.tasks || day.tasks.length === 0) return 0;
    const totalTasks = day.tasks.length;
    const completedTasks = day.tasks.filter((taskId: string) => {
      const task = tasks.find(t => t.id === taskId);
      return task?.completed || false;
    }).length;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const getDayStatus = (day: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayDate = new Date(day.date);
    dayDate.setHours(0, 0, 0, 0);

    if (dayDate < today) {
      return 'past';
    } else if (dayDate.getTime() === today.getTime()) {
      return 'today';
    } else {
      return 'upcoming';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading study plan...</p>
        </div>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            7-Day Study Plan
          </h3>
          <Button onClick={handleRegenerate} disabled={generating}>
            <RefreshCw className={cn('h-4 w-4 mr-2', generating && 'animate-spin')} />
            Generate Plan
          </Button>
        </div>
        <Card className="p-12 text-center border-2 border-dashed border-red-200 dark:border-red-800">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Error loading study plan
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {error}
          </p>
          <Button onClick={handleRegenerate} disabled={generating}>
            <RefreshCw className={cn('h-4 w-4 mr-2', generating && 'animate-spin')} />
            Generate Plan
          </Button>
        </Card>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            7-Day Study Plan
          </h3>
          <Button onClick={handleRegenerate} disabled={generating}>
            <RefreshCw className={cn('h-4 w-4 mr-2', generating && 'animate-spin')} />
            Generate Plan
          </Button>
        </div>
        <Card className="p-12 text-center border-2 border-dashed">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No study plan yet
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Generate your first 7-day study plan
          </p>
          <Button onClick={handleRegenerate} disabled={generating}>
            <RefreshCw className={cn('h-4 w-4 mr-2', generating && 'animate-spin')} />
            Generate Plan
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            7-Day Study Plan
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {plan.days.reduce((sum, day) => sum + (day.tasks?.length || 0), 0)} tasks
          </p>
        </div>
        <Button onClick={handleRegenerate} disabled={generating} size="sm">
          <RefreshCw className={cn('h-4 w-4 mr-2', generating && 'animate-spin')} />
          Regenerate
        </Button>
      </div>

      {/* Horizontal Scroll View */}
      <div className="relative">
        <div className="overflow-x-auto pb-4 scrollbar-hide" style={{ scrollBehavior: 'smooth' }}>
          <div className="flex gap-4 min-w-max">
            {plan.days.map((day, index) => {
              const status = getDayStatus(day);
              
              return (
                <motion.div
                  key={day.id || day.date}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="min-w-[280px]"
                >
                  <Card className={cn(
                    'border-2 h-full',
                    status === 'today' 
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' 
                      : status === 'past'
                      ? 'border-slate-200 dark:border-slate-800 opacity-60'
                      : 'border-slate-200 dark:border-slate-800'
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {formatDate(day.date)}
                          </h4>
                          {status === 'today' && (
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                              Today
                            </span>
                          )}
                        </div>
                        {status === 'past' && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {status === 'today' && (
                          <Clock className="h-5 w-5 text-indigo-500" />
                        )}
                        {status === 'upcoming' && (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>

                      <div className="space-y-2">
                        {/* Progress Bar */}
                        {day.tasks && day.tasks.length > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                Progress
                              </span>
                              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                {calculateDayProgress(day)}%
                              </span>
                            </div>
                            <Progress value={calculateDayProgress(day)} className="h-2" />
                          </div>
                        )}

                        {/* Tasks List */}
                        {day.tasks && day.tasks.length > 0 ? (
                          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                Tasks ({day.tasks.length})
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditDay(day.date)}
                                className="h-6 px-2"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="space-y-1">
                              {day.tasks.slice(0, 3).map((taskId: string) => {
                                const task = tasks.find(t => t.id === taskId);
                                return (
                                  <div
                                    key={taskId}
                                    className={cn(
                                      'text-xs text-slate-600 dark:text-slate-400',
                                      task?.completed && 'line-through opacity-60'
                                    )}
                                  >
                                    • {getTaskTitle(taskId)}
                                  </div>
                                );
                              })}
                              {day.tasks.length > 3 && (
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  +{day.tasks.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                Tasks (0)
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditDay(day.date)}
                                className="h-6 px-2"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              No tasks assigned
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Day Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Study Plan Day</DialogTitle>
            <DialogDescription>
              {editingDay && `Update tasks and schedule for ${formatDate(editingDay)}`}
            </DialogDescription>
          </DialogHeader>
          {editingDay && plan && (() => {
            const day = plan.days.find(d => d.date === editingDay);
            if (!day) return null;

            return (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Assigned Tasks</Label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {day.tasks && day.tasks.length > 0 ? (
                      day.tasks.map((taskId: string) => {
                        const task = tasks.find(t => t.id === taskId);
                        return (
                          <div
                            key={taskId}
                            className="flex items-center justify-between p-2 border rounded-md"
                          >
                            <span className="text-sm">{getTaskTitle(taskId)}</span>
                            {task?.completed && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-slate-500">No tasks assigned</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingDay(null);
              }}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                if (editingDay && plan) {
                  const day = plan.days.find(d => d.date === editingDay);
                  if (day) {
                    handleSaveDayEdit(day.tasks || []);
                  }
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

