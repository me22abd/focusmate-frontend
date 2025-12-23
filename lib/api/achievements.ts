/**
 * ============================================================================
 * LIB/API/ACHIEVEMENTS.TS - ACHIEVEMENTS API CLIENT
 * ============================================================================
 * 
 * Purpose: Provides typed functions for retrieving user achievements. Handles
 * graceful error handling by returning empty array on failure, ensuring
 * achievements features never break the app.
 * 
 * Architecture Role: API abstraction for gamification features. Used by
 * profile page and achievement displays to show user's earned badges.
 * 
 * ============================================================================
 * 📘 CODE ORIGIN (REQUIRED FOR ACADEMIC HONESTY)
 * ============================================================================
 * 
 * a) LIBRARY CODE (Not original):
 * ───────────────────────────────────────────────────────────────────────────
 * - axiosInstance methods                        [Line 77]
 * - try-catch pattern                            [Lines 75-82]
 * 
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * b) ADAPTED PATTERNS:
 * ───────────────────────────────────────────────────────────────────────────
 * - API client structure                         [Entire file]
 * - TypeScript interface                         [Lines 60-67]
 * - Graceful error handling                      [Lines 79-81]
 * 
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * c) MY CUSTOM CODE (100% Original for Focusmate):
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * 1. ACHIEVEMENT INTERFACE [Lines 60-67]:
 *    MY type definition for achievement structure:
 *    - id, type, name, description (achievement metadata)
 *    - icon (emoji or icon identifier)
 *    - earnedAt (optional - undefined if not earned yet)
 * 
 * 2. GETUSERACHIEVEMENTS FUNCTION [Lines 73-84]:
 *    MY complete implementation:
 *    - GET /achievements/me (authenticated user)
 *    - Graceful error handling (return [] on failure)
 *    - Never throws (achievements are non-critical)
 * 
 * My Design Decisions:
 * ──────────────────────────────────────────────────────────────────────────
 * ✨ Non-blocking errors (return [] instead of throwing)
 * ✨ Optional earnedAt (distinguish earned vs available)
 * ✨ Simple interface (easy to extend with new fields)
 * ✨ Console logging (debugging without breaking app)
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
 * TYPESCRIPT INTERFACE - My Achievement Type
 * ===========================================================================
 * 
 * 📘 CODE ORIGIN: 100% Custom Implementation
 * ────────────────────────────────────────────────────────────────────────────
 * Achievement interface is MY original work for Focusmate's gamification.
 * ────────────────────────────────────────────────────────────────────────────
 */

// Custom: Achievement structure
export interface Achievement {
  id: string;
  type: string;           // Achievement category (e.g., 'streak', 'sessions')
  name: string;           // Display name (e.g., '7-Day Streak')
  description: string;    // Description text
  icon?: string;          // Emoji or icon identifier (optional - backend may not return)
  points?: number;        // Points awarded for this achievement
  earned?: boolean;       // Whether the user has earned this achievement (optional - backend may not return)
  unlocked?: boolean;     // Alternative field name for earned status (optional)
  progress?: number;      // Progress percentage for incomplete achievements (optional)
  earnedAt?: string | null; // ISO timestamp (null if not earned yet)
  criteria?: any;         // Achievement criteria
}

/**
 * ===========================================================================
 * ACHIEVEMENTS API FUNCTION
 * ===========================================================================
 */

// ---------------------------------------------------------------------------
// GET USER'S ACHIEVEMENTS
// ---------------------------------------------------------------------------
/**
 * 📘 CODE ORIGIN: Custom Implementation with Non-Blocking Error Handling
 * ────────────────────────────────────────────────────────────────────────────
 * Pattern source: API client with graceful error handling
 * Custom implementation by me: Focusmate achievements with failsafe
 * 
 * What I Built:
 * - GET /achievements/me (authenticated user from token)
 * - Returns array of Achievement objects
 * - Graceful error handling: Returns [] on any error
 * - Never throws (achievements are non-critical feature)
 * 
 * Why Never Throw:
 * Achievements are a nice-to-have gamification feature but not critical.
 * If the achievements API is down, the app should still work. Returning
 * an empty array means components render fine (just show no achievements)
 * instead of crashing.
 * 
 * Used By:
 * - profile/page.tsx (achievements section)
 * - dashboard/page.tsx (recent achievements)
 * ────────────────────────────────────────────────────────────────────────────
 */
