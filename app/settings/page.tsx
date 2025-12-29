'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Palette,
  Target,
  Shield,
  HelpCircle,
  FileText,
  ChevronRight,
  LogOut,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Vibrate,
  Sun,
  Moon,
  Monitor,
  Sunset,
  Contrast,
  Zap,
  Users,
  UserCheck,
  School,
  Ban,
  Globe,
  MessageSquare,
  Settings as SettingsIcon,
  X,
  AlertCircle,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useAuthStore } from '@/store/auth-store';
import { useSettingsStore } from '@/store/settings-store';
import { logoutUser, updateProfile, getCurrentUser } from '@/lib/api/auth';
import { Navbar } from '@/components/navbar';
import { BottomNav } from '@/components/bottom-nav';
import { SimpleFooter } from '@/components/simple-footer';
import { QuickNav } from '@/components/quick-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFocusTopics, getStudyGoals, DEFAULT_FOCUS_TOPICS, DEFAULT_STUDY_GOALS, removeFocusTopic, removeStudyGoal } from '@/lib/focus-data';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { validateImageFile, resizeAndCompressImage } from '@/lib/image-utils';

export default function SettingsPage() {
  useAuthGuard();
  const router = useRouter();
  const { theme: nextTheme, setTheme: setNextTheme } = useTheme();
  const { user, logout: clearAuth, updateUser } = useAuthStore();
  
  // Refresh user data on mount to ensure verification status is up to date
  useEffect(() => {
    const refreshUser = async () => {
      try {
        const response = await getCurrentUser();
        updateUser(response.user);
      } catch (error) {
        // Silently fail - user might not be authenticated
        console.log('Failed to refresh user data:', error);
      }
    };
    refreshUser();
  }, [updateUser]);
  const { notifications, theme: themeSettings, focus, privacy, updateNotifications, updateTheme, updateFocus, updatePrivacy } = useSettingsStore();
  
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    // First try to get from user object (backend), then localStorage (fallback)
    if (user?.avatarUrl) return user.avatarUrl;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_avatar_url') || null;
    }
    return null;
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(avatarUrl);

  // Sync avatar from user object and localStorage on mount
  // 🔧 CRITICAL FIX: Avatar Privacy - Only use user.avatarUrl from database
  useEffect(() => {
    if (user?.avatarUrl) {
      setAvatarUrl(user.avatarUrl);
      setAvatarPreview(user.avatarUrl);
    }
    // REMOVED: localStorage caching (privacy fix)
    // Avatar must ONLY come from authenticated user's database record
    // NEVER cache globally across users
  }, [user?.avatarUrl]);

  const handleLogout = async () => {
    clearAuth();
    try {
      await logoutUser();
    } catch (error) {
      console.log('Logout API call failed:', error);
    }
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const handleSaveProfile = async () => {
    try {
      // Check if user is authenticated
      if (!user) {
        toast.error('Not authenticated', {
          description: 'Please log in again',
        });
        router.push('/login');
        return;
      }

      // Check if token exists
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (!token) {
          toast.error('Session expired', {
            description: 'Please log in again',
          });
          clearAuth();
          router.push('/login');
          return;
        }
      }

      // Update profile in backend
      const response = await updateProfile({
        name: profileData.name,
        email: profileData.email,
        phoneNumber: profileData.phone,
        avatarUrl: avatarUrl || undefined,
      });

      // Update auth store with new user data
      const { updateUser } = useAuthStore.getState();
      updateUser(response.user);

      // 🔧 REMOVED: localStorage avatar caching (privacy fix)
      // Avatar updates propagate through Zustand store only

      // Dispatch custom event to update navbar avatar
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('avatarUpdated'));
      }

      toast.success('Profile updated successfully');
      setEditingProfile(false);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      
      // Handle 401 specifically
      if (error.response?.status === 401) {
        toast.error('Session expired', {
          description: 'Please log in again to continue',
        });
        // Clear auth and redirect
        clearAuth();
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          localStorage.removeItem('auth-storage');
        }
        router.push('/login');
        return;
      }
      
      toast.error('Failed to update profile', {
        description: error.response?.data?.message || error.message || 'Please try again',
      });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid image file');
      return;
    }

    // Show loading toast
    const loadingToast = toast.loading('Processing and auto-fitting image...');

    try {
      // Auto-fit and compress image - square format for avatar
      // Use very small size and aggressive compression to avoid "request entity too large" error
      // Base64 encoding adds ~33% overhead, so target 50KB = ~67KB base64
      const processedImage = await resizeAndCompressImage(file, {
        maxWidth: 256, // Small square avatar size to minimize base64 size
        maxHeight: 256,
        quality: 0.65, // Lower quality for much smaller file size
        maxSizeKB: 50, // Very small target (will be ~67KB as base64)
      });

      // Set preview and URL immediately
      setAvatarPreview(processedImage);
      setAvatarUrl(processedImage);

      toast.dismiss(loadingToast);
      toast.success('Avatar ready! Click Save to apply.', {
        description: 'Image has been auto-fitted and optimized',
      });
    } catch (error) {
      console.error('Image processing error:', error);
      toast.dismiss(loadingToast);
      toast.error('Failed to process image', {
        description: error instanceof Error ? error.message : 'Please try another image',
      });
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      // Update backend to remove avatar
      const response = await updateProfile({ avatarUrl: undefined });
      
      // Update auth store
      const { updateUser } = useAuthStore.getState();
      updateUser(response.user);

      setAvatarUrl(null);
      setAvatarPreview(null);
      // 🔧 REMOVED: localStorage operations (privacy fix)
      // Avatar state managed through Zustand only
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('avatarUpdated'));
      }
      toast.success('Avatar removed');
    } catch (error: any) {
      console.error('Failed to remove avatar:', error);
      toast.error('Failed to remove avatar');
    }
  };

  const handleDeleteFocusTopic = (topic: string) => {
    removeFocusTopic(topic);
    toast.success(`Removed "${topic}" from your focus topics`);
    // Force re-render by toggling section
    setActiveSection(null);
    setTimeout(() => setActiveSection('focus'), 100);
  };

  const handleDeleteStudyGoal = (goal: string) => {
    removeStudyGoal(goal);
    toast.success(`Removed "${goal}" from your study goals`);
    // Force re-render by toggling section
    setActiveSection(null);
    setTimeout(() => setActiveSection('focus'), 100);
  };

  const settingsSections = [
    {
      id: 'account',
      title: 'Account Settings',
      icon: User,
      description: 'Manage basic account info',
    },
    {
      id: 'notifications',
      title: 'Notification Settings',
      icon: Bell,
      description: 'Control app reminders & prompts',
    },
    {
      id: 'theme',
      title: 'Theme & Accessibility',
      icon: Palette,
      description: 'Support comfort & focus',
    },
    {
      id: 'focus',
      title: 'Focus & Study Preferences',
      icon: Target,
      description: 'Customize your focus experience',
    },
    {
      id: 'privacy',
      title: 'Privacy & Visibility',
      icon: Shield,
      description: 'Control matching & visibility',
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: HelpCircle,
      description: 'Quick assistance for users',
    },
    {
      id: 'legal',
      title: 'Legal',
      icon: FileText,
      description: 'Terms, Privacy, Data Usage',
    },
  ];

  return (
    <>
      <Navbar />
      <QuickNav showBack={true} showHome={true} />
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

        <div className="relative z-10 px-4 sm:px-6 pb-24 pt-6">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 sm:gap-6">
          {/* Header */}
          <GlassCard delay={0} className="p-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent flex items-center gap-3">
                <SettingsIcon className="h-8 w-8 text-indigo-600" />
                Settings
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your account, preferences, and app settings
              </p>
            </div>
          </GlassCard>

          {/* Settings Sections */}
          <div className="space-y-4">
            {/* 1. Account Settings */}
            <GlassCard delay={0.1}>
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <CardTitle>Account Settings</CardTitle>
                        <CardDescription>Manage basic account info</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveSection(activeSection === 'account' ? null : 'account')}
                    >
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 transition-transform',
                          activeSection === 'account' && 'rotate-90'
                        )}
                      />
                    </Button>
                  </div>
                </CardHeader>
                {activeSection === 'account' && (
                  <CardContent className="space-y-6 pt-0">
                    {/* Profile Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Edit Profile</h3>
                        {!editingProfile ? (
                          <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>
                            Edit
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setEditingProfile(false)}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleSaveProfile}>
                              Save
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {avatarPreview ? (
                              <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-indigo-200 dark:border-indigo-800">
                                <img
                                  src={avatarPreview}
                                  alt="Profile avatar"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-600 via-blue-500 to-sky-400 flex items-center justify-center text-white text-2xl font-bold border-2 border-indigo-200 dark:border-indigo-800">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                            )}
                            {editingProfile && (
                              <label className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg">
                                <Upload className="h-4 w-4 text-white" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleAvatarUpload}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Profile Avatar</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {avatarPreview ? 'Custom avatar' : 'Auto-generated from your name'}
                            </p>
                            {editingProfile && avatarPreview && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveAvatar}
                                className="mt-2 text-xs text-red-600 hover:text-red-700"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                        {editingProfile && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            <p>Click the upload icon to change your avatar</p>
                            <p>Max size: 50MB (will be compressed automatically). Supported formats: JPG, PNG, GIF, WebP</p>
                          </div>
                        )}
                      </div>

                      {/* Name */}
                      <div className="space-y-2">
                        <Label>Name</Label>
                        {editingProfile ? (
                          <Input
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm text-slate-700 dark:text-slate-300 py-2">{user?.name}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label>Email</Label>
                        {editingProfile ? (
                          <Input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm text-slate-700 dark:text-slate-300 py-2">{user?.email}</p>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <Label>
                          Phone <span className="text-slate-400">(optional)</span>
                        </Label>
                        {editingProfile ? (
                          <Input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            placeholder="+1234567890"
                          />
                        ) : (
                          <p className="text-sm text-slate-700 dark:text-slate-300 py-2">
                            {user?.phoneNumber || 'Not set'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/change-password')}>
                        <Lock className="mr-2 h-4 w-4" />
                        Change Password
                      </Button>
                      <Button variant="outline" className="w-full justify-start" disabled>
                        <Mail className="mr-2 h-4 w-4" />
                        Manage Login Methods
                        <span className="ml-auto text-xs text-slate-400">Coming soon</span>
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full justify-start"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            </GlassCard>

            {/* 2. Notification Settings */}
            <GlassCard delay={0.2}>
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle>Notification Settings</CardTitle>
                        <CardDescription>Control app reminders & prompts</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveSection(activeSection === 'notifications' ? null : 'notifications')}
                    >
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 transition-transform',
                          activeSection === 'notifications' && 'rotate-90'
                        )}
                      />
                    </Button>
                  </div>
                </CardHeader>
                {activeSection === 'notifications' && (
                  <CardContent className="space-y-4 pt-0">
                    <ToggleSetting
                      label="Session Reminders"
                      description="Get notified about upcoming sessions"
                      value={notifications.sessionReminders}
                      onChange={(val) => updateNotifications({ sessionReminders: val })}
                    />
                    {notifications.sessionReminders && (
                      <div className="ml-8 space-y-2">
                        <Label>Remind me before session</Label>
                        <select
                          value={notifications.reminderBeforeSession}
                          onChange={(e) => updateNotifications({ reminderBeforeSession: parseInt(e.target.value) })}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value={5}>5 minutes</option>
                          <option value={10}>10 minutes</option>
                          <option value={15}>15 minutes</option>
                        </select>
                      </div>
                    )}
                    <ToggleSetting
                      label="Daily Productivity Reminders"
                      description="Receive daily motivation and tips"
                      value={notifications.dailyProductivityReminders}
                      onChange={(val) => updateNotifications({ dailyProductivityReminders: val })}
                    />
                    <ToggleSetting
                      label="Evening Reflection Reminder"
                      description="Get reminded to reflect on your day"
                      value={notifications.eveningReflectionReminder}
                      onChange={(val) => updateNotifications({ eveningReflectionReminder: val })}
                    />
                    <ToggleSetting
                      label="Streak Motivation"
                      description="Get notified about your focus streaks"
                      value={notifications.streakMotivation}
                      onChange={(val) => updateNotifications({ streakMotivation: val })}
                    />
                    <div className="border-t pt-4 space-y-3">
                      <ToggleSetting
                        label="Sound"
                        icon={notifications.soundEnabled ? Volume2 : VolumeX}
                        value={notifications.soundEnabled}
                        onChange={(val) => updateNotifications({ soundEnabled: val })}
                      />
                      <ToggleSetting
                        label="Vibration"
                        icon={Vibrate}
                        value={notifications.vibrationEnabled}
                        onChange={(val) => updateNotifications({ vibrationEnabled: val })}
                      />
                    </div>
                    <div className="border-t pt-4 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Volume2 className="h-4 w-4 text-slate-500" />
                            <Label className="text-sm font-medium">Session Sounds</Label>
                          </div>
                          <ToggleSetting
                            label=""
                            value={notifications.sessionSoundEnabled}
                            onChange={(val) => updateNotifications({ sessionSoundEnabled: val })}
                          />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                          Play sounds when sessions end, countdown, or tasks complete
                        </p>
                        {notifications.sessionSoundEnabled && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs text-slate-600 dark:text-slate-400">Volume</Label>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {notifications.sessionSoundVolume}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={notifications.sessionSoundVolume}
                              onChange={(e) => updateNotifications({ sessionSoundVolume: parseInt(e.target.value) })}
                              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </GlassCard>

            {/* 3. Theme & Accessibility */}
            <GlassCard delay={0.3}>
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <CardTitle>Theme & Accessibility</CardTitle>
                        <CardDescription>Support comfort & focus</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveSection(activeSection === 'theme' ? null : 'theme')}
                    >
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 transition-transform',
                          activeSection === 'theme' && 'rotate-90'
                        )}
                      />
                    </Button>
                  </div>
                </CardHeader>
                {activeSection === 'theme' && (
                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'light', label: 'Light', icon: Sun },
                          { value: 'dark', label: 'Dark', icon: Moon },
                          { value: 'true-tone', label: 'True Tone', icon: Monitor },
                          { value: 'night-shift', label: 'Night Shift', icon: Sunset },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              updateTheme({ theme: option.value as any });
                              // Sync with next-themes for light/dark
                              if (option.value === 'light' || option.value === 'dark') {
                                setNextTheme(option.value);
                              } else {
                                // For true-tone and night-shift, apply custom class
                                if (typeof window !== 'undefined') {
                                  document.documentElement.classList.remove('light', 'dark', 'true-tone', 'night-shift');
                                  document.documentElement.classList.add(option.value);
                                  // Set next-themes to light as base
                                  setNextTheme('light');
                                }
                              }
                            }}
                            className={cn(
                              'flex items-center gap-2 rounded-lg border-2 p-3 transition-all hover:scale-105',
                              themeSettings.theme === option.value
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 shadow-md'
                                : 'border-slate-200 dark:border-slate-700'
                            )}
                          >
                            <option.icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="border-t pt-4 space-y-3">
                      <div className="space-y-2">
                        <Label>Text Size</Label>
                        <div className="flex gap-2">
                          {['small', 'medium', 'large'].map((size) => (
                            <button
                              key={size}
                              onClick={() => {
                                updateTheme({ fontSize: size as any });
                                if (typeof window !== 'undefined') {
                                  document.documentElement.setAttribute('data-font-size', size);
                                }
                              }}
                              className={cn(
                                'flex-1 rounded-lg border-2 p-2 text-sm font-medium transition-all hover:scale-105',
                                themeSettings.fontSize === size
                                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 shadow-md'
                                  : 'border-slate-200 dark:border-slate-700'
                              )}
                            >
                              {size.charAt(0).toUpperCase() + size.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <ToggleSetting
                        label="High Contrast Mode"
                        icon={Contrast}
                        value={themeSettings.highContrast}
                        onChange={(val) => {
                          updateTheme({ highContrast: val });
                          if (typeof window !== 'undefined') {
                            if (val) {
                              document.documentElement.classList.add('high-contrast');
                            } else {
                              document.documentElement.classList.remove('high-contrast');
                            }
                          }
                        }}
                      />
                      <ToggleSetting
                        label="Reduce Animations"
                        icon={Zap}
                        value={themeSettings.reduceAnimations}
                        onChange={(val) => {
                          updateTheme({ reduceAnimations: val });
                          if (typeof window !== 'undefined') {
                            if (val) {
                              document.documentElement.classList.add('reduce-motion');
                            } else {
                              document.documentElement.classList.remove('reduce-motion');
                            }
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            </GlassCard>

            {/* 4. Focus & Study Preferences */}
            <GlassCard delay={0.4}>
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                        <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <CardTitle>Focus & Study Preferences</CardTitle>
                        <CardDescription>Customize your focus experience</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveSection(activeSection === 'focus' ? null : 'focus')}
                    >
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 transition-transform',
                          activeSection === 'focus' && 'rotate-90'
                        )}
                      />
                    </Button>
                  </div>
                </CardHeader>
                {activeSection === 'focus' && (
                  <CardContent className="space-y-6 pt-0">
                    <div className="space-y-2">
                      <Label>Default Session Duration</Label>
                      <div className="flex gap-3">
                        {[25, 50, 'custom'].map((duration) => (
                          <button
                            key={duration}
                            onClick={() => updateFocus({ defaultDuration: duration as any })}
                            className={cn(
                              'flex-1 rounded-lg border-2 p-3 text-center transition-all',
                              focus.defaultDuration === duration
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30'
                                : 'border-slate-200 dark:border-slate-700'
                            )}
                          >
                            {duration === 'custom' ? 'Custom' : `${duration} min`}
                          </button>
                        ))}
                      </div>
                      {focus.defaultDuration === 'custom' && (
                        <Input
                          type="number"
                          placeholder="Enter minutes"
                          value={focus.customDuration || ''}
                          onChange={(e) => updateFocus({ customDuration: parseInt(e.target.value) || undefined })}
                          className="mt-2"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Default Mode</Label>
                      <div className="flex gap-3">
                        {[
                          { value: 'solo', label: 'Solo', icon: User },
                          { value: 'partner', label: 'Partner', icon: Users },
                          { value: 'ask', label: 'Ask Every Time', icon: HelpCircle },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => updateFocus({ defaultMode: option.value as any })}
                            className={cn(
                              'flex-1 flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all',
                              focus.defaultMode === option.value
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30'
                                : 'border-slate-200 dark:border-slate-700'
                            )}
                          >
                            <option.icon className="h-4 w-4" />
                            <span className="text-xs font-medium">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="border-t pt-4 space-y-4">
                      <div>
                        <Label className="mb-2 block">Saved Focus Topics</Label>
                        <FocusTopicsManager onDelete={handleDeleteFocusTopic} />
                      </div>
                      <div>
                        <Label className="mb-2 block">Saved Study Goals</Label>
                        <StudyGoalsManager onDelete={handleDeleteStudyGoal} />
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </GlassCard>

            {/* 5. Privacy & Visibility */}
            <GlassCard delay={0.5}>
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <CardTitle>Privacy & Visibility</CardTitle>
                        <CardDescription>Control matching & visibility</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveSection(activeSection === 'privacy' ? null : 'privacy')}
                    >
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 transition-transform',
                          activeSection === 'privacy' && 'rotate-90'
                        )}
                      />
                    </Button>
                  </div>
                </CardHeader>
                {activeSection === 'privacy' && (
                  <CardContent className="space-y-4 pt-0">
                    <ToggleSetting
                      label="Show My Availability"
                      description="Let others know you're available for sessions"
                      value={privacy.showAvailability}
                      onChange={(val) => updatePrivacy({ showAvailability: val })}
                    />
                    <ToggleSetting
                      label="Allow Partner Matching"
                      description="Enable matching with other users"
                      value={privacy.allowPartnerMatching}
                      onChange={(val) => updatePrivacy({ allowPartnerMatching: val })}
                    />
                    {privacy.allowPartnerMatching && (
                      <div className="ml-8 space-y-2">
                        <Label>Matching Preference</Label>
                        <div className="space-y-2">
                          {[
                            { value: 'anyone', label: 'Anyone', icon: Globe },
                            { value: 'verified', label: 'Verified Students Only', icon: UserCheck },
                            { value: 'same-school', label: 'Same School', icon: School },
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => updatePrivacy({ matchingPreference: option.value as any })}
                              className={cn(
                                'w-full flex items-center gap-3 rounded-lg border-2 p-3 transition-all',
                                privacy.matchingPreference === option.value
                                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30'
                                  : 'border-slate-200 dark:border-slate-700'
                              )}
                            >
                              <option.icon className="h-4 w-4" />
                              <span className="text-sm font-medium">{option.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="border-t pt-4 space-y-3">
                      <ToggleSetting
                        label="Online Status Visible"
                        icon={privacy.onlineStatusVisible ? Eye : EyeOff}
                        value={privacy.onlineStatusVisible}
                        onChange={(val) => updatePrivacy({ onlineStatusVisible: val })}
                      />
                      <ToggleSetting
                        label="Allow Messages During Sessions"
                        icon={MessageSquare}
                        value={privacy.allowMessages}
                        onChange={(val) => updatePrivacy({ allowMessages: val })}
                      />
                      <Button variant="outline" className="w-full justify-start">
                        <Ban className="mr-2 h-4 w-4" />
                        Blocked Users List
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            </GlassCard>

            {/* 6. Help & Support */}
            <GlassCard delay={0.6}>
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                        <HelpCircle className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                      </div>
                      <div>
                        <CardTitle>Help & Support</CardTitle>
                        <CardDescription>Quick assistance for users</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveSection(activeSection === 'help' ? null : 'help')}
                    >
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 transition-transform',
                          activeSection === 'help' && 'rotate-90'
                        )}
                      />
                    </Button>
                  </div>
                </CardHeader>
                {activeSection === 'help' && (
                  <CardContent className="space-y-3 pt-0">
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Support
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      FAQ
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Report a Problem
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      App Feedback
                    </Button>
                  </CardContent>
                )}
              </Card>
            </GlassCard>

            {/* 7. Legal */}
            <GlassCard delay={0.7}>
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <CardTitle>Legal</CardTitle>
                        <CardDescription>Terms, Privacy, Data Usage</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveSection(activeSection === 'legal' ? null : 'legal')}
                    >
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 transition-transform',
                          activeSection === 'legal' && 'rotate-90'
                        )}
                      />
                    </Button>
                  </div>
                </CardHeader>
                {activeSection === 'legal' && (
                  <CardContent className="space-y-3 pt-0">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Terms of Service
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="mr-2 h-4 w-4" />
                      Privacy Policy
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Data Usage Policy
                    </Button>
                  </CardContent>
                )}
              </Card>
            </GlassCard>
          </div>
          </div>
        </div>
      </div>
      <BottomNav />
      <SimpleFooter variant="auth" />
    </>
  );
}

// Toggle Setting Component
function ToggleSetting({
  label,
  description,
  icon: Icon,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-4 w-4 text-slate-500" />}
        <div>
          <p className="text-sm font-medium">{label}</p>
          {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          value ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            value ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

// Focus Topics Manager Component
function FocusTopicsManager({ onDelete }: { onDelete: (topic: string) => void }) {
  const [topics, setTopics] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const allTopics = getFocusTopics();
    // Filter out default topics, show only custom ones
    const customTopics = allTopics.filter(
      (topic) => !DEFAULT_FOCUS_TOPICS.includes(topic)
    );
    setTopics(customTopics);
  }, []);

  const displayTopics = showAll ? topics : topics.slice(0, 5);

  if (topics.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No custom focus topics yet</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {displayTopics.map((topic) => (
          <div
            key={topic}
            className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-sm"
          >
            <span>{topic}</span>
            <button
              onClick={() => onDelete(topic)}
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      {topics.length > 5 && (
        <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show Less' : `Show All (${topics.length})`}
        </Button>
      )}
    </div>
  );
}

// Study Goals Manager Component
function StudyGoalsManager({ onDelete }: { onDelete: (goal: string) => void }) {
  const [goals, setGoals] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const allGoals = getStudyGoals();
    // Filter out default goals, show only custom ones
    const customGoals = allGoals.filter(
      (goal) => !DEFAULT_STUDY_GOALS.includes(goal)
    );
    setGoals(customGoals);
  }, []);

  const displayGoals = showAll ? goals : goals.slice(0, 5);

  if (goals.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No custom study goals yet</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {displayGoals.map((goal) => (
          <div
            key={goal}
            className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-sm"
          >
            <span>{goal}</span>
            <button
              onClick={() => onDelete(goal)}
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      {goals.length > 5 && (
        <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show Less' : `Show All (${goals.length})`}
        </Button>
      )}
    </div>
  );
}

