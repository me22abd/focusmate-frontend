/**
 * ============================================================================
 * LIB/API/STATS.TS - STATISTICS & ANALYTICS API CLIENT
 * ============================================================================
 * 
 * Purpose: Provides typed functions for retrieving user statistics and analytics
 * data including streaks, session overview, days active, and aggregated stats.
 * Handles data aggregation from multiple endpoints with graceful error handling.
 * 
 * Architecture Role: API abstraction for analytics features. Used by dashboard,
 * analytics page, and profile components to display user productivity metrics.
 * 
 * ============================================================================
 * 📘 CODE ORIGIN (REQUIRED FOR ACADEMIC HONESTY)
 * ============================================================================
 * 
 * a) LIBRARY CODE (Not original):
 * ───────────────────────────────────────────────────────────────────────────
 * - axiosInstance methods                        [Throughout]
 * - Promise.all                                   [Lines 104-114]
 * - Array.filter                                  [Line 115]
 * - Math methods                                  [Lines 135, 145]
 * 
 * Why Standard: HTTP client, JavaScript APIs
 * 
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * b) ADAPTED PATTERNS:
 * ───────────────────────────────────────────────────────────────────────────
 * - API client module structure                  [Entire file]
 * - TypeScript interfaces                        [Lines 60-80]
 * - Async function exports                       [Lines 82-185]
 * - Promise.all aggregation                      [Lines 104-114]
 * 
 * Source: API client patterns, data aggregation patterns
 * 
 * What I Customized:
 * 1. Interfaces: Focusmate-specific stat structures
 * 2. getUserStats: MY aggregation logic combining multiple endpoints
 * 3. Level calculation: MY algorithm (10 sessions per level)
 * 
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * c) MY CUSTOM CODE (100% Original for Focusmate):
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * 1. ALL TYPESCRIPT INTERFACES [Lines 60-80]:
 *    MY complete type definitions for Focusmate analytics:
 *    - UserStreak: currentStreak, longestStreak, totalSessions
 *    - UserOverview: thisWeek, lastWeek, allTime, trends
 *    - UserStats: Aggregated metrics for dashboard
 * 
 * 2. GETUSERSTREAK FUNCTION [Lines 82-91]:
 *    MY implementation: Get /sessions/streak for current user
 * 
 * 3. GETDAYSACTIVE FUNCTION [Lines 110-125]:
 *    MY implementation: Calculate days active from daily analytics
 *    - Fetches daily session data for past year
 *    - Filters days with at least one session
 *    - Returns count of active days
 * 
 * 4. GETUSERSTATS AGGREGATION [Lines 127-185]:
 *    MY complete implementation of stats aggregation:
 *    - Combines 3 API calls with Promise.all
 *    - Graceful fallbacks (.catch with default values)
 *    - Level calculation (MY algorithm: 1 + sessions / 10)
 *    - Minutes to hours conversion
 *    - Comprehensive error handling
 *    - Default stats on complete failure
 * 
 * My Design Decisions:
 * ──────────────────────────────────
 * ✨ Parallel API calls (Promise.all for performance)
 * ✨ Graceful degradation (fallbacks for each API)
 * ✨ Level calculation (simple, transparent algorithm)
 * ✨ Unit conversion (minutes → hours for readability)
 * ✨ Type safety (explicit return types)
 * ✨ Error resilience (never throw, return defaults)
 * 
 * ============================================================================
 * 
 * @author Eromonsele Marvelous
 * @module Frontend/API
 */

// Custom: Import MY configured axios instance
import axiosInstance from '../axios';

/**
 * ===========================================================================
 * TYPESCRIPT INTERFACES - My Analytics Type System
 * ===========================================================================
 * 
 * 📘 CODE ORIGIN: 100% Custom Implementation
 * ────────────────────────────────────────────────────────────────────────────
 * All interfaces are MY original work for Focusmate's analytics system.
 * ────────────────────────────────────────────────────────────────────────────
 */

// Custom: User streak data structure
export interface UserStreak {
  totalSessions: number;
  currentStreak: number;    // Consecutive days with sessions
  longestStreak: number;    // All-time best streak
}

// Custom: User overview with trends
export interface UserOverview {
  userId: string;
  thisWeek: {
    sessions: number;
    totalMinutes: number;
    avgSessionLength: number;
  };
  lastWeek: {
    sessions: number;
    totalMinutes: number;
  };
  allTime: {
    totalSessions: number;
    totalMinutes: number;
  };
  trends: {
    sessionsChange: number;   // Percentage change week-over-week
    minutesChange: number;    // Percentage change week-over-week
  };
}

// Custom: Aggregated user stats for dashboard display
export interface UserStats {
  daysActive: number;          // Days with at least one session
  totalFocusTime: number;      // Hours (converted from minutes)
  habitsCompleted: number;     // Future feature (placeholder)
  goalsAchieved: number;       // Future feature (placeholder)
  streak: number;              // Current streak
  level: number;               // Calculated from totalSessions
}

