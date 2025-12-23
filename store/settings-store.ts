import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationSettings {
  sessionReminders: boolean;
  reminderBeforeSession: number; // minutes before
  dailyProductivityReminders: boolean;
  eveningReflectionReminder: boolean;
  streakMotivation: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

interface ThemeSettings {
  theme: 'light' | 'dark' | 'true-tone' | 'night-shift';
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reduceAnimations: boolean;
}

interface FocusPreferences {
  defaultDuration: 25 | 50 | 'custom';
  customDuration?: number;
  defaultMode: 'solo' | 'partner' | 'ask';
}

interface PrivacySettings {
  showAvailability: boolean;
  allowPartnerMatching: boolean;
  matchingPreference: 'anyone' | 'verified' | 'same-school';
  onlineStatusVisible: boolean;
  allowMessages: boolean;
}

interface SettingsState {
  notifications: NotificationSettings;
  theme: ThemeSettings;
  focus: FocusPreferences;
  privacy: PrivacySettings;
  
  // Actions
  updateNotifications: (settings: Partial<NotificationSettings>) => void;
  updateTheme: (settings: Partial<ThemeSettings>) => void;
  updateFocus: (settings: Partial<FocusPreferences>) => void;
  updatePrivacy: (settings: Partial<PrivacySettings>) => void;
}

const defaultNotifications: NotificationSettings = {
  sessionReminders: true,
  reminderBeforeSession: 5,
  dailyProductivityReminders: true,
  eveningReflectionReminder: true,
  streakMotivation: true,
  soundEnabled: true,
  vibrationEnabled: true,
};

const defaultTheme: ThemeSettings = {
  theme: 'light',
  fontSize: 'medium',
  highContrast: false,
  reduceAnimations: false,
};

const defaultFocus: FocusPreferences = {
  defaultDuration: 25,
  defaultMode: 'ask',
};

const defaultPrivacy: PrivacySettings = {
  showAvailability: true,
  allowPartnerMatching: true,
  matchingPreference: 'anyone',
  onlineStatusVisible: true,
  allowMessages: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notifications: defaultNotifications,
      theme: defaultTheme,
      focus: defaultFocus,
      privacy: defaultPrivacy,

      updateNotifications: (settings) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),

      updateTheme: (settings) =>
        set((state) => ({
          theme: { ...state.theme, ...settings },
        })),

      updateFocus: (settings) =>
        set((state) => ({
          focus: { ...state.focus, ...settings },
        })),

      updatePrivacy: (settings) =>
        set((state) => ({
          privacy: { ...state.privacy, ...settings },
        })),
    }),
    {
      name: 'settings-storage',
    }
  )
);
















