'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/glass-card';
import { getDashboardStats, getSystemHealth, getAdminLogs, type DashboardStats, type SystemHealth, type AdminLog } from '@/lib/api/admin';
import { Users, Calendar, FileText, Database, Mail, Server, Activity, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [recentLogs, setRecentLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts
    
    async function loadData() {
      try {
        const [statsData, healthData, logsData] = await Promise.all([
          getDashboardStats().catch((error) => {
            // Don't log 401 errors here - interceptor handles redirect
            if (error.response?.status !== 401 && error.response?.status !== 403) {
              console.error('Failed to load dashboard stats:', error);
            }
            return null;
          }),
          getSystemHealth().catch((error) => {
            if (error.response?.status !== 401 && error.response?.status !== 403) {
              console.error('Failed to load system health:', error);
            }
            return {
              dbStatus: 'unknown',
              error: 'Unable to load system health',
              timestamp: new Date().toISOString(),
            };
          }),
          getAdminLogs(10).catch((error) => {
            if (error.response?.status !== 401 && error.response?.status !== 403) {
              console.error('Failed to load admin logs:', error);
            }
            return { success: false, count: 0, logs: [] };
          }),
        ]);
        
        // Only update state if component is still mounted
        if (isMounted) {
          setStats(statsData);
          setHealth(healthData);
          setRecentLogs(logsData?.logs || []);
        }
      } catch (error: any) {
        if (isMounted && error?.response?.status !== 401 && error?.response?.status !== 403) {
          console.error('Failed to load dashboard data:', error);
          // Set defaults on error
          setStats(null);
          setHealth({
            dbStatus: 'unknown',
            error: 'Unable to load system health',
            timestamp: new Date().toISOString(),
          });
          setRecentLogs([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  const isDbHealthy = health?.dbStatus === 'connected';

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

      <div className="relative z-10 space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Overview of system statistics and health
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <GlassCard delay={0.1}>
            <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeUsers || 0} active, {stats?.suspendedUsers || 0} suspended
            </p>
          </CardContent>
        </Card>

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                {stats?.activeUsers || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Currently active accounts</p>
            </CardContent>
          </Card>
        </GlassCard>

        <GlassCard delay={0.2}>
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspended Users</CardTitle>
              <Users className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
                {stats?.suspendedUsers || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Suspended accounts</p>
            </CardContent>
          </Card>
        </GlassCard>

        <GlassCard delay={0.25}>
          <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Status</CardTitle>
            {isDbHealthy ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDbHealthy ? 'text-green-600' : 'text-red-600'}`}>
              {health?.dbStatus || 'Unknown'}
            </div>
            <p className="text-xs text-muted-foreground">
              {health?.dbLatency || 'N/A'} latency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Service</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-600">-</div>
            <p className="text-xs text-muted-foreground">Status not available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Background Tasks</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Running</div>
            <p className="text-xs text-muted-foreground">All tasks active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Server Uptime</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health?.uptime || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">System uptime</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health?.memoryUsage || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Current memory consumption</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* System Health Details */}
        {health && (
          <Card>
            <CardHeader>
              <CardTitle>System Health Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Database Status</span>
                  <span className={`font-semibold ${isDbHealthy ? 'text-green-600' : 'text-red-600'}`}>
                    {health.dbStatus}
                  </span>
                </div>
                {health.dbLatency && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Database Latency</span>
                    <span className="font-semibold">{health.dbLatency}</span>
                  </div>
                )}
                {health.uptime && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Server Uptime</span>
                    <span className="font-semibold">{health.uptime}</span>
                  </div>
                )}
                {health.memoryUsage && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Memory Usage</span>
                    <span className="font-semibold">{health.memoryUsage}</span>
                  </div>
                )}
                {health.cpuUsage && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">CPU Usage</span>
                    <span className="font-semibold">{health.cpuUsage}</span>
                  </div>
                )}
                {health.environment && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Environment</span>
                    <span className="font-semibold">{health.environment}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{log.action}</p>
                      {log.metadata?.email && (
                        <p className="text-xs text-muted-foreground mt-1">
                          User: {log.metadata.email}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}






