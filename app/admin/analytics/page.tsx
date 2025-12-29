'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { SummaryCard } from './components/SummaryCard';
import {
  getDashboardStats,
  getAnalyticsOverview,
  type DashboardStats,
  type AnalyticsOverview,
} from '@/lib/api/admin';
import {
  Users,
  UserPlus,
  Activity,
  BookOpen,
  Clock,
  TrendingUp,
} from 'lucide-react';
import useSWR from 'swr';
import { GlassCard } from '@/components/ui/glass-card';

// Dynamically import chart components with SSR disabled
const DailyActiveUsersChart = dynamic(
  () => import('./components/DailyActiveUsersChart').then((mod) => ({ default: mod.DailyActiveUsersChart })),
  { ssr: false }
);
const SessionsPerHourChart = dynamic(
  () => import('./components/SessionsPerHourChart').then((mod) => ({ default: mod.SessionsPerHourChart })),
  { ssr: false }
);
const SessionsByDeviceChart = dynamic(
  () => import('./components/SessionsByDeviceChart').then((mod) => ({ default: mod.SessionsByDeviceChart })),
  { ssr: false }
);
const UserGrowthChart = dynamic(
  () => import('./components/UserGrowthChart').then((mod) => ({ default: mod.UserGrowthChart })),
  { ssr: false }
);
const UserBehaviorTable = dynamic(
  () => import('./components/UserBehaviorTable').then((mod) => ({ default: mod.UserBehaviorTable })),
  { ssr: false }
);

const dashboardFetcher = async () => {
  try {
    const data = await getDashboardStats();
    return data || null;
  } catch (error: any) {
    console.error('Failed to fetch dashboard stats:', error);
    return null;
  }
};

const analyticsFetcher = async () => {
  try {
    const data = await getAnalyticsOverview();
    return data || {};
  } catch (error: any) {
    console.error('Failed to fetch analytics overview:', error);
    return {};
  }
};

export default function AdminAnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: dashboardStats } = useSWR<DashboardStats | null>(
    'admin-dashboard-stats',
    dashboardFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 60000,
    }
  );

  const { data: analyticsData } = useSWR<AnalyticsOverview>(
    'admin-analytics-overview',
    analyticsFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 60000,
    }
  );

  // Calculate metrics for summary cards
  // Note: dashboardStats from /admin/dashboard returns:
  // { totalUsers, activeUsersToday, sessionsToday, totalSessions, newUsersThisWeek }
  const metrics = {
    totalUsers: dashboardStats?.totalUsers || 0,
    newUsersThisWeek: dashboardStats?.newUsersThisWeek || 0,
    activeUsersToday: dashboardStats?.activeUsersToday || 0,
    totalSessions: dashboardStats?.totalSessions || analyticsData?.totalSessions || 0,
    sessionsToday: dashboardStats?.sessionsToday || 0,
    retentionRate: dashboardStats?.totalUsers && dashboardStats?.activeUsersToday
      ? Math.round(
          (dashboardStats.activeUsersToday / dashboardStats.totalUsers) * 100
        )
      : 0,
  };

  // Calculate percentage changes (mock data for now - in production, compare with previous period)
  const changes = {
    totalUsers: 12.5, // +12.5%
    newUsersThisWeek: 8.3, // +8.3%
    activeUsersToday: -2.1, // -2.1%
    totalSessions: 15.7, // +15.7%
    sessionsToday: 5.2, // +5.2%
    retentionRate: 3.4, // +3.4%
  };

  return (
    <>
      {/* Premium Animated Background */}
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

        <div className="relative z-10 space-y-6 p-6">
          {/* Header */}
          <GlassCard delay={0} className="p-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                System-wide analytics and insights with real-time data visualization
              </p>
            </div>
          </GlassCard>

          {/* Summary Cards Grid */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <SummaryCard
          title="Total Users"
          value={metrics.totalUsers}
          change={changes.totalUsers}
          icon={Users}
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <SummaryCard
          title="New Users This Week"
          value={metrics.newUsersThisWeek}
          change={changes.newUsersThisWeek}
          icon={UserPlus}
          iconColor="text-green-600 dark:text-green-400"
        />
        <SummaryCard
          title="Active Users Today"
          value={metrics.activeUsersToday}
          change={changes.activeUsersToday}
          icon={Activity}
          iconColor="text-purple-600 dark:text-purple-400"
        />
        <SummaryCard
          title="Total Study Sessions"
          value={metrics.totalSessions}
          change={changes.totalSessions}
          icon={BookOpen}
          iconColor="text-orange-600 dark:text-orange-400"
        />
        <SummaryCard
          title="Sessions Today"
          value={metrics.sessionsToday}
          change={changes.sessionsToday}
          icon={Clock}
          iconColor="text-pink-600 dark:text-pink-400"
        />
        <SummaryCard
          title="User Retention Rate"
          value={`${metrics.retentionRate}%`}
          change={changes.retentionRate}
          icon={TrendingUp}
          iconColor="text-indigo-600 dark:text-indigo-400"
        />
      </div>

          {/* Charts Grid - Only render when mounted (client-side) */}
          {mounted && (
            <>
              {/* Charts Grid - Row 1: Two large charts */}
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <GlassCard delay={0.1}>
                  <DailyActiveUsersChart />
                </GlassCard>
                <GlassCard delay={0.15}>
                  <SessionsPerHourChart />
                </GlassCard>
              </div>

              {/* Charts Grid - Row 2: Two smaller charts */}
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <GlassCard delay={0.2}>
                  <SessionsByDeviceChart />
                </GlassCard>
                <GlassCard delay={0.25}>
                  <UserGrowthChart />
                </GlassCard>
              </div>

              {/* User Behavior Table - Full width */}
              <GlassCard delay={0.3}>
                <UserBehaviorTable />
              </GlassCard>
            </>
          )}
        </div>
      </div>
    </>
  );
}
