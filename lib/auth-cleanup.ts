/**
 * ============================================================================
 * AUTH-CLEANUP.TS - PRE-LOGIN STORAGE CLEANUP UTILITY
 * ============================================================================
 * 
 * Purpose: Completely clears all browser storage before login to prevent
 * old tokens or cached data from interfering with new authentication.
 * 
 * This ensures a clean slate for every login attempt.
 */

/**
 * Pre-login cleanup: Clears ALL browser storage
 * 
 * This function runs automatically when visiting /login to ensure:
 * - No old tokens are reused
 * - No cached user data interferes
 * - No stale auth state persists
 * - Fresh authentication every time
 */
export function preLoginCleanup(): void {
  if (typeof window === 'undefined') return;

  console.log('🧹 PRE-LOGIN CLEANUP: Starting complete storage cleanup...');

  // Clear localStorage (tokens, user data, Zustand persist)
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('✅ PRE-LOGIN CLEANUP: localStorage cleared');
    console.log(`   Removed ${keysToRemove.length} items from localStorage`);
  } catch (error) {
    console.error('❌ PRE-LOGIN CLEANUP: Error clearing localStorage:', error);
  }

  // Clear sessionStorage
  try {
    const sessionKeysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        sessionKeysToRemove.push(key);
      }
    }
    
    sessionKeysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
    });
    
    console.log('✅ PRE-LOGIN CLEANUP: sessionStorage cleared');
    console.log(`   Removed ${sessionKeysToRemove.length} items from sessionStorage`);
  } catch (error) {
    console.error('❌ PRE-LOGIN CLEANUP: Error clearing sessionStorage:', error);
  }

  // Clear IndexedDB (if any auth-related databases exist)
  try {
    if ('indexedDB' in window) {
      // List of known IndexedDB database names that might store auth data
      const dbNames = ['auth', 'user', 'focusmate-auth', 'focusmate'];
      
      for (const dbName of dbNames) {
        try {
          const deleteReq = indexedDB.deleteDatabase(dbName);
          deleteReq.onsuccess = () => {
            console.log(`✅ PRE-LOGIN CLEANUP: IndexedDB database "${dbName}" deleted`);
          };
          deleteReq.onerror = () => {
            // Database might not exist, which is fine
            console.log(`   IndexedDB "${dbName}" not found (ok)`);
          };
        } catch (error) {
          // Database might not exist, which is fine
          console.log(`   IndexedDB "${dbName}" deletion skipped (may not exist)`);
        }
      }
    }
  } catch (error) {
    console.error('❌ PRE-LOGIN CLEANUP: Error clearing IndexedDB:', error);
  }

  // Clear specific auth-related items explicitly (double-check)
  const authKeys = [
    'access_token',
    'refresh_token',
    'user',
    'auth-storage',
    'user_avatar_url',
    'token_version',
    'last_login_user_id',
  ];

  authKeys.forEach(key => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (error) {
      // Ignore errors for non-existent keys
    }
  });

  console.log('✅ PRE-LOGIN CLEANUP: Explicit auth keys cleared');

  // Unregister service workers (if any)
  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister().then(() => {
            console.log('✅ PRE-LOGIN CLEANUP: Service worker unregistered');
          }).catch(error => {
            console.log('   Service worker unregistration skipped (may not exist)');
          });
        });
      });
    }
  } catch (error) {
    console.log('   Service worker cleanup skipped (may not be available)');
  }

  console.log('✅ PRE-LOGIN CLEANUP: Complete - all storage cleared');
  console.log('   Browser is now clean and ready for fresh login');
}








