'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, Edit3, Trophy } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useAnalytics } from '@/hooks/use-analytics';
import { logoutUser } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

/**
 * InfoTile Component - Reusable info display component
 */
function InfoTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'success' | 'warning';
}) {
  const accentColor =
    accent === 'success'
      ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20'
      : accent === 'warning'
        ? 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20'
        : 'text-slate-900 dark:text-white';

  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className={`mt-1 text-base font-medium ${accentColor}`}>{value}</p>
    </div>
  );
}

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const router = useRouter();
  const { user, logout: clearAuth } = useAuthStore();
  const analytics = useAnalytics();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Ensure achievements is always an array
  const achievements = Array.isArray(analytics?.achievements) ? analytics.achievements : [];

  useEffect(() => {
    if (isOpen) {
      // Load avatar: priority user.avatarUrl (backend) > localStorage (fallback)
      // 🔧 CRITICAL FIX: Only use user.avatarUrl from authenticated user
      const avatar = user?.avatarUrl || null;
      setAvatarUrl(avatar);
    }
  }, [isOpen, user]);

  const handleLogout = async () => {
    try {
      clearAuth();
      await logoutUser();
      toast.success('Logged out successfully');
      router.push('/login');
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
      clearAuth();
      router.push('/login');
      onClose();
    }
  };

  const handleEditProfile = () => {
    router.push('/settings');
    onClose();
  };

  // Use analytics data
  const userLevel = analytics.level;
  const userStreak = analytics.currentStreak;
  const userName = user?.name ?? 'User';
  const userInitials = user?.name?.charAt(0).toUpperCase() ?? 'U';
  const daysActive = analytics.daysActive;
  const totalFocusTime = analytics.totalFocusTime;
  const goalsAchieved = 0; // Not implemented yet
  const loading = analytics.isLoading;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col"
            style={{ minHeight: '100vh' }}
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Profile</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content - ALWAYS RENDERED */}
            <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
              <div className="px-6 py-6 space-y-6">
                {/* User Info Block */}
                <div className="flex items-start gap-4">
                  {avatarUrl ? (
                    <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-indigo-200 dark:border-indigo-800 flex-shrink-0">
                      <img
                        src={avatarUrl}
                        alt={userName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 via-blue-500 to-sky-400 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                      {userInitials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold truncate">{userName}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Student • Focusmate Member
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Level {userLevel}
                      </span>
                      {userStreak > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {userStreak}-day streak
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          No streak yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Days Active */}
                  <Card className="border border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {loading ? '...' : daysActive}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Days Active
                      </div>
                      {!loading && daysActive === 0 && (
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          None yet
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Total Focus Time */}
                  <Card className="border border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {loading ? '...' : `${totalFocusTime}h`}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Total Focus Time
                      </div>
                      {!loading && totalFocusTime === 0 && (
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          None yet
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Habits Completed */}
                  <Card className="border border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        0
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Habits Completed
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        None yet
                      </div>
                    </CardContent>
                  </Card>

                  {/* Goals Achieved */}
                  <Card className="border border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {loading ? '...' : goalsAchieved}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Goals Achieved
                      </div>
                      {!loading && goalsAchieved === 0 && (
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          None yet
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Account Information Section */}
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Account information
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Synced with your Focusmate profile
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoTile label="Email" value={user?.email ?? '—'} />
                    <InfoTile label="Role" value={user?.role ?? '—'} />
                    <InfoTile
                      label="Email status"
                      value={user?.isEmailVerified ? 'Verified' : 'Not verified yet'}
                      accent={user?.isEmailVerified ? 'success' : 'warning'}
                    />
                    <InfoTile
                      label="Member since"
                      value={
                        user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : '—'
                      }
                    />
                  </div>
                </div>

                {/* Achievements Section */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Achievements</h3>
                  {achievements.length === 0 ? (
                    <div className="text-center py-8 px-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <Trophy className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                        No achievements yet.
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        Keep focusing to unlock badges
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {achievements.map((achievement) => (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-center"
                        >
                          <div className="text-3xl mb-2">{achievement.icon}</div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white mb-1">
                            {achievement.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {achievement.description}
                          </p>
                          {achievement.earnedAt && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                              {new Date(achievement.earnedAt).toLocaleDateString()}
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800 pb-6">
                  <Button
                    onClick={handleEditProfile}
                    variant="outline"
                    className="w-full"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
