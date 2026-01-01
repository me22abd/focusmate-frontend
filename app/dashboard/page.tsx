/**
 * ============================================================================
 * DASHBOARD/PAGE.TSX - MAIN AUTHENTICATED USER DASHBOARD
 * ============================================================================
 * 
 * Purpose: Primary landing page for authenticated users. Displays personalized
 * greeting, analytics overview, quick session start, weekly progress tracking,
 * and account information. Serves as the central hub for all authenticated
 * user activities in Focusmate.
 * 
 * Architecture Role: Main dashboard orchestrating multiple features - analytics
 * display via useAnalytics hook, session initiation flow, email verification
 * prompts, and user profile sync. Protected by useAuthGuard. Gateway to all
 * major features (sessions, analytics, profile).
 * 
 * ============================================================================
 * 📘 CODE ORIGIN (REQUIRED FOR ACADEMIC HONESTY)
 * ============================================================================
 * 
 * a) FRAMEWORK/LIBRARY CODE (Not original):
 * ───────────────────────────────────────────────────────────────────────────
 * - 'use client', useEffect, useMemo, useState    [Lines 1-3]
 * - useRouter, usePathname (Next.js)              [Line 4]
 * - motion from framer-motion                     [Line 5]
 * - Card components (ShadCN UI)                   [Line 15]
 * - Icons (Lucide React)                          [Lines 16-27]
 * 
 * Why Standard: Next.js App Router, React hooks, animation library, UI library
 * 
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * b) ADAPTED PATTERNS:
 * ───────────────────────────────────────────────────────────────────────────
 * - Dashboard layout structure                    [Lines 234-453]
 * - Stats cards pattern                           [Lines 92-121, 294-320]
 * - Framer Motion animations                      [Lines 273-291, 296-318]
 * 
 * Sources:
 * - Dashboard UI patterns (common in analytics apps)
 * - Framer Motion animation examples (docs)
 * - Card-based layouts (ShadCN examples)
 * 
 * What I Customized:
 * 1. Stats Cards: MY specific metrics (sessions, streak, focus time)
 * 2. Animations: MY timing, hover effects, and transitions
 * 3. Layout: MY gradient cards, spacing, shadows
 * 
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * c) MY CUSTOM CODE (100% Original for Focusmate):
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * 1. TIME-BASED GREETING SYSTEM [Lines 133-144, 147-221]:
 *    MY complete implementation of contextual greetings:
 *    - getTimeBasedGreeting: Returns greeting based on hour
 *    - getTimeBasedMessage: 40 unique motivational messages
 *    - 4 time periods: morning (5-12), afternoon (12-17), evening (17-21), night (21-5)
 *    - Seeded randomization (same message all day, changes daily)
 *    - Personalization (incorporates user name length in seed)
 * 
 * 2. USER PROFILE SYNC ON MOUNT [Lines 39-57]:
 *    MY implementation of profile refresh:
 *    - Fetch latest user data on dashboard load
 *    - Update Zustand store with fresh data
 *    - Ensures verification status is current
 *    - Handles 401 gracefully (auth expiry)
 * 
 * 3. RESILIENT LOGOUT HANDLER [Lines 59-74]:
 *    MY implementation of fail-safe logout:
 *    - Clear local state FIRST (guaranteed logout)
 *    - Then try backend API (best effort)
 *    - Silent failure if API fails (token expired is ok)
 *    - Always redirect to login
 * 
 * 4. EMAIL VERIFICATION BANNER [Lines 239-270]:
 *    MY implementation of persistent reminder:
 *    - Animated banner (framer-motion)
 *    - Shows only if email not verified
 *    - Direct action button to verification flow
 *    - Prominent placement (top of dashboard)
 * 
 * 5. ANALYTICS INTEGRATION [Lines 34, 92-121, 123-130]:
 *    MY implementation using useAnalytics hook:
 *    - Stats cards with live data
 *    - Trend indicators (week-over-week changes)
 *    - Weekly progress calculation (current / goal * 100)
 *    - Conditional helper text (personalized based on data)
 * 
 * 6. SESSION INITIATION FLOW [Lines 76-90, 324-353, 445-451]:
 *    MY implementation of session start:
 *    - Modal-based mode selection (SessionModeSelect)
 *    - handleStartSolo: Navigate to setup with solo mode
 *    - handleStartMatching: Navigate to setup with partner mode
 *    - Pass duration via URL params
 * 
 * 7. WEEKLY PROGRESS TRACKER [Lines 123-130, 355-379]:
 *    MY implementation of goal tracking:
 *    - Weekly goal: 300 minutes (5 hours)
 *    - Progress bar visualization
 *    - Percentage calculation with 100% cap
 *    - Motivational helper text
 * 
 * 8. INFOTILE COMPONENT [Lines 456-480]:
 *    MY reusable info display component:
 *    - Accent color support (success/warning)
 *    - Conditional styling based on accent
 *    - Used for account information grid
 * 
 * 9. CUSTOM ANIMATIONS [Lines 273-291, 296-318, 324-353]:
 *    MY animation implementations:
 *    - Staggered card entrance (delay: index * 0.1)
 *    - Hover effects (y: -4, scale: 1.02)
 *    - Tap effects (scale: 0.98)
 *    - Shadow transitions on hover
 * 
 * My Design Decisions:
 * ──────────────────────────────────────────────────────────────────────────
 * ✨ Time-based personalization (contextual greetings, messages)
 * ✨ Seeded randomization (consistent daily message)
 * ✨ Profile sync on mount (always fresh data)
 * ✨ Fail-safe logout (local-first strategy)
 * ✨ Prominent verification prompt (conversion optimization)
 * ✨ Analytics-driven UI (live data integration)
 * ✨ Modal session flow (clear mode selection)
 * ✨ Weekly goal tracking (motivation, gamification)
 * ✨ Staggered animations (polished feel)
 * ✨ Gradient cards (brand identity)
 * 
 * ============================================================================
 * 
 * @author Eromonsele Marvelous
 * @page Frontend/Dashboard
 */

