/**
 * ============================================================================
 * LIB/API/NOTIFICATIONS.TS - NOTIFICATION API CLIENT
 * ============================================================================
 * 
 * Purpose: Frontend API client for notification management. Provides typed
 * functions for fetching, marking as read, and clearing notifications.
 * 
 * Architecture Role: API abstraction for notification features. Used by
 * notification bell component to manage user notifications.
 * 
 * ============================================================================
 * 📘 CODE ORIGIN
 * ============================================================================
 * PHASE 3: Custom implementation for Focusmate notification system
 * 
 * @author Eromonsele Marvelous
 * @module Frontend/API
 * @phase Phase 3
 * ============================================================================
 */

import axiosInstance from '../axios';

export interface Notification {
  id: string;
  userId: string;
  type: 'streak' | 'daily-goal' | 'weekly-goal' | 'session-reminder' | 'matchmaking-found' | 'achievement' | 'general';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

// Get user notifications
export const getUserNotifications = async (unreadOnly = false): Promise<Notification[]> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    console.log('═══════════════════════════════════════════════════════════');
    console.log('NOTIFICATIONS API: getUserNotifications() called');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  NOTIFICATIONS REQUEST TOKEN: ${token ? token.substring(0, 40) + '...' : 'NOT FOUND'}`);
    console.log(`  Unread only: ${unreadOnly}`);
    
    const response = await axiosInstance.get('/notifications', {
      params: { unreadOnly: unreadOnly ? 'true' : 'false' },
    });
    
    console.log('  NOTIFICATIONS RESPONSE:', response.data);
    console.log(`  Response status: ${response.status}`);
    console.log(`  Notifications count: ${Array.isArray(response.data.notifications) ? response.data.notifications.length : 'N/A'}`);
    console.log('═══════════════════════════════════════════════════════════');
    
    return response.data.notifications || [];
  } catch (error: any) {
    console.error('═══════════════════════════════════════════════════════════');
    console.error('NOTIFICATIONS API: getUserNotifications() ERROR');
    console.error('═══════════════════════════════════════════════════════════');
    console.error(`  NOTIFICATIONS ERROR: ${error.message}`);
    console.error(`  Error status: ${error.response?.status || 'N/A'}`);
    console.error(`  Error data: ${JSON.stringify(error.response?.data || {})}`);
    console.error(`  Request URL: ${error.config?.url || 'N/A'}`);
    console.error('═══════════════════════════════════════════════════════════');
    
    // Return empty array on error to prevent UI breaking
    return [];
  }
};

// Get unread count
export const getUnreadCount = async (): Promise<number> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    console.log('═══════════════════════════════════════════════════════════');
    console.log('NOTIFICATIONS API: getUnreadCount() called');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  NOTIFICATIONS REQUEST TOKEN: ${token ? token.substring(0, 40) + '...' : 'NOT FOUND'}`);
    
    const response = await axiosInstance.get('/notifications/unread-count');
    
    console.log('  NOTIFICATIONS RESPONSE:', response.data);
    console.log(`  Response status: ${response.status}`);
    console.log(`  Unread count: ${response.data.count || 0}`);
    console.log('═══════════════════════════════════════════════════════════');
    
    return response.data.count || 0;
  } catch (error: any) {
    console.error('═══════════════════════════════════════════════════════════');
    console.error('NOTIFICATIONS API: getUnreadCount() ERROR');
    console.error('═══════════════════════════════════════════════════════════');
    console.error(`  NOTIFICATIONS ERROR: ${error.message}`);
    console.error(`  Error status: ${error.response?.status || 'N/A'}`);
    console.error(`  Error data: ${JSON.stringify(error.response?.data || {})}`);
    console.error(`  Request URL: ${error.config?.url || 'N/A'}`);
    console.error('═══════════════════════════════════════════════════════════');
    
    // Return 0 on error to prevent UI breaking
    return 0;
  }
};

// Mark as read
export const markNotificationAsRead = async (id: string): Promise<void> => {
  await axiosInstance.patch(`/notifications/${id}/read`);
};

// Mark all as read
export const markAllAsRead = async (): Promise<void> => {
  await axiosInstance.patch('/notifications/read-all');
};

// Clear all
export const clearAllNotifications = async (): Promise<void> => {
  await axiosInstance.delete('/notifications/clear-all');
};



