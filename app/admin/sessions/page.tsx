'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { getAllSessions, type Session } from '@/lib/api/admin';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

function formatDuration(seconds?: number): string {
  if (!seconds) return '-';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function exportToCSV(sessions: Session[]) {
  const headers = ['Session ID', 'User A ID', 'User B ID', 'Start Time', 'End Time', 'Duration (minutes)', 'Task ID', 'Notes Count'];
  const rows = sessions.map(session => [
    session.id,
    session.userAId || '',
    session.userBId || '',
    session.startTime ? new Date(session.startTime).toISOString() : '',
    session.endTime ? new Date(session.endTime).toISOString() : '',
    session.duration ? Math.floor(session.duration / 60).toString() : '',
    session.taskId || '',
    (session.notesCount || 0).toString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sessions-export-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  toast.success('Sessions exported to CSV');
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    async function loadSessions() {
      try {
        const data = await getAllSessions();
        setSessions(data);
      } catch (error: any) {
        console.error('Failed to load sessions:', error);
        toast.error('Failed to load sessions. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  const filteredSessions = useMemo(() => {
    if (!startDate && !endDate) return sessions;

    return sessions.filter(session => {
      if (!session.startTime) return false;
      const sessionDate = new Date(session.startTime);
      
      if (startDate && sessionDate < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (sessionDate > end) return false;
      }
      
      return true;
    });
  }, [sessions, startDate, endDate]);

  if (loading) {
    return <div className="text-center py-12">Loading sessions...</div>;
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

      <div className="relative z-10 space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">Sessions Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            View and manage all study sessions
          </p>
        </motion.div>

      {/* Filters */}
        <GlassCard delay={0.1}>
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
          </Card>
        </GlassCard>

        <GlassCard delay={0.15}>
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            All Sessions ({filteredSessions.length})
            {(startDate || endDate) && <span className="text-sm font-normal text-muted-foreground ml-2">(filtered)</span>}
          </CardTitle>
          <Button
            variant="outline"
            onClick={() => exportToCSV(filteredSessions)}
            disabled={filteredSessions.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-medium">Session ID</th>
                  <th className="text-left p-3 text-sm font-medium">User A</th>
                  <th className="text-left p-3 text-sm font-medium">User B</th>
                  <th className="text-left p-3 text-sm font-medium">Start Time</th>
                  <th className="text-left p-3 text-sm font-medium">End Time</th>
                  <th className="text-left p-3 text-sm font-medium">Duration</th>
                  <th className="text-left p-3 text-sm font-medium">Task ID</th>
                  <th className="text-left p-3 text-sm font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No sessions found
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((session) => (
                    <tr key={session.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="p-3 font-mono text-xs">{session.id.substring(0, 8)}...</td>
                      <td className="p-3 text-sm">{session.userAId ? session.userAId.substring(0, 8) + '...' : '-'}</td>
                      <td className="p-3 text-sm">{session.userBId ? session.userBId.substring(0, 8) + '...' : '-'}</td>
                      <td className="p-3 text-sm">
                        {session.startTime 
                          ? new Date(session.startTime).toLocaleString()
                          : '-'
                        }
                      </td>
                      <td className="p-3 text-sm">
                        {session.endTime 
                          ? new Date(session.endTime).toLocaleString()
                          : 'Active'
                        }
                      </td>
                      <td className="p-3 text-sm font-medium">
                        {formatDuration(session.duration)}
                      </td>
                      <td className="p-3 text-sm font-mono text-xs">
                        {session.taskId ? session.taskId.substring(0, 8) + '...' : '-'}
                      </td>
                      <td className="p-3 text-sm">{session.notesCount || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}










