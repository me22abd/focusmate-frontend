/**
 * ============================================================================
 * COMPONENTS/SESSIONS/REMINDERS-PANEL.TSX - SMART REMINDERS PANEL
 * ============================================================================
 * 
 * Purpose: Smart reminders with auto-scheduling based on tasks, deadlines, modules.
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
import { Plus, Bell, Clock, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { getTasks } from '@/lib/api/tasks';
import { cn } from '@/lib/utils';

interface Reminder {
  id: string;
  type: 'task' | 'deadline' | 'module' | 'study' | 'custom';
  title: string;
  message: string;
  scheduledAt: string;
  frequency: '5min' | '30min' | '1hour' | 'daily' | 'weekly';
  completed: boolean;
}

export function RemindersPanel() {
  const { user } = useAuthStore();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadReminders();
      generateAutoReminders();
    }
  }, [user?.id]);

  const loadReminders = () => {
    try {
      const storageKey = `focusmate_reminders_${user?.id || 'default'}`;
      if (typeof window !== 'undefined') {
        const savedReminders = localStorage.getItem(storageKey);
        if (savedReminders) {
          const parsed = JSON.parse(savedReminders);
          setReminders(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load reminders:', error);
    }
  };

  const generateAutoReminders = async () => {
    try {
      const tasks = await getTasks();
      const autoReminders: Reminder[] = [];

      // Generate reminders for upcoming tasks
      tasks.forEach(task => {
        if (task.dueDate && !task.completed) {
          const dueDate = new Date(task.dueDate);
          const now = new Date();
          const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

          if (hoursUntilDue > 0 && hoursUntilDue <= 24) {
            autoReminders.push({
              id: `task-${task.id}`,
              type: 'deadline',
              title: `Task Due Soon: ${task.title}`,
              message: `Your task "${task.title}" is due in ${Math.round(hoursUntilDue)} hours`,
              scheduledAt: new Date(dueDate.getTime() - 60 * 60 * 1000).toISOString(), // 1 hour before
              frequency: '1hour',
              completed: false,
            });
          }
        }

        if (task.status === 'overdue') {
          autoReminders.push({
            id: `overdue-${task.id}`,
            type: 'task',
            title: `Overdue Task: ${task.title}`,
            message: `Your task "${task.title}" is overdue`,
            scheduledAt: new Date().toISOString(),
            frequency: 'daily',
            completed: false,
          });
        }
      });

      // Merge with saved custom reminders
      const storageKey = `focusmate_reminders_${user?.id || 'default'}`;
      let savedReminders: Reminder[] = [];
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          savedReminders = JSON.parse(saved);
        }
      }

      // Combine auto-generated and custom reminders, avoiding duplicates
      const allReminders = [...savedReminders];
      autoReminders.forEach(autoReminder => {
        if (!allReminders.find(r => r.id === autoReminder.id)) {
          allReminders.push(autoReminder);
        }
      });

      setReminders(allReminders);
    } catch (error) {
      console.error('Failed to generate reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'task':
        return <CheckCircle className="h-5 w-5 text-orange-500" />;
      case 'study':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-indigo-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">Loading reminders...</p>
      </div>
    );
  }

  const upcomingReminders = reminders.filter(r => !r.completed && new Date(r.scheduledAt) >= new Date());
  const pastReminders = reminders.filter(r => r.completed || new Date(r.scheduledAt) < new Date());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Smart Reminders
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {upcomingReminders.length} upcoming • {pastReminders.length} past
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Upcoming
          </h4>
          <div className="space-y-3">
            {upcomingReminders.map((reminder, index) => (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-2 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getReminderIcon(reminder.type)}
                      <div className="flex-1">
                        <h5 className="font-semibold text-slate-900 dark:text-white">
                          {reminder.title}
                        </h5>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {reminder.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <Clock className="h-3 w-3" />
                          {formatTime(reminder.scheduledAt)}
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                            {reminder.frequency}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-auto h-6 px-2 text-xs"
                            onClick={() => {
                              const updated = reminders.map(r => 
                                r.id === reminder.id ? { ...r, completed: true } : r
                              );
                              setReminders(updated);
                              const storageKey = `focusmate_reminders_${user?.id || 'default'}`;
                              if (typeof window !== 'undefined') {
                                localStorage.setItem(storageKey, JSON.stringify(updated));
                              }
                              toast.success('Reminder marked as complete');
                            }}
                          >
                            Mark Done
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Past Reminders */}
      {pastReminders.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Past Reminders
          </h4>
          <div className="space-y-2">
            {pastReminders.slice(0, 5).map((reminder) => (
              <Card key={reminder.id} className="border border-slate-200 dark:border-slate-800 opacity-60">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    {getReminderIcon(reminder.type)}
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-through">
                        {reminder.title}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {reminders.length === 0 && (
        <Card className="p-12 text-center border-2 border-dashed">
          <Bell className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No reminders yet
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Reminders are auto-generated from your tasks and deadlines
          </p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Reminder
          </Button>
        </Card>
      )}

      {/* Add Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Add Reminder</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const title = formData.get('title') as string;
                  const message = formData.get('message') as string;
                  const frequency = formData.get('frequency') as string;
                  const scheduledDate = formData.get('scheduledDate') as string;
                  const scheduledTime = formData.get('scheduledTime') as string;

                  if (!title || !scheduledDate || !scheduledTime) {
                    toast.error('Please fill in all required fields');
                    return;
                  }

                  // Combine date and time
                  const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
                  
                  // Adjust based on frequency (for "before" options)
                  if (frequency === '5min') {
                    scheduledDateTime.setMinutes(scheduledDateTime.getMinutes() - 5);
                  } else if (frequency === '30min') {
                    scheduledDateTime.setMinutes(scheduledDateTime.getMinutes() - 30);
                  } else if (frequency === '1hour') {
                    scheduledDateTime.setHours(scheduledDateTime.getHours() - 1);
                  }

                  const newReminder: Reminder = {
                    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'custom',
                    title,
                    message: message || title,
                    scheduledAt: scheduledDateTime.toISOString(),
                    frequency: frequency as Reminder['frequency'],
                    completed: false,
                  };

                  // Save to localStorage
                  const storageKey = `focusmate_reminders_${user?.id || 'default'}`;
                  const existingReminders = typeof window !== 'undefined' 
                    ? JSON.parse(localStorage.getItem(storageKey) || '[]')
                    : [];
                  
                  const updatedReminders = [newReminder, ...existingReminders];
                  
                  if (typeof window !== 'undefined') {
                    localStorage.setItem(storageKey, JSON.stringify(updatedReminders));
                  }

                  // Update state
                  setReminders(updatedReminders);
                  setShowAddDialog(false);
                  toast.success('Reminder created successfully!');
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Reminder Title *
                  </label>
                  <input
                    name="title"
                    placeholder="e.g., Study for Math Exam"
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Message
                  </label>
                  <textarea
                    name="message"
                    placeholder="Optional reminder message"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Scheduled Date *
                  </label>
                  <input
                    name="scheduledDate"
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Scheduled Time *
                  </label>
                  <input
                    name="scheduledTime"
                    type="time"
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Frequency
                  </label>
                  <select 
                    name="frequency" 
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    defaultValue="1hour"
                  >
                    <option value="5min">5 minutes before</option>
                    <option value="30min">30 minutes before</option>
                    <option value="1hour">1 hour before</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600">
                    Create Reminder
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