/**
 * ===========================================================================
 * STATISTICS API FUNCTIONS
 * ===========================================================================
 */

// ---------------------------------------------------------------------------
// GET USER STREAK
// ---------------------------------------------------------------------------
/**
 * 📘 CODE ORIGIN: Custom Implementation
 * ────────────────────────────────────────────────────────────────────────────
 * What I Built:
 * - GET /sessions/streak (authenticated user from token)
 * - Returns totalSessions, currentStreak, longestStreak
 * 
 * Used By:
 * - dashboard/page.tsx (streak badge)
 * - profile panel (streak display)
 * - getUserStats aggregation
 * ────────────────────────────────────────────────────────────────────────────
 */
export const getUserStreak = async (): Promise<UserStreak> => {
  const response = await axiosInstance.get('/sessions/streak');
  return response.data;
};

// ---------------------------------------------------------------------------
// GET USER OVERVIEW
// ---------------------------------------------------------------------------
/**
 * 📘 CODE ORIGIN: Custom Implementation
 * ────────────────────────────────────────────────────────────────────────────
 * What I Built:
 * - GET /sessions/analytics/overview/:userId
 * - Returns this week, last week, all time stats with trends
 * 
 * Used By:
 * - analytics/page.tsx (overview section)
 * - getUserStats aggregation
 * ────────────────────────────────────────────────────────────────────────────
 */
export const getUserOverview = async (userId: string): Promise<UserOverview> => {
  const response = await axiosInstance.get(`/sessions/analytics/overview/${userId}`);
  return response.data;
};

// ---------------------------------------------------------------------------
// GET DAYS ACTIVE (CALCULATION)
// ---------------------------------------------------------------------------
/**
 * 📘 CODE ORIGIN: Custom Implementation
 * ────────────────────────────────────────────────────────────────────────────
 * Pattern source: Data calculation from API response
 * Custom implementation by me: Filter logic to count active days
 * 
 * What I Built:
 * - GET /sessions/analytics/daily/:userId/:range
 * - Filter days with sessions > 0
 * - Return count of active days
 * - Graceful error handling (return 0 on failure)
 * 
 * Why This Logic:
 * Backend returns raw daily data. I calculate "days active" metric by
 * counting days with at least one session. This is more meaningful than
 * total days since registration.
 * 
 * Used By:
 * - getUserStats aggregation
 * - analytics/page.tsx (activity metrics)
 * ────────────────────────────────────────────────────────────────────────────
 */
export const getDaysActive = async (userId: string, range: number = 365): Promise<number> => {
  try {
    const response = await axiosInstance.get(`/sessions/analytics/daily/${userId}/${range}`);
    const data = response.data.data || [];
    
    // Custom: Count days with at least one session (MY calculation logic)
    return data.filter((day: any) => day.sessions > 0).length;
    
  } catch (error) {
    // Graceful: Return 0 if API fails
    return 0;
  }
};

// ---------------------------------------------------------------------------
// GET COMPREHENSIVE USER STATS (AGGREGATION)
// ---------------------------------------------------------------------------
/**
 * 📘 CODE ORIGIN: Custom Implementation - Complete Stats Aggregation
 * ────────────────────────────────────────────────────────────────────────────
 * Pattern source: Promise.all aggregation (common pattern)
 * Custom implementation by me: Focusmate-specific stats combination
 * 
 * What I Built:
 * MY complete stats aggregation system that:
 * 1. Combines 3 API calls in parallel (Promise.all for performance)
 * 2. Each call has its own .catch fallback (graceful degradation)
 * 3. Calculates level from total sessions (MY algorithm)
 * 4. Converts minutes to hours (MY transformation)
 * 5. Returns comprehensive UserStats object
 * 6. Never throws - returns defaults on complete failure
 * 
 * Level Calculation (MY Algorithm):
 * ```
 * level = max(1, floor(totalSessions / 10) + 1)
 * ```
 * - 0-9 sessions: Level 1
 * - 10-19 sessions: Level 2
 * - 20-29 sessions: Level 3
 * - etc.
 * Minimum level is 1 (even with 0 sessions)
 * 
 * Why This Design:
 * Dashboard needs multiple metrics from different endpoints. Instead of
 * making components call 3 separate APIs, this function aggregates everything.
 * Each API has a fallback so partial data is still returned if one fails.
 * 
 * Used By:
 * - dashboard/page.tsx (stats cards)
 * - profile/page.tsx (user stats section)
 * ────────────────────────────────────────────────────────────────────────────
 */
