'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { motion } from 'framer-motion';
import { getSystemHealth, testEmailService, type SystemHealth } from '@/lib/api/admin';
import { CheckCircle2, XCircle, AlertCircle, Mail, Database, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingDB, setTestingDB] = useState(false);

  useEffect(() => {
    async function loadHealth() {
      try {
        const data = await getSystemHealth();
        setHealth(data);
      } catch (error: any) {
        console.error('Failed to load system health:', error);
        // Set error state so UI can display it
        setHealth({
          dbStatus: 'unknown',
          error: 'Unable to load system health',
          timestamp: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    }
    loadHealth();
    
    // Refresh health every 30 seconds
    const interval = setInterval(loadHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      await testEmailService();
      toast.success('Email test successful');
    } catch (error: any) {
      toast.error(error.message || 'Email test failed');
    } finally {
      setTestingEmail(false);
    }
  };

  const handleTestDB = async () => {
    setTestingDB(true);
    try {
      const data = await getSystemHealth();
      if (data.dbStatus === 'connected') {
        toast.success(`Database connection successful (${data.dbLatency || 'N/A'})`);
      } else {
        toast.error('Database connection failed');
      }
      setHealth(data);
    } catch (error) {
      toast.error('Database test failed');
    } finally {
      setTestingDB(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading settings...</div>;
  }

  const isHealthy = health?.dbStatus === 'connected';

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
          <GlassCard delay={0} className="p-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">Admin Settings</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                System configuration and health monitoring
              </p>
            </div>
          </GlassCard>

          <GlassCard delay={0.1}>
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                  System Health
                  {isHealthy ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
          {health ? (
            <div className="space-y-4">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Database Status</p>
                  <p className={`text-lg font-semibold ${
                    health.dbStatus === 'connected' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {health.dbStatus}
                  </p>
                </div>
                {health.dbLatency && (
                  <div>
                    <p className="text-sm text-muted-foreground">Database Latency</p>
                    <p className="text-lg font-semibold">{health.dbLatency}</p>
                  </div>
                )}
                {health.uptime && (
                  <div>
                    <p className="text-sm text-muted-foreground">Server Uptime</p>
                    <p className="text-lg font-semibold">{health.uptime}</p>
                  </div>
                )}
                {health.memoryUsage && (
                  <div>
                    <p className="text-sm text-muted-foreground">Memory Usage</p>
                    <p className="text-lg font-semibold">{health.memoryUsage}</p>
                  </div>
                )}
                {health.cpuUsage && (
                  <div>
                    <p className="text-sm text-muted-foreground">CPU Usage</p>
                    <p className="text-lg font-semibold">{health.cpuUsage}</p>
                  </div>
                )}
                {health.environment && (
                  <div>
                    <p className="text-sm text-muted-foreground">Environment</p>
                    <p className="text-lg font-semibold">{health.environment}</p>
                  </div>
                )}
              </div>
              {health.error && (
                <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <p className="font-semibold">Error</p>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {health.error}
                  </p>
                </div>
              )}
                </div>
              ) : (
                <p className="text-muted-foreground">Unable to load system health</p>
              )}
              </CardContent>
            </Card>
          </GlassCard>

          <GlassCard delay={0.2}>
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">Service Status</CardTitle>
              </CardHeader>
              <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email Service</p>
                  <p className="text-sm text-muted-foreground">Test email sending functionality</p>
                </div>
              </div>
                <AnimatedButton
                  variant="outline"
                  onClick={handleTestEmail}
                  disabled={testingEmail}
                >
                  {testingEmail ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Test Email
                    </>
                  )}
                </AnimatedButton>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Database Connection</p>
                    <p className="text-sm text-muted-foreground">Test database connectivity</p>
                  </div>
                </div>
                <AnimatedButton
                  variant="outline"
                  onClick={handleTestDB}
                  disabled={testingDB}
                >
                  {testingDB ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Test DB
                    </>
                  )}
                </AnimatedButton>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">OpenAI API</p>
                <p className="text-sm text-muted-foreground">API key status</p>
              </div>
              <span className="text-sm text-muted-foreground">Not configured</span>
              </div>
            </div>
              </CardContent>
            </Card>
          </GlassCard>

          <GlassCard delay={0.3}>
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">System Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">System Version</span>
                    <span className="font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Environment</span>
                    <span className="font-medium">{health?.environment || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Node Version</span>
                    <span className="font-medium">{typeof process !== 'undefined' ? process.version : 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </GlassCard>
        </div>
      </div>
    </>
  );
}










