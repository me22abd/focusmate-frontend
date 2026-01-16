'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle2, Clock, AlertTriangle, TrendingUp, Target, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { evaluateNotifications, type NotificationRecommendation } from '@/lib/api/ai';
import { toast } from 'sonner';
import { FocusAICharacter } from '@/components/mascot/FocusAICharacter';

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const fetched = await evaluateNotifications();
      setNotifications(fetched);
      setUnreadCount(fetched.length);
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Load notifications on mount and when user changes
  useEffect(() => {
    fetchNotifications();
    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'streak_warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'best_time_to_focus':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'task_overdue':
        return <Target className="h-4 w-4 text-red-500" />;
      case 'low_mood_alert':
        return <AlertTriangle className="h-4 w-4 text-purple-500" />;
      case 'session_preparation':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'motivation_boost':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-indigo-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'streak_warning':
        return 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20';
      case 'best_time_to_focus':
        return 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20';
      case 'task_overdue':
        return 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20';
      case 'low_mood_alert':
        return 'border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20';
      case 'session_preparation':
        return 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20';
      case 'motivation_boost':
        return 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20';
      default:
        return 'border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/20';
    }
  };

  const handleMarkAsRead = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = () => {
    setNotifications([]);
    setUnreadCount(0);
    toast.success('All notifications marked as read');
  };

  return (
    <div className={cn('relative', className)}>
      {/* Bell Icon Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center"
          >
            <span className="text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </motion.div>
        )}
      </Button>

      {/* Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-12 z-50 w-96 max-h-[600px] overflow-hidden"
            >
              <GlassCard className="shadow-2xl border border-white/20">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <FocusAICharacter pose="idea" size="sm" animate />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">FocusAI Notifications</h3>
                      <p className="text-xs text-muted-foreground">
                        {unreadCount} {unreadCount === 1 ? 'unread' : 'unread'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        className="text-xs h-7"
                      >
                        Mark all read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="h-7 w-7"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-[500px] overflow-y-auto">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">Loading notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <CheckCircle2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-sm font-medium text-foreground mb-1">All caught up!</p>
                      <p className="text-xs text-muted-foreground">
                        No new notifications from FocusAI
                      </p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-2">
                      {notifications.map((notification, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className={cn(
                            'p-3 rounded-lg border transition-all cursor-pointer hover:opacity-90',
                            getNotificationColor(notification.type)
                          )}
                          onClick={() => handleMarkAsRead(index)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-foreground mb-1">
                                {notification.title}
                              </h4>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {notification.description}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(index);
                              }}
                              className="h-6 w-6 flex-shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}



