'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { getUserStats, getUserOverview, getUserStreak } from '@/lib/api/stats';
import { getSessionHistory } from '@/lib/api/sessions';
import { getUserAchievements, Achievement } from '@/lib/api/achievements';
import axiosInstance from '@/lib/axios';

export interface AnalyticsData {
  // Overview stats
  totalSessions: number;
  totalFocusTime: number; // in hours
  successRate: number; // percentage
  currentStreak: number;
  longestStreak: number;
  daysActive: number;
  level: number;

  // Weekly stats
  thisWeek: {
    sessions: number;
    totalMinutes: number;
    avgSessionLength: number;
  };
  lastWeek: {
    sessions: number;
    totalMinutes: number;
  };
  trends: {
    sessionsChange: number;
    minutesChange: number;
  };

  // Session breakdown
  soloSessions: number;
  partnerSessions: number;

  // Focus topics (top 5)
  topFocusTopics: Array<{ topic: string; count: number }>;

  // Daily analytics (last 7 days)
  dailyData: Array<{ date: string; sessions: number; totalMinutes: number }>;

  // Weekly progress (Mon-Sun)
  weeklyProgress: Array<{ day: string; hasSession: boolean; isToday: boolean; isPast: boolean }>;

  // Achievements
  achievements: Achievement[];

  // Loading state
  isLoading: boolean;
  error: string | null;
}

const initialData: AnalyticsData = {
  totalSessions: 0,
  totalFocusTime: 0,
  successRate: 0,
  currentStreak: 0,
  longestStreak: 0,
  daysActive: 0,
  level: 1,
  thisWeek: {
    sessions: 0,
    totalMinutes: 0,
    avgSessionLength: 0,
  },
  lastWeek: {
    sessions: 0,
    totalMinutes: 0,
  },
  trends: {
    sessionsChange: 0,
    minutesChange: 0,
  },
  soloSessions: 0,
  partnerSessions: 0,
  topFocusTopics: [],
  dailyData: [],
  weeklyProgress: [],
  achievements: [],
  isLoading: true,
  error: null,
};

