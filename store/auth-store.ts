/**
 * ============================================================================
 * AUTH-STORE.TS - AUTHENTICATION STATE MANAGEMENT (ZUSTAND STORE)
 * ============================================================================
 * 
 * Purpose: Manages global authentication state for the Focusmate frontend.
 * Stores user data, JWT tokens, and authentication status with automatic
 * persistence to localStorage for session continuity across page refreshes.
 * 
 * Architecture Role: Central source of truth for authentication state.
 * All components access this store to check authentication status and user
 * data. Integrates with API interceptors for automatic token injection.
 * 
 * ============================================================================
 * 📘 CODE ORIGIN (REQUIRED FOR ACADEMIC HONESTY)
 * ============================================================================
 * 
 * a) ZUSTAND LIBRARY PATTERNS (Not my original work):
 * ───────────────────────────────────────────────────────────────────────────
 * - create() function                            [Line 46]
 * - persist() middleware                         [Line 47]
 * - set() state updates                          [Throughout]
 * 
 * Why These Are Standard:
 * ALL Zustand stores use these patterns. This is how Zustand works.
 * 
 * Reference: Zustand documentation - "Getting Started" and "Persist Middleware"
 * 
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * b) ADAPTED CODE (Zustand patterns I configured):
 * ───────────────────────────────────────────────────────────────────────────
 * - Persist middleware with localStorage         [Lines 47-108]
 * - State shape definition                       [Lines 33-44]
 * 
 * Source: Zustand persist middleware documentation
 * 
 * What I Adapted:
 * - Standard pattern: persist((set) => ({ ...state, ...actions }))
 * - My configuration: Storage name 'auth-storage'
 * - My enhancement: Sync with localStorage for axios interceptor
 * 
 * How I Customized:
 * - Added dual storage (Zustand state + localStorage)
 * - localStorage used by axios interceptor (token injection)
 * - Zustand state used by React components (reactivity)
 * - Cleanup on logout (clear both sources)
 * 
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * c) MY CUSTOM CODE (100% Original for Focusmate):
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * 1. STATE SHAPE [Lines 33-44]:
 *    Designed specifically for Focusmate's auth needs:
 *    - user, accessToken, refreshToken, isAuthenticated
 *    - setAuth, updateUser, logout, clearAuth methods
 * 
 * 2. DUAL STORAGE STRATEGY [Lines 57-67, 85-95, 100-106]:
 *    My solution to axios + React integration:
 *    - Store in Zustand (React components can subscribe)
 *    - ALSO store in localStorage (axios interceptor can read)
 *    - Keep both in sync (my synchronization logic)
 * 
 * 3. SETAUTH METHOD [Lines 54-76]:
 *    My implementation of authentication state setting:
 *    - Update both Zustand and localStorage
 *    - Store user object as JSON string
 *    - Mark isAuthenticated = true
 * 
 * 4. UPDATEUSER METHOD [Lines 78-83]:
 *    My implementation for profile updates:
 *    - Update user object without touching tokens
 *    - Sync to localStorage
 *    - Keep authentication active
 * 
 * 5. LOGOUT METHOD [Lines 85-98]:
 *    My implementation of logout:
 *    - Clear ALL storage (Zustand + localStorage)
 *    - Remove tokens (security)
 *    - Remove user data
 *    - Set isAuthenticated = false
 * 
 * 6. CLEARAUTH METHOD [Lines 100-111]:
 *    My implementation for auth cleanup:
 *    - Similar to logout but more explicit
 *    - Used when visiting login page (fresh start)
 * 
 * My Design Decisions:
 * ──────────────────────────────
 * ✨ Zustand over Redux (simpler, less boilerplate)
 * ✨ Dual storage strategy (Zustand + localStorage)
 * ✨ Persist middleware (session continuity across refresh)
 * ✨ Separate logout and clearAuth (different use cases)
 * ✨ updateUser method (profile updates without re-auth)
 * ✨ JSON.stringify for user object (complex data in localStorage)
 * 
 * ============================================================================
 * 
 * @author Eromonsele Marvelous
 * @store Frontend/Auth
 */

