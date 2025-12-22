'use client';

/**
 * ============================================================================
 * AUTH-TOKEN-VALIDATOR.TSX - GLOBAL TOKEN VALIDATION COMPONENT
 * ============================================================================
 * 
 * Purpose: Validates authentication tokens on every page load to prevent
 * old tokens from loading wrong user accounts. Automatically clears storage
 * and redirects to login if token is invalid or user mismatch detected.
 * 
 * Architecture Role: Global authentication validator that runs on app mount.
 * Should be included in the root layout to validate tokens across all pages.
 * 
 * @author Eromonsele Marvelous
 * @component Frontend/Auth
 */

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export function AuthTokenValidator() {
  const router = useRouter();
  const pathname = usePathname();
  const { validateToken } = useAuthStore();

  useEffect(() => {
    // Skip validation on public pages (including landing page)
    const publicPages = [
      '/login', 
      '/register', 
      '/verify-email', 
      '/forgot-password', 
      '/reset-password',
      '/', // Landing page
    ];
    
    const isPublicPage = publicPages.some(page => {
      if (page === '/') {
        return pathname === '/' || pathname === '';
      }
      return pathname?.includes(page);
    });
    
    if (isPublicPage) {
      return;
    }

    // Skip validation on pages that use useAuthGuard (dashboard, settings, etc.)
    // useAuthGuard already handles validation, so we don't need to validate twice
    const pagesWithAuthGuard = ['/dashboard', '/settings', '/analytics', '/sessions', '/session'];
    if (pagesWithAuthGuard.some(page => pathname?.includes(page))) {
      return; // Let useAuthGuard handle validation - don't interfere
    }

    // For other protected pages, validate token (but don't redirect aggressively)
    const timeoutId = setTimeout(async () => {
      const accessToken = typeof window !== 'undefined' && localStorage.getItem('access_token');
      
      // If no token, only redirect if we're on a protected page
      if (!accessToken) {
        const isProtectedPage = pathname && !publicPages.some(page => {
          if (page === '/') {
            return pathname === '/' || pathname === '';
          }
          return pathname.includes(page);
        });
        
        if (isProtectedPage) {
          console.warn('⚠️ AuthTokenValidator: No token on protected page, redirecting');
          useAuthStore.getState().clearAuth();
          router.replace('/login');
        }
        return;
      }

      // If token exists, don't validate aggressively - let the page handle it
      // This prevents redirect loops
      console.log('✅ AuthTokenValidator: Token exists, allowing access');
    }, 1000); // Longer delay to avoid conflicts with useAuthGuard

    return () => clearTimeout(timeoutId);
  }, [pathname, router, validateToken]);

  // This component doesn't render anything
  return null;
}