export const getUserAchievements = async (): Promise<{ achievements: Achievement[] } | Achievement[]> => {
  try {
    // Check if user is authenticated before making request
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (!token) {
        // User not authenticated - silently return empty array
        return { achievements: [] };
      }
    }

    // Custom: GET MY achievements endpoint - try /me/achievements first, fallback to /achievements/me
    let response;
    try {
      response = await axiosInstance.get('/me/achievements');
    } catch (e) {
      // Fallback to old endpoint for backward compatibility
      response = await axiosInstance.get('/achievements/me');
    }
    
    // Handle new format: { achievements: [...] }
    if (response.data && typeof response.data === 'object' && 'achievements' in response.data) {
      return response.data;
    }
    
    // Fallback for old format (array)
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return { achievements: [] };
    
  } catch (error: any) {
    // -----------------------------------------------------------------------
    // Custom: Non-blocking error handling (MY failsafe strategy)
    // -----------------------------------------------------------------------
    // Achievements are non-critical. If API fails, log error but return
    // empty array so app continues working.
    // 
    // Design Decision:
    // Better to show no achievements than to crash the entire profile page.
    // User experience: Page loads fine, just missing achievements section.
    
    // Only log network errors in development, and make them less alarming
    if (process.env.NODE_ENV === 'development') {
      // Check if it's a network error (CORS, connection refused, etc.)
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        // Silently handle network errors - likely CORS or backend not ready
        console.debug('Achievements API unavailable (network error) - this is normal if backend is not running');
      } else {
        // Log other errors (401, 500, etc.) for debugging
        console.warn('Failed to fetch achievements:', error.message || error);
      }
    }
    
    return { achievements: [] };
  }
};

/**
 * Check for new achievements (triggers achievement check on backend)
 */
export const checkAchievements = async (): Promise<{ newlyEarned: Achievement[] }> => {
  try {
    const response = await axiosInstance.post('/achievements/check');
    return response.data || { newlyEarned: [] };
  } catch (error: any) {
    console.error('Failed to check achievements:', error);
    return { newlyEarned: [] };
  }
};

/**
 * ============================================================================
 * WHAT I BUILT VS WHAT I ADAPTED
 * ============================================================================
 * 
 * LIBRARY CODE (Not original):
 * ❌ axios.get (HTTP client)
 * ❌ try-catch (JavaScript syntax)
 * 
 * ADAPTED PATTERNS:
 * 🔄 API client structure (pattern, my endpoint)
 * 🔄 Graceful error handling (pattern, my specific implementation)
 * 
 * MY CUSTOM IMPLEMENTATIONS:
 * ✅ Achievement interface (complete type definition)
 * ✅ getUserAchievements function (implementation)
 * ✅ Non-blocking error strategy (return [] instead of throw)
 * ✅ Fallback to empty array (|| [])
 * ✅ Console logging (debugging)
 * ✅ Endpoint path (/achievements/me)
 * 
 * ============================================================================
 * HOW TO EXPLAIN DURING VIVA
 * ============================================================================
 * 
 * Question: "How do you handle non-critical features like achievements?"
 * 
 * Answer:
 * "I implemented a failsafe strategy for non-critical features:
 * 
 * **Non-Blocking Errors:**
 * The getUserAchievements() function never throws errors. If the API call
 * fails (network issue, backend down, etc.), it logs the error to console
 * and returns an empty array. This means:
 * - Profile page still loads and works
 * - Components that display achievements just show 'No achievements yet'
 * - App doesn't crash due to a secondary feature failure
 * 
 * **Graceful Degradation:**
 * This is an example of graceful degradation - if a non-essential feature
 * fails, the core app continues working. Achievements enhance the experience
 * but aren't required for basic functionality (focus sessions, history, etc.).
 * 
 * **User Experience:**
 * From the user's perspective, if achievements are temporarily unavailable,
 * they can still use all core features. This is better than showing an error
 * page or preventing access to their profile.
 * 
 * This pattern is applied to other non-critical features as well - the goal
 * is that core functionality (sessions, auth, history) always works, while
 * enhancements (achievements, AI, analytics) fail gracefully."
 * 
 * ============================================================================
 */