export function useAnalytics() {
  const { user } = useAuthStore();
  const [data, setData] = useState<AnalyticsData>(initialData);

  const fetchAnalytics = useCallback(async () => {
    if (!user?.id) {
      setData({ ...initialData, isLoading: false });
      return;
    }

    setData((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch all analytics data in parallel
      const [stats, overview, streak, sessions, achievements] = await Promise.all([
        getUserStats(user.id).catch(() => ({
          daysActive: 0,
          totalFocusTime: 0,
          habitsCompleted: 0,
          goalsAchieved: 0,
          streak: 0,
          level: 1,
        })),
        getUserOverview(user.id).catch(() => ({
          userId: user.id,
          thisWeek: { sessions: 0, totalMinutes: 0, avgSessionLength: 0 },
          lastWeek: { sessions: 0, totalMinutes: 0 },
          allTime: { totalSessions: 0, totalMinutes: 0 },
          trends: { sessionsChange: 0, minutesChange: 0 },
        })),
        getUserStreak().catch(() => ({
          totalSessions: 0,
          currentStreak: 0,
          longestStreak: 0,
        })),
        getSessionHistory().catch(() => []),
        getUserAchievements().catch(() => ({ achievements: [] })),
      ]);

      // Handle achievements format (can be { achievements: [...] } or array)
      const achievementsArray = Array.isArray(achievements)
        ? achievements
        : (achievements && typeof achievements === 'object' && 'achievements' in achievements)
        ? achievements.achievements
        : [];

      // Calculate session breakdown
      const soloSessions = Array.isArray(sessions)
        ? sessions.filter((s: any) => s.mode === 'solo' || (!s.userBId || s.userAId === s.userBId)).length
        : 0;
      const partnerSessions = Array.isArray(sessions)
        ? sessions.filter((s: any) => s.mode === 'partner' || (s.userBId && s.userAId !== s.userBId)).length
        : 0;

      // Calculate top focus topics
      const topicCounts = new Map<string, number>();
      if (Array.isArray(sessions)) {
        sessions.forEach((s: any) => {
          if (s.focusTopic) {
            topicCounts.set(s.focusTopic, (topicCounts.get(s.focusTopic) || 0) + 1);
          }
        });
      }
      const topFocusTopics = Array.from(topicCounts.entries())
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate daily data (last 7 days)
      const dailyDataMap = new Map<string, { sessions: number; totalMinutes: number }>();
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        dailyDataMap.set(dateKey, { sessions: 0, totalMinutes: 0 });
      }

      if (Array.isArray(sessions)) {
        sessions.forEach((s: any) => {
          const sessionDate = new Date(s.startedAt || s.createdAt);
          const dateKey = sessionDate.toISOString().split('T')[0];
          const daysAgo = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysAgo >= 0 && daysAgo <= 6) {
            const existing = dailyDataMap.get(dateKey) || { sessions: 0, totalMinutes: 0 };
            existing.sessions++;
            existing.totalMinutes += s.durationMinutes || 0;
            dailyDataMap.set(dateKey, existing);
          }
        });
      }

      const dailyData = Array.from(dailyDataMap.entries()).map(([date, data]) => ({
        date,
        ...data,
      }));

      // Calculate weekly progress (Mon-Sun)
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);

      const weeklyProgress = days.map((day, index) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        date.setHours(23, 59, 59, 999);

        const hasSession = Array.isArray(sessions)
          ? sessions.some((s: any) => {
              const sessionDate = new Date(s.startedAt || s.createdAt);
              return (
                sessionDate >= new Date(date.setHours(0, 0, 0, 0)) &&
                sessionDate <= date
              );
            })
          : false;

        const isToday = date.toDateString() === today.toDateString();
        const isPast = date < today && !isToday;

        return {
          day,
          date,
          hasSession,
          isToday,
          isPast,
        };
      });

      // Calculate success rate (completed sessions / total sessions)
      const totalSessions = overview.allTime?.totalSessions || streak.totalSessions || 0;
      const completedSessions = Array.isArray(sessions)
        ? sessions.filter((s: any) => s.endedAt || !s.isActive).length
        : totalSessions;
      const successRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

      setData({
        totalSessions,
        totalFocusTime: stats.totalFocusTime || Math.round((overview.allTime?.totalMinutes || 0) / 60),
        successRate,
        currentStreak: streak.currentStreak || stats.streak || 0,
        longestStreak: streak.longestStreak || 0,
        daysActive: stats.daysActive || 0,
        level: stats.level || 1,
        thisWeek: overview.thisWeek || { sessions: 0, totalMinutes: 0, avgSessionLength: 0 },
        lastWeek: overview.lastWeek || { sessions: 0, totalMinutes: 0 },
        trends: overview.trends || { sessionsChange: 0, minutesChange: 0 },
        soloSessions,
        partnerSessions,
        topFocusTopics,
        dailyData,
        weeklyProgress,
        achievements: Array.isArray(achievementsArray) ? achievementsArray : [],
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      setData({
        ...initialData,
        achievements: [], // Ensure achievements is always an array
        isLoading: false,
        error: error.message || 'Failed to load analytics',
      });
    }
  }, [user?.id]);

  // Track refresh trigger to force fresh fetch
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch on mount and when user changes
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics, refreshTrigger]);

  // Refresh function for manual updates (uses cache if available)
  const refresh = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Force refresh function that bypasses cache by triggering a re-fetch
  const forceRefresh = useCallback(() => {
    // Set loading state immediately
    setData((prev) => ({ ...prev, isLoading: true, error: null }));
    // Increment refresh trigger to force useEffect to run
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    ...data,
    refresh,
    forceRefresh,
  };
}

