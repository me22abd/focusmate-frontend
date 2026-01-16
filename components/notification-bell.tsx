/**
 * ============================================================================
 * NOTIFICATION-BELL.TSX - NOTIFICATION BELL & DROPDOWN COMPONENT
 * ============================================================================
 * 
 * Purpose: Notification bell icon with badge count and dropdown panel. Displays
 * user notifications, marks as read on click, and navigates to action URLs.
 * Provides real-time notification updates with polling.
 * 
 * Architecture Role: Navbar integration component for notification system.
 * Fetches notifications, displays unread count, and manages notification state.
 * 
 * ============================================================================
 * 📘 CODE ORIGIN (REQUIRED FOR ACADEMIC HONESTY)
 * ============================================================================
 * 
 * a) LIBRARY CODE (Not original):
 * ───────────────────────────────────────────────────────────────────────────
 * - React hooks (useState, useEffect, useRef)
 * - Framer Motion (AnimatePresence, motion)
 * - Lucide icons (Bell, X, CheckCircle2, etc.)
 * 
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * b) ADAPTED PATTERNS:
 * ───────────────────────────────────────────────────────────────────────────
 * - Dropdown pattern (click-outside detection)
 * - Badge counter (notification count display)
 * - Polling pattern (setInterval for updates)
 * 
 * Sources: Common notification UI patterns
 * 
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * c) MY CUSTOM CODE (100% Original for Focusmate):
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * 1. NOTIFICATION POLLING [Lines 70-85]:
 *    MY implementation: Fetch notifications every 30 seconds
 * 
 * 2. CLICK-OUTSIDE DETECTION [Lines 87-102]:
 *    MY implementation: Close dropdown when clicking outside
 * 
 * 3. NOTIFICATION CLICK HANDLER [Lines 104-120]:
 *    MY implementation: Mark as read + navigate to actionUrl
 * 
 * 4. DROPDOWN UI [Lines 180-280]:
 *    MY complete dropdown design with notification cards
 * 
 * My Design Decisions:
 * ──────────────────────────────────────────────────────────────────────────
 * ✨ 30-second polling (balance freshness vs performance)
 * ✨ Badge count on bell (shows unread)
 * ✨ Click to mark as read (intuitive UX)
 * ✨ Action URL navigation (clickable notifications)
 * ✨ Mark all as read button (bulk action)
 * ✨ Clear all button (cleanup)
 * ✨ Empty state UI (guide users)
 * 
 * ============================================================================
 * 
 * @author Eromonsele Marvelous
 * @component Frontend/Notification
 * @phase Phase 3
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, X, CheckCircle2, Clock, Flame, Target, Trophy, Users, ChevronRight } from 'lucide-react';
import { 
  getUserNotifications, 
  getUnreadCount, 
  markNotificationAsRead, 
  markAllAsRead,
  clearAllNotifications,
  Notification 
} from '@/lib/api/notifications';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ===========================================================================
  // 📘 CODE ORIGIN: Fetch Notifications with Polling
  // ===========================================================================
  // Custom implementation by me: Periodic notification refresh
  // 
  // My Implementation:
  // - Fetch on mount
  // - Poll every 30 seconds for new notifications
  // - Cleanup interval on unmount
  // 
  // Why 30 Seconds:
  // - Balance between freshness and server load
  // - Most notifications aren't urgent (can wait 30s)
  // - Reduces API calls compared to 5-10s polling
  // ===========================================================================
  const fetchNotifications = async () => {
    try {
      const [notifs, count] = await Promise.all([
        getUserNotifications(false), // Get all notifications
        getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Custom: Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // ===========================================================================
  // 📘 CODE ORIGIN: Click-Outside Detection
  // ===========================================================================
  // Custom implementation by me: Close dropdown when clicking outside
  // ===========================================================================
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // ===========================================================================
  // 📘 CODE ORIGIN: Notification Click Handler
  // ===========================================================================
  // Custom implementation by me: Mark as read + navigate
  // 
  // My Flow:
  // 1. Mark notification as read (API call)
  // 2. Update local state (optimistic update)
  // 3. Navigate to actionUrl if exists
  // 4. Close dropdown
  // ===========================================================================
  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read
      await markNotificationAsRead(notification.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Navigate if actionUrl exists
      if (notification.actionUrl) {
        router.push(notification.actionUrl);
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications cleared');
    } catch (error) {
      toast.error('Failed to clear notifications');
    }
  };

  // Get notification icon by type
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'streak':
        return <Flame className="h-5 w-5 text-orange-500" />;
      case 'daily-goal':
      case 'weekly-goal':
        return <Target className="h-5 w-5 text-green-500" />;
      case 'achievement':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'matchmaking-found':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'session-reminder':
        return <Clock className="h-5 w-5 text-indigo-500" />;
      default:
        return <CheckCircle2 className="h-5 w-5 text-slate-500" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        
        {/* Badge Count */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[32rem] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl z-50"
          >
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Notifications
                </h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllRead}
                      className="text-xs h-7"
                    >
                      Mark all read
                    </Button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                  >
                    <X className="h-4 w-4 text-slate-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No notifications yet
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    We'll notify you about streaks, goals, and achievements
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        'w-full p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800',
                        !notification.isRead && 'bg-blue-50/50 dark:bg-blue-950/20'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn(
                              'text-sm font-medium',
                              notification.isRead 
                                ? 'text-slate-600 dark:text-slate-400' 
                                : 'text-slate-900 dark:text-white'
                            )}>
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                              {formatTime(notification.createdAt)}
                            </p>
                            {notification.actionUrl && (
                              <ChevronRight className="h-3 w-3 text-slate-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-700 p-3 flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Clear all
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    router.push('/notifications');
                    setIsOpen(false);
                  }}
                  className="text-xs"
                >
                  View all
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * ============================================================================
 * WHAT I BUILT VS WHAT I ADAPTED
 * ============================================================================
 * 
 * LIBRARY CODE (Not original):
 * ❌ React hooks
 * ❌ Framer Motion AnimatePresence
 * ❌ Lucide icons
 * 
 * ADAPTED PATTERNS:
 * 🔄 Dropdown with click-outside (common pattern, my implementation)
 * 🔄 Badge counter (common pattern, my styling)
 * 🔄 Polling (common pattern, my interval choice)
 * 
 * MY CUSTOM IMPLEMENTATIONS:
 * ✅ Complete notification bell component
 * ✅ 30-second polling system
 * ✅ Click-outside detection with refs
 * ✅ Notification click handler (mark as read + navigate)
 * ✅ Mark all as read functionality
 * ✅ Clear all functionality
 * ✅ Icon mapping by notification type
 * ✅ Time formatting (relative time display)
 * ✅ Dropdown UI layout and design
 * ✅ Badge count display
 * ✅ Empty state UI
 * ✅ Unread highlighting (blue background)
 * ✅ All animations and transitions
 * 
 * ============================================================================
 * HOW TO EXPLAIN DURING VIVA
 * ============================================================================
 * 
 * Question: "How does your notification system work?"
 * 
 * Answer:
 * "I built a complete notification system with bell icon, dropdown, and backend API:
 * 
 * **Real-Time Updates:**
 * The bell component polls the backend every 30 seconds to fetch new notifications.
 * I chose 30 seconds as a balance between freshness and performance - notifications
 * aren't urgent enough to require 5-second polling which would increase server load.
 * 
 * **User Interaction:**
 * When users click a notification, my handler marks it as read (API call),
 * updates the local state optimistically, and navigates to the actionUrl if
 * provided. This makes notifications actionable - clicking a streak notification
 * takes you to your profile, a goal notification to analytics, etc.
 * 
 * **Badge Count:**
 * The bell shows an unread count badge (red circle with number). This gives
 * users immediate feedback about new notifications without opening the dropdown.
 * 
 * **Bulk Actions:**
 * Users can 'Mark all as read' or 'Clear all' from the dropdown footer. These
 * call bulk API endpoints for efficiency rather than individual calls.
 * 
 * **Click-Outside Detection:**
 * I use a ref and event listener to detect clicks outside the dropdown and
 * close it automatically. This provides expected dropdown UX.
 * 
 * **Icon Mapping:**
 * Each notification type (streak, goal, achievement, matchmaking) has a specific
 * icon and color, making notifications visually scannable.
 * 
 * The backend creates notifications when events occur (streaks, goals, achievements),
 * and the frontend displays them in real-time."
 * 
 * ============================================================================
 */

