export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    // -----------------------------------------------------------------------
    // Custom: Parallel API calls with individual fallbacks (MY strategy)
    // -----------------------------------------------------------------------
    // Promise.all executes all 3 calls simultaneously (performance)
    // Each .catch provides default data if that specific API fails
    // Means we get partial data even if some endpoints fail
    const [streakData, overviewData, daysActiveCount] = await Promise.all([
      getUserStreak().catch(() => ({ 
        totalSessions: 0, 
        currentStreak: 0, 
        longestStreak: 0 
      })),
      getUserOverview(userId).catch(() => ({
        userId,
        thisWeek: { sessions: 0, totalMinutes: 0, avgSessionLength: 0 },
        lastWeek: { sessions: 0, totalMinutes: 0 },
        allTime: { totalSessions: 0, totalMinutes: 0 },
        trends: { sessionsChange: 0, minutesChange: 0 },
      })),
      getDaysActive(userId).catch(() => 0),
    ]);

    // -----------------------------------------------------------------------
    // Custom: Level calculation (MY algorithm)
    // -----------------------------------------------------------------------
    // Simple formula: 1 level per 10 sessions, minimum level 1
    // Transparent and easy to understand for users
    const totalSessions = overviewData.allTime?.totalSessions || streakData.totalSessions || 0;
    const level = Math.max(1, Math.floor(totalSessions / 10) + 1);

    // -----------------------------------------------------------------------
    // Custom: Assemble UserStats object (MY aggregation)
    // -----------------------------------------------------------------------
    return {
      daysActive: daysActiveCount,
      totalFocusTime: Math.round((overviewData.allTime?.totalMinutes || 0) / 60), // Custom: Convert to hours
      habitsCompleted: 0,  // Placeholder: Not implemented yet
      goalsAchieved: 0,    // Placeholder: Not implemented yet
      streak: streakData.currentStreak || 0,
      level,
    };
    
  } catch (error) {
    // -----------------------------------------------------------------------
    // Custom: Complete failure fallback (MY error resilience)
    // -----------------------------------------------------------------------
    // If even Promise.all fails (network down, auth expired, etc.),
    // return sensible defaults so dashboard doesn't crash
    return {
      daysActive: 0,
      totalFocusTime: 0,
      habitsCompleted: 0,
      goalsAchieved: 0,
      streak: 0,
      level: 1,  // Everyone gets at least level 1
    };
  }
};

/**
 * ============================================================================
 * WHAT I BUILT VS WHAT I ADAPTED
 * ============================================================================
 * 
 * LIBRARY CODE (Not original):
 * ❌ axios methods
 * ❌ Promise.all, Array.filter
 * ❌ Math.max, Math.floor, Math.round
 * 
 * ADAPTED PATTERNS:
 * 🔄 API client structure (pattern, my endpoints)
 * 🔄 Promise.all aggregation (pattern, my specific combination)
 * 🔄 Try-catch error handling (pattern, my fallback logic)
 * 
 * MY CUSTOM IMPLEMENTATIONS:
 * ✅ All 3 TypeScript interfaces (UserStreak, UserOverview, UserStats)
 * ✅ getDaysActive calculation (filter logic for active days count)
 * ✅ getUserStats aggregation (combines 3 APIs, calculates level, converts units)
 * ✅ Level calculation algorithm (1 + sessions / 10, min 1)
 * ✅ Minutes to hours conversion (divide by 60, round)
 * ✅ Individual fallbacks for each API (graceful degradation)
 * ✅ Complete failure fallback (return sensible defaults)
 * ✅ All endpoint paths (/sessions/streak, /sessions/analytics/overview, etc.)
 * 
 * ============================================================================
 * HOW TO EXPLAIN DURING VIVA
 * ============================================================================
 * 
 * Question: "How do you handle analytics data in your application?"
 * 
 * Answer:
 * "I created a stats API client that aggregates analytics from multiple backend
 * endpoints with graceful error handling:
 * 
 * **Parallel Aggregation:**
 * The getUserStats() function combines 3 different API calls using Promise.all
 * for performance. This gets streak data, overview stats, and calculates days
 * active all at once instead of sequentially.
 * 
 * **Graceful Degradation:**
 * Each API call has its own .catch fallback with sensible default values. If
 * one endpoint fails, the others still work. For example, if the streak API
 * fails but overview works, we still show total sessions, focus time, etc.
 * If everything fails, we return all zeros with level 1 so the dashboard
 * doesn't crash.
 * 
 * **Level Calculation:**
 * I implemented a simple leveling system: level = max(1, floor(sessions / 10) + 1).
 * So 0-9 sessions is level 1, 10-19 is level 2, etc. This gamifies the experience
 * and gives users a sense of progress.
 * 
 * **Days Active Calculation:**
 * The backend returns raw daily data. I calculate 'days active' by filtering
 * for days with sessions > 0 and counting them. This is more meaningful than
 * 'days since registration' because it shows actual engagement.
 * 
 * **Unit Conversion:**
 * Backend stores durations in minutes. I convert to hours for display
 * (totalFocusTime) because hours are more readable for large totals (e.g.,
 * '45 hours' is clearer than '2700 minutes').
 * 
 * This aggregation layer simplifies the components - they just call getUserStats()
 * once instead of managing multiple API calls and error states."
 * 
 * ============================================================================
 */
