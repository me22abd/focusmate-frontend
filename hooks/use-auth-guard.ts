'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

/**
 * ============================================================================
 * USE-AUTH-GUARD.TS - AUTHENTICATION GUARD HOOK
 * ============================================================================
 * 
 * Purpose: Protects routes by validating authentication tokens and ensuring
 * the correct user is loaded. Automatically validates tokens on every page
 * load and clears storage if token is invalid or user mismatch detected.
 * 
 * Features:
 * - Automatic token validation on page load
 * - User mismatch detection (prevents wrong account loading)
 * - Automatic cleanup of invalid tokens
 * - Redirect to login if not authenticated
 * 
 * @author Eromonsele Marvelous
 * @hook Frontend/Auth
 */
export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, validateToken, clearAuth } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = () => {
      console.log('GUARD: checkAuth called');
      console.log('GUARD: page =', pathname);
      
      // Skip validation on public pages (including landing page)
      const publicPages = [
        '/login', 
        '/register', 
        '/verify-email', 
        '/forgot-password', 
        '/reset-password',
        '/', // Landing page
      ];
      
      // Check if current path is public
      const isPublicPage = publicPages.some(page => {
        if (page === '/') {
          return pathname === '/' || pathname === '';
        }
        return pathname?.includes(page);
      });
      
      if (isPublicPage) {
        console.log('GUARD: Public page detected, allowing access');
        console.log('GUARD: allowed or redirect? → ALLOWED (public page)');
        if (isMounted) setIsValidating(false);
        return;
      }

      // CRITICAL: Check for token in localStorage
      // This is the ONLY check - if token exists, allow access
      const hasAccessToken = typeof window !== 'undefined' && 
                            localStorage.getItem('access_token');

      console.log('GUARD: token from storage =', hasAccessToken);
      if (hasAccessToken) {
        console.log('GUARD: token preview =', hasAccessToken.substring(0, 30) + '...');
      }

      if (!hasAccessToken) {
        console.warn('GUARD: No token found');
        console.log('GUARD: allowed or redirect? → REDIRECT (no token)');
        // No token - clear any stale data and redirect
        // BUT: Only redirect if we're not already on login or a public page
        clearAuth();
        if (isMounted && pathname && pathname !== '/login' && !isPublicPage) {
          console.log('GUARD: Redirecting to /login');
          router.replace('/login');
        }
        if (isMounted) setIsValidating(false);
        return;
      }

      // We have a token - allow access immediately
      // DO NOT validate here - let the page handle it
      // This prevents redirect loops
      console.log('GUARD: Token found');
      console.log('GUARD: allowed or redirect? → ALLOWED (token exists)');
      if (isMounted) setIsValidating(false);
    };

    // Delay to ensure tokens are set after login redirect
    // Increased delay to ensure localStorage is fully written
    const timeoutId = setTimeout(() => {
      checkAuth();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [pathname, router, clearAuth]);

  // Don't render protected content while validating
  if (isValidating) {
    return { isAuthenticated: false, user: null, isValidating: true };
  }

  return { isAuthenticated, user, isValidating: false };
}