// Framework pattern: Client-side interactivity
'use client';

// Framework imports: React and Next.js
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Adapted: Animation library (framer-motion)
// Custom: MY animation configurations
import { motion } from 'framer-motion';

// Custom: MY auth store and API functions
import { useAuthStore } from '@/store/auth-store';
import { getCurrentUser, logoutUser } from '@/lib/api/auth';

// Custom: MY hooks
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useAnalytics } from '@/hooks/use-analytics';

// Custom: MY components
import { Navbar } from '@/components/navbar';
import { BottomNav } from '@/components/bottom-nav';
import { SimpleFooter } from '@/components/simple-footer';
import { SessionModeSelect } from '@/components/session-mode-select';

// Adapted: ShadCN UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { XPBar, StreakBadge, ProgressRing } from '@/components/gamification';

// Adapted: Icon library (selected icons)
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Clock,
  Loader2,
  Mail,
  Play,
  Target,
  UsersRound,
} from 'lucide-react';

// Adapted: Toast library
import { toast } from 'sonner';
import { evaluateNotifications, type NotificationRecommendation } from '@/lib/api/ai';
import { FocusAICharacter } from '@/components/mascot/FocusAICharacter';
import { Sparkles, AlertTriangle, Zap, TrendingUp } from 'lucide-react';

/**
 * Dashboard Page Component
 * 
 * Framework pattern: export default function (Next.js page)
 * Custom implementation: All logic specific to Focusmate dashboard
 */
