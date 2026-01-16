'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { getAllNotifications, type Notification } from '@/lib/api/admin';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await getAllNotifications(filter === 'unread');
        setNotifications(data);
      } catch (error) {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, [filter]);

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Bell className="h-8 w-8 animate-pulse text-indigo-600 mx-auto mb-2" />
          <p className="text-slate-600 dark:text-slate-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-900">
      {/* Floating gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10 px-4 sm:px-6 pb-24 pt-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
              Notifications Center
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
              View and manage all system notifications
            </p>
          </motion.div>

          <GlassCard delay={0.1}>
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <AnimatedButton
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                    className={filter === 'all' ? 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white' : ''}
                  >
                    All Notifications
                  </AnimatedButton>
                  <AnimatedButton
                    variant={filter === 'unread' ? 'default' : 'outline'}
                    onClick={() => setFilter('unread')}
                    className={filter === 'unread' ? 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white' : ''}
                  >
                    Unread Only
                  </AnimatedButton>
                </div>
              </CardContent>
            </Card>
          </GlassCard>

          <GlassCard delay={0.15}>
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                  {filter === 'unread' ? 'Unread' : 'All'} Notifications ({notifications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No notifications found
                    </p>
                  ) : (
                    notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-lg border backdrop-blur-sm ${
                          notification.isRead
                            ? 'bg-white/40 dark:bg-white/5 border-white/20'
                            : 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold">{notification.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <span className="text-xs px-2 py-1 rounded bg-white/50 dark:bg-white/10">
                                {notification.type}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(notification.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          {!notification.isRead && (
                            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </GlassCard>

          <GlassCard delay={0.2}>
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                  Send New Notification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Notification sending functionality would be implemented here with a form
                  to send notifications to specific users or all users.
                </p>
              </CardContent>
            </Card>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}