// Adapted from Zustand: State management library
// My choice: Selected Zustand over Redux for simplicity
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * ============================================================================
 * AUTH STATE INTERFACE - My Data Structure
 * ============================================================================
 * 
 * Custom implementation: I designed this interface for Focusmate's auth needs
 */
interface AuthState {
  // User data (from backend /auth/me)
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    [key: string]: any;  // Flexible for additional fields
  } | null;
  
  // JWT tokens (from backend /auth/login)
  accessToken: string | null;
  refreshToken: string | null;
  
  // Auth status flag
  isAuthenticated: boolean;

  // Actions (methods to update state)
  setAuth: (user: any, accessToken: string, refreshToken: string) => void;
  updateUser: (user: any) => void;
  logout: () => void;
  clearAuth: () => void;
  validateToken: () => Promise<boolean>; // Returns true if token is valid, false otherwise
}

/**
 * ============================================================================
 * AUTH STORE CREATION - Zustand with Persistence
 * ============================================================================
 * 
 * Adapted pattern: Zustand create() with persist() middleware
 * Custom implementation: MY state shape, MY actions, MY storage strategy
 */
export const useAuthStore = create<AuthState>()(
  // Adapted from Zustand docs: persist middleware
  persist(
    (set) => ({
      // -----------------------------------------------------------------------
      // INITIAL STATE - My defaults
      // -----------------------------------------------------------------------
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      // -----------------------------------------------------------------------
      // 📘 CODE ORIGIN: setAuth Action
      // -----------------------------------------------------------------------
      // Pattern source: Zustand state updates (library standard)
      // Custom implementation by me: Dual storage strategy
      // 
      // What I Built:
      // - Store tokens in BOTH Zustand and localStorage
      // - Zustand: For React component reactivity
      // - localStorage: For axios interceptor access
      // - Keep both synchronized
      // 
      // Why Dual Storage:
      // - Zustand state: Components can subscribe and re-render
      // - localStorage: Axios interceptor runs outside React (needs direct access)
      // - Can't use Zustand in axios interceptor (not a React hook)
      // 
      // My Solution to Integration Challenge:
      // Axios interceptor reads from localStorage, components read from Zustand
      // -----------------------------------------------------------------------
      setAuth: (user, accessToken, refreshToken) => {
        console.log('═══════════════════════════════════════════════════════════');
        console.log('STORE: setAuth called - Storing NEW authentication data');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('  NEW access token:', accessToken.substring(0, 50) + '...');
        console.log('  NEW refresh token:', refreshToken.substring(0, 50) + '...');
        console.log('  NEW user:', user?.email);
        console.log('  NEW user ID:', user?.id);
        
        // CRITICAL: Validate token version before storing
        try {
          // Browser-compatible JWT decoder (JWT payload is base64url encoded JSON)
          const decodeJWT = (token: string): any => {
            try {
              const parts = token.split('.');
              if (parts.length !== 3) return null;
              const payload = parts[1];
              // Base64url decode (replace URL-safe characters and add padding if needed)
              const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
              const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
              const decoded = atob(padded);
              return JSON.parse(decoded);
            } catch (e) {
              return null;
            }
          };
          
          const decoded = decodeJWT(accessToken);
          const CURRENT_TOKEN_VERSION = 2; // Must match backend version
          
          if (decoded) {
            console.log('  Token version check:');
            console.log(`    Decoded tokenVersion: ${decoded?.tokenVersion || 'undefined (old token)'}`);
            console.log(`    Current required version: ${CURRENT_TOKEN_VERSION}`);
            
            if (decoded?.tokenVersion !== undefined && decoded.tokenVersion !== CURRENT_TOKEN_VERSION) {
              console.error('❌ STORE: Token version mismatch - rejecting old token!');
              console.error(`    Token version: ${decoded.tokenVersion}`);
              console.error(`    Required version: ${CURRENT_TOKEN_VERSION}`);
              throw new Error('Token version mismatch - token has been invalidated');
            }
            
            if (decoded?.tokenVersion === undefined) {
              console.warn('⚠️ STORE: Token missing version (old format) - allowing for backward compatibility');
            } else {
              console.log('✅ STORE: Token version validated - token is current');
            }
          }
        } catch (error: any) {
          if (error.message.includes('version')) {
            throw error; // Re-throw version mismatch errors
          }
          console.warn('⚠️ STORE: Could not decode token for version check (non-critical)');
        }
        
        // Custom: Store in localStorage for axios interceptor
        // CRITICAL: Store synchronously before any async operations
        if (typeof window !== 'undefined') {
          try {
            console.log('  Writing NEW tokens to cookies and localStorage...');
            
            // CRITICAL FIX: Store token in cookie (auth_token) for axios interceptor
            const setCookie = (name: string, value: string, days = 7) => {
              const expires = new Date();
              expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
              const isSecure = window.location.protocol === 'https:' || process.env.NODE_ENV === 'production';
              const secureFlag = isSecure ? ';secure' : '';
              document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax${secureFlag}`;
            };
            
            // Store token in cookie (primary storage for axios)
            setCookie('auth_token', accessToken, 7);
            
            // Also store in localStorage for backward compatibility
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Store token metadata for verification
            localStorage.setItem('last_login_user_id', user?.id || '');
            localStorage.setItem('token_stored_at', new Date().toISOString());
            
            // Verify tokens were actually saved (both cookie and localStorage)
            const getCookie = (name: string): string | null => {
              const value = `; ${document.cookie}`;
              const parts = value.split(`; ${name}=`);
              if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
              return null;
            };
            const savedCookieToken = getCookie('auth_token');
            const savedToken = localStorage.getItem('access_token');
            const savedRefresh = localStorage.getItem('refresh_token');
            const savedUser = localStorage.getItem('user');
            const savedUserId = localStorage.getItem('last_login_user_id');
            
            console.log('  Verification after save:');
            console.log(`    auth_token cookie: ${savedCookieToken ? `✅ Saved (${savedCookieToken.substring(0, 30)}...)` : '❌ Missing'}`);
            console.log(`    access_token localStorage: ${savedToken ? `✅ Saved (${savedToken.substring(0, 30)}...)` : '❌ Missing'}`);
            console.log(`    refresh_token: ${savedRefresh ? `✅ Saved (${savedRefresh.substring(0, 30)}...)` : '❌ Missing'}`);
            console.log(`    user: ${savedUser ? '✅ Saved' : '❌ Missing'}`);
            console.log(`    last_login_user_id: ${savedUserId || '❌ Missing'}`);
            
            if (!savedCookieToken || !savedToken || !savedRefresh || !savedUser) {
              console.error('❌ STORE: Failed to save tokens!');
              console.error(`  Cookie: ${savedCookieToken ? '✅' : '❌'}`);
              console.error(`  localStorage: ${savedToken ? '✅' : '❌'}`);
              throw new Error('Failed to save tokens to cookie or localStorage');
            }
            
            // Verify tokens match what we tried to save
            if (savedCookieToken !== accessToken || savedToken !== accessToken) {
              console.error('❌ STORE: Token mismatch! Saved token does not match input token!');
              console.error('  Input token:', accessToken.substring(0, 30) + '...');
              console.error('  Cookie token:', savedCookieToken?.substring(0, 30) + '...');
              console.error('  localStorage token:', savedToken?.substring(0, 30) + '...');
              throw new Error('Token mismatch - saved token does not match input');
            }
            
            // Verify user ID matches
            if (savedUserId !== user?.id) {
              console.error('❌ STORE: User ID mismatch!');
              console.error('  Input user ID:', user?.id);
              console.error('  Saved user ID:', savedUserId);
              throw new Error('User ID mismatch');
            }
            
            console.log('✅ STORE: All tokens verified - NEW token stored successfully');
            console.log(`✅ STORE: Confirmed browser is storing NEW token for user: ${user?.email} (ID: ${user?.id})`);
            console.log('═══════════════════════════════════════════════════════════');
          } catch (error) {
            console.error('❌ STORE: Error saving to localStorage:', error);
            throw error;
          }
        }
        
        // Framework pattern: Zustand set() function
        // Custom: MY state shape
        console.log('  Updating Zustand state...');
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
        
        console.log('✅ STORE: Zustand state updated with NEW authentication data');
      },

      // -----------------------------------------------------------------------
      // 📘 CODE ORIGIN: updateUser Action
      // -----------------------------------------------------------------------
      // Custom implementation by me: Profile update without re-authentication
      // 
      // Why This Exists:
      // When user updates profile (name, avatar), don't need new tokens.
      // Just update user object while keeping tokens intact.
      // -----------------------------------------------------------------------
      updateUser: (user) => {
        // Custom: Sync to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        // Update only user (keep tokens)
        set({ user });
      },

      // -----------------------------------------------------------------------
      // 📘 CODE ORIGIN: logout Action
      // -----------------------------------------------------------------------
      // Custom implementation by me: Complete auth cleanup with redirect
      // 
      // What I Built:
      // - Clear ALL auth data from both storage systems
      // - Remove tokens (security - can't reuse after logout)
      // - Remove user data
      // - Clear auth-storage (Zustand persist)
      // - Set authenticated flag to false
      // - Redirect to login page
      // 
      // Why Both Cleanups:
      // Must clear localStorage too (not just Zustand) so axios interceptor
      // doesn't inject old token after logout
      // -----------------------------------------------------------------------
      logout: () => {
        // Custom: Clear ALL localStorage items and cookies
        if (typeof window !== 'undefined') {
          // CRITICAL FIX: Delete auth_token cookie
          const deleteCookie = (name: string) => {
            const isSecure = window.location.protocol === 'https:' || process.env.NODE_ENV === 'production';
            const secureFlag = isSecure ? ';secure' : '';
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax${secureFlag}`;
          };
          deleteCookie('auth_token');
          
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          localStorage.removeItem('auth-storage');      // Zustand persist storage
          localStorage.removeItem('user_avatar_url');   // Avatar cache
        }
        
        // Custom: Clear Zustand state
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        
        // Custom: Redirect to login after clearing storage
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      // -----------------------------------------------------------------------
      // 📘 CODE ORIGIN: clearAuth Action
      // -----------------------------------------------------------------------
      // Custom implementation by me: Auth reset (similar to logout)
      // 
      // Difference from logout:
      // - logout: User-initiated action, redirects to login
      // - clearAuth: System cleanup (e.g., visiting login page), no redirect
      // - Both do same thing, semantic difference
      // -----------------------------------------------------------------------
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          // CRITICAL FIX: Delete auth_token cookie
          const deleteCookie = (name: string) => {
            const isSecure = window.location.protocol === 'https:' || process.env.NODE_ENV === 'production';
            const secureFlag = isSecure ? ';secure' : '';
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax${secureFlag}`;
          };
          deleteCookie('auth_token');
          
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          localStorage.removeItem('auth-storage');      // Zustand persist storage
          localStorage.removeItem('user_avatar_url');   // Avatar cache
        }
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      // -----------------------------------------------------------------------
      // 📘 CODE ORIGIN: validateToken Action
      // -----------------------------------------------------------------------
      // Custom implementation by me: Token validation with user verification
      // 
      // What I Built:
      // - Calls /auth/me to validate token with backend
      // - Checks if returned user matches stored user (prevents wrong account)
      // - If token invalid or user mismatch, clears all storage
      // - Returns true if valid, false if invalid
      // 
      // Why This Exists:
      // Prevents old tokens from loading wrong user accounts. Validates that
      // the token belongs to the user we think it does.
      // -----------------------------------------------------------------------
      validateToken: async () => {
        if (typeof window === 'undefined') return false;
        
        const accessToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');
        
        // No token = not authenticated
        if (!accessToken) {
          return false;
        }
        
        try {
          // Import getCurrentUser dynamically to avoid circular dependency
          const { getCurrentUser } = await import('@/lib/api/auth');
          const response = await getCurrentUser();
          
          // Validate user exists in response
          if (!response?.user) {
            console.warn('⚠️ Token validation failed: No user in response');
            return false;
          }
          
          // If we have a stored user, verify it matches the backend user
          if (storedUser) {
            try {
              const parsedStoredUser = JSON.parse(storedUser);
              // Check if user IDs match (most reliable identifier)
              if (parsedStoredUser.id && response.user.id !== parsedStoredUser.id) {
                console.warn('⚠️ Token validation failed: User mismatch detected');
                console.warn('  Stored user ID:', parsedStoredUser.id);
                console.warn('  Backend user ID:', response.user.id);
                // Clear storage - wrong user!
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('refresh_token');
                  localStorage.removeItem('user');
                  localStorage.removeItem('auth-storage');
                  localStorage.removeItem('user_avatar_url');
                }
                set({
                  user: null,
                  accessToken: null,
                  refreshToken: null,
                  isAuthenticated: false,
                });
                return false;
              }
            } catch (parseError) {
              // If stored user is invalid JSON, continue with validation
              console.warn('⚠️ Could not parse stored user, continuing validation');
            }
          }
          
          // Token is valid and user matches - update stored user with latest data
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(response.user));
          }
          set({ user: response.user, isAuthenticated: true });
          
          return true;
        } catch (error: any) {
          // Only clear storage on 401/403 (actual auth errors)
          // Don't clear on network errors or other issues
          const status = error?.response?.status;
          
          if (status === 401 || status === 403) {
            // Token is invalid - clear all storage
            console.warn('⚠️ Token validation failed: Unauthorized (401/403)');
            if (typeof window !== 'undefined') {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');
              localStorage.removeItem('auth-storage');
              localStorage.removeItem('user_avatar_url');
            }
            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
            });
            return false;
          }
          
          // Network error or other issue - don't clear storage, just return false
          // This allows retry and doesn't log out user on temporary network issues
          console.warn('⚠️ Token validation error (non-auth):', error?.message || 'Network error');
          return false;
        }
      },
    }),
    {
      // Adapted from Zustand persist docs: storage configuration
      // Custom: Storage name I chose
      name: 'auth-storage',  // Custom: My storage key
    }
  )
);

/**
 * ============================================================================
 * WHAT I BUILT VS WHAT I ADAPTED
 * ============================================================================
 * 
 * LIBRARY CODE (Zustand patterns):
 * ❌ create() function
 * ❌ persist() middleware
 * ❌ set() state updates
 * → Standard Zustand patterns
 * 
 * MY CUSTOM IMPLEMENTATIONS:
 * ✅ State shape (user, tokens, isAuthenticated)
 * ✅ Dual storage strategy (Zustand + localStorage)
 * ✅ setAuth logic (synchronize both storage systems)
 * ✅ updateUser logic (partial update)
 * ✅ logout logic (complete cleanup)
 * ✅ clearAuth logic (auth reset)
 * ✅ localStorage synchronization (my integration solution)
 * 
 * ============================================================================
 * HOW TO EXPLAIN DURING VIVA
 * ============================================================================
 * 
 * Question: "Why use Zustand? Why localStorage?"
 * 
 * Answer:
 * "I chose Zustand for state management because it's simpler than Redux with
 * less boilerplate, while still providing global state and persistence.
 * 
 * The dual storage strategy (Zustand + localStorage) solves a specific
 * integration challenge: React components need reactive state (Zustand provides
 * this), but axios interceptors run outside React and can't access Zustand.
 * 
 * My solution: Store auth data in BOTH places and keep them synchronized.
 * Components read from Zustand (reactive updates), axios reads from localStorage
 * (direct access). Both are updated together in setAuth() to maintain consistency.
 * 
 * This demonstrates understanding of React state management, browser storage APIs,
 * and solving integration challenges between different parts of the application."
 * 
 * ============================================================================
 */