export default function DashboardPage() {
  // ===========================================================================
  // ROUTING AND AUTHENTICATION
  // ===========================================================================
  
  const router = useRouter();
  
  // Custom: MY auth guard hook (redirects if not authenticated)
  useAuthGuard();
  
  // Custom: MY auth store
  const { user, logout, updateUser } = useAuthStore();
  
  // Custom: MY analytics hook (fetches and manages analytics data)
  const analytics = useAnalytics();
  
  // ===========================================================================
  // LOCAL STATE MANAGEMENT
  // ===========================================================================
  
  const [isLoading, setIsLoading] = useState(true);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<NotificationRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // ===========================================================================
  // 📘 CODE ORIGIN: User Profile Sync on Mount
  // ===========================================================================
  // Custom implementation by me: Profile refresh strategy
  // 
  // What I Built:
  // Automatically fetch latest user data when dashboard loads.
  // 
  // Why This Is Needed:
  // User might have verified email in another tab/device, or profile might
  // have been updated. Dashboard needs fresh data to show correct verification
  // status, avatar, etc.
  // 
  // My Implementation:
  // - Call getCurrentUser() on mount
  // - Update Zustand store with fresh data
  // - Handle 401 gracefully (means token expired, auth guard handles it)
  // - Set isLoading false to show UI
  // ===========================================================================
  useEffect(() => {
    const fetchUser = async () => {
      // Check if we have a token before making the request
      const hasToken = typeof window !== 'undefined' && localStorage.getItem('access_token');
      const storedUserStr = typeof window !== 'undefined' && localStorage.getItem('user');
      
      console.log('🔍 Dashboard: Checking authentication...');
      console.log('  Token exists:', hasToken ? '✅ Yes' : '❌ No');
      console.log('  User exists:', storedUserStr ? '✅ Yes' : '❌ No');
      
      // Don't redirect here - useAuthGuard already handles this
      // Only check token to decide whether to fetch user data
      if (!hasToken) {
        console.warn('⚠️ Dashboard: No token found, but letting useAuthGuard handle redirect');
        setIsLoading(false);
        return;
      }

      // Log the token (first 20 chars only for security)
      const tokenPreview = hasToken ? hasToken.substring(0, 20) + '...' : 'none';
      console.log('🔑 Dashboard: Token preview:', tokenPreview);

      // If we have token and stored user, use stored user immediately (optimistic)
      // This prevents loading state and allows dashboard to render quickly
      if (hasToken && storedUserStr) {
        try {
          const parsedUser = JSON.parse(storedUserStr);
          console.log('✅ Dashboard: Using cached user data:', parsedUser.email);
          updateUser(parsedUser);
          setIsLoading(false); // Show dashboard immediately with cached data
        } catch (e) {
          console.warn('⚠️ Dashboard: Failed to parse cached user, will fetch fresh');
        }
      }

      // Fetch fresh user data in background (non-blocking)
      try {
        console.log('DASHBOARD: About to call /auth/me...');
        
        // Verify token is still there before making request
        const tokenBeforeRequest = typeof window !== 'undefined' && 
                                  localStorage.getItem('access_token');
        
        console.log('DASHBOARD: token before calling auth/me =', tokenBeforeRequest);
        if (tokenBeforeRequest) {
          console.log('DASHBOARD: token preview =', tokenBeforeRequest.substring(0, 30) + '...');
        }
        
        if (!tokenBeforeRequest) {
          console.error('❌ DASHBOARD: Token disappeared before request!');
          console.error('  This should not happen - token was present earlier');
          useAuthStore.getState().clearAuth();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return;
        }
        
        // Make the request - axios interceptor will add Authorization header
        console.log('DASHBOARD: Calling getCurrentUser() now...');
        const response = await getCurrentUser();
        console.log('✅ DASHBOARD: /auth/me successful!');
        console.log('  User email:', response.user?.email);
        console.log('  User ID:', response.user?.id);
        
        // 🔒 CRITICAL SECURITY: Verify token from /auth/me belongs to logged-in user
        const storedUserId = typeof window !== 'undefined' && localStorage.getItem('last_login_user_id');
        const tokenUserId = response.user?.id;
        
        console.log('═══════════════════════════════════════════════════════════');
        console.log('DASHBOARD: Token Verification');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`  Stored user ID (from last login): ${storedUserId || 'not found'}`);
        console.log(`  Token user ID (from /auth/me): ${tokenUserId}`);
        console.log(`  IDs match? ${storedUserId === tokenUserId ? '✅ YES' : '❌ NO - MISMATCH!'}`);
        
        if (storedUserId && tokenUserId && storedUserId !== tokenUserId) {
          console.error('❌ DASHBOARD: CRITICAL - Token belongs to different user!');
          console.error('  This token is for a different account - clearing and redirecting');
          useAuthStore.getState().clearAuth();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return;
        }
        
        // 🔒 SECURITY: Validate user matches stored user (prevent wrong account)
        const currentStoredUser = useAuthStore.getState().user;
        if (currentStoredUser && response.user.id !== currentStoredUser.id) {
          console.error('❌ DASHBOARD: User mismatch detected! Clearing auth and redirecting...');
          console.error('  Stored user ID:', currentStoredUser.id);
          console.error('  Backend user ID:', response.user.id);
          useAuthStore.getState().clearAuth();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return;
        }
        
        console.log('✅ DASHBOARD: Token verification passed - user IDs match');
        console.log('═══════════════════════════════════════════════════════════');
        
        // Update with fresh data
        updateUser(response.user);
        
      } catch (error: any) {
        console.error('❌ DASHBOARD: Error in catch block');
        console.error('DASHBOARD ERROR:', error?.response?.status, error?.response?.data);
        console.error('  Error status:', error?.response?.status);
        console.error('  Error statusText:', error?.response?.statusText);
        console.error('  Error data:', error?.response?.data);
        console.error('  Error message:', error?.message);
        console.error('  Request URL:', error?.config?.url);
        console.error('  Request headers:', error?.config?.headers);
        console.error('  Request method:', error?.config?.method);
        
        // Check if token still exists after error
        const tokenAfterError = typeof window !== 'undefined' && 
                               localStorage.getItem('access_token');
        console.error('  Token after error:', tokenAfterError ? '✅ Still exists' : '❌ Missing');
        if (tokenAfterError) {
          console.error('  Token preview after error:', tokenAfterError.substring(0, 30) + '...');
        }
        
        // Don't handle 401/403 here - axios interceptor and useAuthGuard handle redirects
        // Just log the error for debugging
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          const errorMsg = error?.response?.data?.message || error?.message || 'Authentication failed';
          console.error('⚠️ DASHBOARD: Auth error detected (401/403)');
          console.error('  Error message:', errorMsg);
          // Don't redirect or show toast - let auth system handle it
          return;
        }
        
        // For other errors, just show a toast but don't redirect
        // User can still use the app with cached data
        if (error?.response?.status !== 401 && error?.response?.status !== 403) {
          console.warn('⚠️ DASHBOARD: Non-auth error (network issue?)', error);
          toast.error(`Network Error: ${error?.message || 'Failed to refresh user data'}. Using cached data.`, {
            duration: 5000,
          });
        }
      }
    };

    // Small delay to ensure tokens are set after login redirect
    // Increased delay to ensure localStorage is fully written and auth guard has run
    const timeoutId = setTimeout(() => {
      // Double-check token still exists before fetching
      const tokenCheck = typeof window !== 'undefined' && 
                        localStorage.getItem('access_token');
      if (!tokenCheck) {
        console.warn('⚠️ Dashboard: Token missing in useEffect, skipping fetch');
        setIsLoading(false);
        return;
      }
      fetchUser();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [updateUser]);

  // ===========================================================================
  // 📘 CODE ORIGIN: Resilient Logout Handler
  // ===========================================================================
  // Custom implementation by me: Fail-safe logout flow
  // 
  // What I Built:
  // Logout that ALWAYS works, even if backend API fails.
  // 
  // My Strategy:
  // 1. Clear local state FIRST (Zustand + localStorage)
  // 2. Then try to logout on backend (invalidate refresh token)
  // 3. If backend fails, silently ignore (already logged out locally)
  // 4. Always redirect to login
  // 
  // Why Local-First:
  // If token is expired/invalid, backend call will fail. But user still needs
  // to be logged out. Clearing local state first guarantees logout happens.
  // ===========================================================================
  const handleLogout = async () => {
    // Custom: Try to logout on server first (best effort, don't block if it fails)
    try {
      await logoutUser();
    } catch (error) {
      // Custom: Silently fail - logout will still clear local state
      // This can happen if token is expired/invalid, which is fine
      console.log('Logout API call failed (token may be expired):', error);
    }
    
    // Custom: Clear ALL auth data and redirect (logout function handles this)
    // This ensures logout happens even if API call fails
    logout(); // logout() clears all storage and redirects to /login
  };

  // ===========================================================================
  // 📘 CODE ORIGIN: Session Initiation Handlers
  // ===========================================================================
  // Custom implementation by me: Session start flow
  // 
  // What I Built:
  // Modal-based session mode selection with navigation to setup page.
  // 
  // My Flow:
  // 1. User clicks "Start Focus Session"
  // 2. Modal opens (SessionModeSelect component)
  // 3. User chooses solo or partner mode with duration
  // 4. Navigate to /session/setup with mode and duration in URL
  // ===========================================================================
  
  const handleStartSession = () => {
    setShowSessionModal(true);
  };

  const handleStartSolo = (duration: number) => {
    setShowSessionModal(false);
    // Custom: Navigate to setup page with duration and mode
    router.push(`/session/setup?duration=${duration}&mode=solo`);
  };

  const handleStartMatching = (duration: number) => {
    setShowSessionModal(false);
    // Custom: Navigate to setup page with duration and mode
    router.push(`/session/setup?duration=${duration}&mode=partner`);
  };

  // ===========================================================================
  // 📘 CODE ORIGIN: Stats Cards Configuration
  // ===========================================================================
  // Pattern source: Dashboard stats cards (common pattern)
  // Custom implementation by me: Focusmate-specific metrics
  // 
  // What I Built:
  // Array of stat card configurations with:
  // - label: Display name
  // - value: Data from analytics hook
  // - helper: Contextual helper text (trends, goals)
  // - iconBg: Color scheme for icon
  // - Icon: Lucide icon component
  // 
  // Why useMemo:
  // Stats cards recalculate on analytics changes. useMemo prevents
  // unnecessary recalculations (performance optimization).
  // 
  // My Metrics:
  // 1. Total Sessions (with weekly change trend)
  // 2. Current Streak (with best streak comparison)
  // 3. Focus Time (with weekly hours)
  // ===========================================================================
  const statsCards = useMemo(
    () => [
      {
        label: 'Total Sessions',
        value: analytics.isLoading ? '...' : analytics.totalSessions.toString(),
        // Custom: Show percentage change with + or - prefix
        helper: analytics.trends.sessionsChange >= 0 
          ? `+${analytics.trends.sessionsChange}% this week`
          : `${analytics.trends.sessionsChange}% this week`,
        iconBg: 'bg-indigo-50 text-indigo-600',  // Custom: Focusmate brand colors
        Icon: CalendarDays,
      },
      {
        label: 'Current Streak',
        value: analytics.isLoading ? '...' : `${analytics.currentStreak} ${analytics.currentStreak === 1 ? 'day' : 'days'}`,
        // Custom: Show best streak or motivational message
        helper: analytics.longestStreak > 0 ? `Best: ${analytics.longestStreak} days` : 'Stay consistent',
        iconBg: 'bg-emerald-50 text-emerald-600',
        Icon: Activity,
      },
      {
        label: 'Focus Time',
        value: analytics.isLoading ? '...' : `${analytics.totalFocusTime}h`,
        // Custom: Show weekly hours or weekly goal
        helper: analytics.thisWeek.totalMinutes > 0 
          ? `${Math.round(analytics.thisWeek.totalMinutes / 60)}h this week`
          : 'Goal: 5h weekly',
        iconBg: 'bg-sky-50 text-sky-600',
        Icon: Clock,
      },
    ],
    [analytics]  // Recalculate when analytics changes
  );

  // ===========================================================================
  // 📘 CODE ORIGIN: AI Recommendations Fetch - Phase 4
  // ===========================================================================
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user?.id) return;
      
      setLoadingRecommendations(true);
      try {
        const recommendations = await evaluateNotifications();
        setAiRecommendations(recommendations.slice(0, 3)); // Show top 3
      } catch (error) {
        console.error('Failed to fetch AI recommendations:', error);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
    // Refresh every 5 minutes
    const interval = setInterval(fetchRecommendations, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // ===========================================================================
  // 📘 CODE ORIGIN: Weekly Progress Calculation
  // ===========================================================================
  // Custom implementation by me: Goal progress tracking
  // 
  // What I Built:
  // - Weekly goal: 300 minutes (5 hours)
  // - Calculate progress percentage: (current / goal) * 100
  // - Cap at 100% (Math.min)
  // 
  // Used in progress bar (lines 355-379)
  // ===========================================================================
  const weeklyFocusMinutes = analytics.thisWeek.totalMinutes || 0;
  const weeklyGoalMinutes = 300; // Custom: 5 hours = 300 minutes (MY goal)
  const weeklyProgress = Math.min(
    100,
    weeklyGoalMinutes
      ? Math.round((weeklyFocusMinutes / weeklyGoalMinutes) * 100)
      : 0
  );

  // ===========================================================================
  // 📘 CODE ORIGIN: Time-Based Greeting System
  // ===========================================================================
  // Custom implementation by me: 100% original for Focusmate
  // 
  // What I Built:
  // Complete contextual greeting system with:
  // - 4 time periods (morning, afternoon, evening, night)
  // - 40 unique motivational messages (10 per period)
  // - Seeded randomization (same message all day, changes daily)
  // - Name personalization (incorporates user name in seed)
  // 
  // Why Seeded Randomization:
  // Random() would show different message on every render. Seeded approach
  // ensures consistent message throughout the day (better UX).
  // 
  // Seed Algorithm:
  // seed = (date + month * 31) + nameLength
  // messageIndex = seed % messagesLength
  // 
  // This gives deterministic "randomness" that:
  // - Changes daily (date component)
  // - Varies per user (name length component)
  // - Stays consistent during the day
  // ===========================================================================
  
  // Helper function for greeting text
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon';
    } else if (hour >= 17 && hour < 21) {
      return 'Good evening';
    } else {
      return 'Good night';
    }
  };

  // Get time-based motivational message (useMemo for performance)
  const getTimeBasedMessage = useMemo(() => {
    const hour = new Date().getHours();
    
    // Custom: MY 40 unique motivational messages
    const morningMessages = [
      'Rise and shine! Time to make today count.',
      'A fresh start. What will you accomplish today?',
      'Morning energy is the best energy. Let\'s focus!',
      'Early bird gets the worm. Let\'s get productive!',
      'New day, new opportunities. Ready to tackle your goals?',
      'Morning is perfect for deep work. Let\'s dive in!',
      'Start your day with intention. What\'s your focus?',
      'The morning holds all possibilities. Make it count!',
      'Clear mind, clear goals. Let\'s make progress!',
      'Morning momentum starts now. Ready to achieve?',
    ];

    const afternoonMessages = [
      'Afternoon power hour. Time to get things done!',
      'Midday momentum. Keep that energy flowing!',
      'Afternoon focus session? Let\'s make it count!',
      'Perfect time for a productivity boost!',
      'Afternoon energy is strong. Channel it wisely!',
      'Midday check-in: Ready to accomplish more?',
      'Afternoon is prime time for focused work.',
      'Keep the momentum going this afternoon!',
      'Afternoon focus, afternoon results. Let\'s go!',
      'The day is still young. What\'s next on your list?',
    ];

    const eveningMessages = [
      'Evening focus time. Finish strong!',
      'Wind down with purposeful work this evening.',
      'Evening sessions are perfect for reflection and progress.',
      'End the day on a high note. Let\'s focus!',
      'Evening productivity mode activated. Ready?',
      'Great time for evening deep work sessions.',
      'Evening energy. Perfect for getting things done!',
      'Close out the day with meaningful progress.',
      'Evening focus, evening achievements. Let\'s do this!',
      'Wrap up the day with a productive session.',
    ];

    const nightMessages = [
      'Night owl mode. Time for focused work!',
      'Late-night sessions can be highly productive.',
      'Quiet night, clear mind. Perfect for focus.',
      'Nighttime focus time. Let\'s make progress!',
      'Late-night productivity boost incoming!',
      'Night sessions for night owls. Ready?',
      'The night is young. Time to get things done!',
      'Late-night deep work? You\'ve got this!',
      'Night energy for night goals. Let\'s focus!',
      'Perfect time for uninterrupted focus.',
    ];

    // Custom: Select messages array based on current hour
    let messages: string[];
    if (hour >= 5 && hour < 12) {
      messages = morningMessages;
    } else if (hour >= 12 && hour < 17) {
      messages = afternoonMessages;
    } else if (hour >= 17 && hour < 21) {
      messages = eveningMessages;
    } else {
      messages = nightMessages;
    }

    // -------------------------------------------------------------------------
    // Custom: Seeded Randomization Algorithm (MY implementation)
    // -------------------------------------------------------------------------
    // Pick a random message based on the current time (seeded by date)
    // This ensures the same message is shown throughout the day
    const today = new Date();
    const daySeed = today.getDate() + today.getMonth() * 31;  // Changes daily
    const nameLength = user?.name?.length ?? 0;  // Personalization
    const messageIndex = (daySeed + nameLength) % messages.length;
    
    return messages[messageIndex];
  }, [user?.name]);

  // ===========================================================================
  // LOADING STATE
  // ===========================================================================
  // Show loading spinner while fetching user data
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#F8FAFC] to-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // MAIN DASHBOARD RENDER
  // ===========================================================================
  return (
    <>
      {/* Custom: MY navbar component */}
      <Navbar />
      
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

        <div className="relative z-10 px-4 pb-24 pt-6">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
          
          {/* ===================================================================
              EMAIL VERIFICATION BANNER
              ===================================================================
              
              📘 CODE ORIGIN: Custom Implementation
              ────────────────────────────────────────────────────────────────
              What I Built: Animated verification reminder banner
              
              My Implementation:
              - Conditional render (only if !isEmailVerified)
              - Framer Motion animation (fade in from top)
              - Prominent orange color (warning/alert)
              - Direct action button to verification flow
              - Shows user email for clarity
              
              Why Prominent:
              Email verification is required for full account security.
              Prominent banner increases conversion rate.
              ================================================================ */}
          {user && !user.isEmailVerified && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}  // Custom: Start above, invisible
              animate={{ opacity: 1, y: 0 }}    // Custom: Fade in, slide down
              className="rounded-xl border-2 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30 p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                    ⚠️ Email Not Verified
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                    Your email address <strong>{user.email}</strong> needs to be verified. Click the button below to send a verification link to your email.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        // Custom: Navigate to verification flow with email pre-filled
                        router.push(`/verify-email?email=${encodeURIComponent(user.email || '')}`);
                      }}
                      className="bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 text-white hover:opacity-90"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Verify Email Now
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================================================================
              GREETING SECTION
              ===================================================================
              
              📘 CODE ORIGIN: Custom Implementation with Animations
              ────────────────────────────────────────────────────────────────
              What I Built: Time-based personalized greeting with animation
              
              My Implementation:
              - Framer Motion entrance animation
              - Time-based greeting (getTimeBasedGreeting)
              - Personalized with user first name
              - Time-based motivational message (getTimeBasedMessage)
              - Hover animation (y: -2 lift)
              - Custom gradient card design
              ================================================================ */}
          <GlassCard delay={0.1} className="p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">
                Dashboard
              </p>
              <h1 className="mt-3 text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                {/* Custom: Time-based greeting with user's first name */}
                {getTimeBasedGreeting()}, {user?.name?.split(' ')[0] || 'Focusmate'}!
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {/* Custom: Contextual motivational message */}
                {getTimeBasedMessage}
              </p>
            </div>
          </GlassCard>

          {/* ===================================================================
              STATS CARDS
              ===================================================================
              
              📘 CODE ORIGIN: Custom Implementation with Staggered Animation
              ────────────────────────────────────────────────────────────────
              Pattern source: Dashboard stats cards (common pattern)
              Custom implementation by me: Focusmate metrics with animations
              
              What I Built:
              - Map over statsCards array (defined above)
              - Staggered entrance animation (delay: index * 0.1)
              - Hover effects (lift, scale, shadow)
              - Responsive grid (1 col → 2 → 3)
              - Icon with colored background
              - Value, label, helper text layout
              ================================================================ */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statsCards.map((card, index) => (
              <GlassCard key={card.label} delay={0.2 + index * 0.1} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Custom: Stat value */}
                    <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                      {card.value}
                    </p>
                    {/* Custom: Stat label */}
                    <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                      {card.label}
                    </p>
                  </div>
                  {/* Custom: Icon with colored background */}
                  <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl ${card.iconBg} flex-shrink-0 shadow-lg`}>
                    <card.Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                </div>
                {/* Custom: Helper text (trend or goal) */}
                <p className="mt-4 text-xs font-medium text-emerald-600 dark:text-emerald-400">{card.helper}</p>
              </GlassCard>
            ))}
          </section>

          {/* ===================================================================
              AI RECOMMENDATIONS SECTION - Phase 4
              =================================================================== */}
          {aiRecommendations.length > 0 && (
            <GlassCard delay={0.45} className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center">
                  <FocusAICharacter pose="idea" size="sm" animate />
                </div>
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                    Today's FocusAI Recommendations
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Personalized insights to boost your productivity
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {aiRecommendations.map((rec, idx) => {
                  const getIcon = () => {
                    switch (rec.type) {
                      case 'streak_warning':
                        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
                      case 'best_time_to_focus':
                        return <Clock className="h-4 w-4 text-blue-500" />;
                      case 'task_overdue':
                        return <AlertTriangle className="h-4 w-4 text-red-500" />;
                      case 'session_preparation':
                        return <Zap className="h-4 w-4 text-yellow-500" />;
                      case 'motivation_boost':
                        return <TrendingUp className="h-4 w-4 text-green-500" />;
                      default:
                        return <Sparkles className="h-4 w-4 text-indigo-500" />;
                    }
                  };
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex-shrink-0">{getIcon()}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-foreground mb-1">
                            {rec.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {rec.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}

          {/* ===================================================================
              ACTION CARDS SECTION
              ===================================================================
              Multiple cards: Start Session, Weekly Progress, Recent Session,
              Account Information
              ================================================================ */}
          <section className="space-y-5">
            
            {/* =================================================================
                START FOCUS SESSION CARD
                =================================================================
                
                📘 CODE ORIGIN: Custom Implementation
                ──────────────────────────────────────────────────────────────
                What I Built: Primary CTA for starting a focus session
                
                My Implementation:
                - Animated entrance (slide from left)
                - Gradient icon (brand colors)
                - Button with hover/tap animations
                - Opens SessionModeSelect modal
                ============================================================== */}
            <GlassCard delay={0.5} className="p-5">
              <div className="flex items-start gap-4">
                {/* Custom: Gradient icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow-lg">
                  <UsersRound className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-3 min-w-0">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Match with a focus partner today
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Pair up instantly with an accountability partner.
                    </p>
                  </div>
                  {/* Custom: Premium animated button */}
                  <AnimatedButton
                    onClick={handleStartSession}
                    glow
                    className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 py-5 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40"
                  >
                    <UsersRound className="mr-2 h-5 w-5" />
                    Match with a focus partner today
                  </AnimatedButton>
                </div>
              </div>
            </GlassCard>

            {/* =================================================================
                WEEKLY PROGRESS CARD
                =================================================================
                
                📘 CODE ORIGIN: Custom Implementation
                ──────────────────────────────────────────────────────────────
                What I Built: Visual weekly goal tracker
                
                My Implementation:
                - Shows current progress vs goal (300 min / 5h)
                - Progress bar with gradient fill
                - Width: weeklyProgress% (calculated above)
                - Motivational helper text
                ============================================================== */}
            <GlassCard delay={0.6} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Weekly Progress ({Math.round(weeklyFocusMinutes / 60)}h / 5h)
                  </p>
                  <p className="mt-1 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                    {weeklyFocusMinutes} / {weeklyGoalMinutes} min
                  </p>
                </div>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="mr-1 inline h-4 w-4" />
                  +0 min
                </span>
              </div>
              {/* Custom: Enhanced progress bar */}
              <div className="mt-4 h-4 rounded-full bg-slate-200/50 dark:bg-slate-800/50 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${weeklyProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                Keep your streak alive by reaching 150 minutes this week.
              </p>
            </GlassCard>

            {/* =================================================================
                RECENT SESSION CARD (PLACEHOLDER)
                ============================================================== */}
            <GlassCard delay={0.7} className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Recent session</p>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    No sessions yet
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  pending
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-200">Partner</p>
                  <p>Waiting for your next session</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-700 dark:text-slate-200">Duration</p>
                  <p>25 min</p>
                </div>
              </div>
              <AnimatedButton
                variant="outline"
                className="mt-4 w-full rounded-2xl border-slate-200 text-sm dark:border-slate-700"
                onClick={handleStartSession}
              >
                Schedule a session
              </AnimatedButton>
            </GlassCard>

            {/* =================================================================
                ACCOUNT INFORMATION CARD
                =================================================================
                
                📘 CODE ORIGIN: Custom Implementation
                ──────────────────────────────────────────────────────────────
                What I Built: User account details display
                
                My Implementation:
                - Grid of InfoTile components
                - Shows email, role, verification status, member since
                - Color coding (success/warning for verification status)
                - Date formatting for createdAt
                ============================================================== */}
            <GlassCard delay={0.8} className="p-5">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Account information
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Synced with your Focusmate profile
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Custom: MY InfoTile component usage */}
                <InfoTile label="Email" value={user?.email ?? '—'} />
                <InfoTile label="Role" value={user?.role ?? '—'} />
                <InfoTile
                  label="Email status"
                  value={user?.isEmailVerified ? 'Verified' : 'Not verified yet'}
                  accent={user?.isEmailVerified ? 'success' : 'warning'}  // Custom: Conditional color
                />
                <InfoTile
                  label="Member since"
                  value={
                    user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()  // Custom: Date formatting
                      : '—'
                  }
                />
              </div>
            </GlassCard>
          </section>
          </div>
        </div>
      </div>
      
      {/* Custom: MY footer and bottom nav */}
      <SimpleFooter variant="auth" className="border-t border-slate-100 bg-slate-50 dark:bg-slate-950" />
      <BottomNav />
      
      {/* =====================================================================
          SESSION MODE SELECTION MODAL
          ===================================================================== 
          
          📘 CODE ORIGIN: Custom Implementation
          ────────────────────────────────────────────────────────────────────
          What I Built: Modal for choosing session mode and duration
          
          My Component: SessionModeSelect
          - isOpen: showSessionModal state
          - onClose: Close modal handler
          - onStartSolo: Navigate to solo setup
          - onStartMatching: Navigate to partner setup
          ================================================================== */}
      <SessionModeSelect
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        onStartSolo={handleStartSolo}
        onStartMatching={handleStartMatching}
      />
    </>
  );
}

/**
 * ===========================================================================
 * 📘 CODE ORIGIN: InfoTile Component
 * ===========================================================================
 * Custom implementation by me: Reusable info display component
 * 
 * What I Built:
 * Small component for displaying labeled information with optional color accent.
 * 
 * Props:
 * - label: Display label (e.g., "Email", "Role")
 * - value: Display value (e.g., "user@example.com", "user")
 * - accent: Optional color accent ('success', 'warning')
 * 
 * My Styling:
 * - success: Green text/background
 * - warning: Amber text/background
 * - default: Slate text (dark mode aware)
 * 
 * Used in Account Information section
 * ===========================================================================
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
  // Custom: Conditional accent color
  const accentColor =
    accent === 'success'
      ? 'text-emerald-600 bg-emerald-50'
      : accent === 'warning'
        ? 'text-amber-600 bg-amber-50'
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

/**
 * ============================================================================
 * WHAT I BUILT VS WHAT I ADAPTED
 * ============================================================================
 * 
 * FRAMEWORK CODE (Not original):
 * ❌ React hooks (useState, useEffect, useMemo)
 * ❌ Next.js routing (useRouter, usePathname)
 * ❌ 'use client' directive
 * 
 * LIBRARY CODE (Adapted):
 * 🔄 Framer Motion animations (library, my configurations)
 * 🔄 ShadCN Card components (library, my styling)
 * 🔄 Lucide icons (library, my selections)
 * 🔄 Toast notifications (library, my messages)
 * 
 * MY CUSTOM IMPLEMENTATIONS:
 * ✅ Time-based greeting system (4 periods, dynamic text)
 * ✅ 40 motivational messages (10 per time period)
 * ✅ Seeded randomization algorithm (consistent daily message)
 * ✅ User profile sync on mount (refresh strategy)
 * ✅ Resilient logout handler (local-first, fail-safe)
 * ✅ Email verification banner (animated, conditional)
 * ✅ Stats cards configuration (Focusmate-specific metrics)
 * ✅ Weekly progress calculation (goal tracking, percentage)
 * ✅ Session initiation flow (modal-based mode selection)
 * ✅ InfoTile component (reusable info display)
 * ✅ Analytics integration (useAnalytics hook usage)
 * ✅ Staggered animations (entrance timing)
 * ✅ Custom hover effects (lift, scale, shadow)
 * ✅ Gradient card designs (brand identity)
 * ✅ Responsive grid layouts (mobile → tablet → desktop)
 * ✅ All copy and messaging
 * 
 * ============================================================================
 * HOW TO EXPLAIN DURING VIVA
 * ============================================================================
 * 
 * Question: "Walk me through your dashboard implementation."
 * 
 * Answer:
 * "The dashboard is the central hub after authentication, demonstrating several
 * key technical implementations:
 * 
 * **Personalization System:**
 * I built a time-based greeting system with 40 unique motivational messages.
 * It uses 4 time periods (morning, afternoon, evening, night) with 10 messages
 * each. The key innovation is seeded randomization - the message stays consistent
 * throughout the day but changes daily. The seed combines the date and user's
 * name length, making it both deterministic and personalized.
 * 
 * **Profile Sync Strategy:**
 * On mount, I fetch fresh user data via getCurrentUser(). This ensures verification
 * status is current - crucial because users might verify email in another tab.
 * Error handling is smart: 401s (auth expired) are ignored since the auth guard
 * handles redirection.
 * 
 * **Fail-Safe Logout:**
 * My logout clears local state FIRST, then tries the backend API. This guarantees
 * logout works even if the token is expired (which would make the API call fail).
 * Local-first strategy ensures users are never stuck logged in.
 * 
 * **Analytics Integration:**
 * I use a custom useAnalytics hook to fetch and manage all analytics data. Stats
 * cards are defined in a useMemo array for performance. Each card shows live data
 * with contextual helper text - for example, showing 'Best: X days' for streak
 * or weekly goals for focus time.
 * 
 * **Email Verification UX:**
 * If email isn't verified, an animated orange banner appears at the top. This is
 * conversion optimization - prominent placement with direct action button increases
 * verification completion rate.
 * 
 * **Animations:**
 * I use Framer Motion for polished animations: staggered card entrance (delay:
 * index * 0.1), hover effects (y: -4, scale: 1.02), and tap effects (scale: 0.98).
 * This creates a premium, responsive feel.
 * 
 * **Session Flow:**
 * Starting a session opens a modal (SessionModeSelect component) where users
 * choose solo or partner mode with duration. This navigates to /session/setup
 * with parameters in the URL.
 * 
 * All UI decisions (gradient cards, shadows, spacing) align with Focusmate's
 * brand identity. The dashboard is fully responsive (mobile → tablet → desktop)
 * and works in dark mode."
 * 
 * ============================================================================
 */
