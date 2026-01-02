'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAllNotifications, type Notification } from '@/lib/api/admin';
import { toast } from 'sonner';

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
    return <div className="text-center py-12">Loading notifications...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Notifications Center</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          View and manage all system notifications
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All Notifications
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          onClick={() => setFilter('unread')}
        >
          Unread Only
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
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
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.isRead
                      ? 'bg-slate-50 dark:bg-slate-800'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded bg-slate-200 dark:bg-slate-700">
                          {notification.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send New Notification</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Notification sending functionality would be implemented here with a form
            to send notifications to specific users or all users.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}











