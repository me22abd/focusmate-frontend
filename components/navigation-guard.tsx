'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * NavigationGuard - Prevents navigation to login page when user is authenticated
 * 
 * This component intercepts navigation attempts and prevents redirecting to /login
 * if the user has a valid authentication token. This fixes the mobile swipe-back
 * bug where swiping left would trigger browser history.back() and send authenticated
 * users to the login page.
 */
export function NavigationGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const lastAuthenticatedPathRef = useRef<string>('/dashboard');

  useEffect(() => {
    // Check token directly from localStorage (more reliable than store state)
    const hasToken = typeof window !== 'undefined' && 
                    localStorage.getItem('access_token');
    
    // Public pages where we don't need to redirect
    const publicPages = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password', '/', '/privacy', '/terms'];
    const isPublicPage = publicPages.some(page => {
      if (page === '/') {
        return pathname === '/' || pathname === '';
      }
      return pathname?.startsWith(page);
    });

    // Track last authenticated path for better redirect
    if (hasToken && pathname && !isPublicPage) {
      lastAuthenticatedPathRef.current = pathname;
    }

    // If user has token and somehow ends up on login page, redirect to last known page or dashboard
    if (hasToken && pathname === '/login') {
      const redirectTo = lastAuthenticatedPathRef.current || '/dashboard';
      router.replace(redirectTo);
      return;
    }

    // Handle popstate events (browser back/forward, swipe gestures)
    const handlePopState = (event: PopStateEvent) => {
      // Immediate check without delay for better UX
      const currentPath = window.location.pathname;
      const stillHasToken = typeof window !== 'undefined' && 
                           localStorage.getItem('access_token');
      
      // If we have a token and ended up on login, prevent it and go to last known page
      if (stillHasToken && currentPath === '/login') {
        event.preventDefault();
        const redirectTo = lastAuthenticatedPathRef.current || '/dashboard';
        router.replace(redirectTo);
      }
    };

    // Also handle beforeunload to track navigation
    const handleBeforeUnload = () => {
      const hasToken = typeof window !== 'undefined' && 
                      localStorage.getItem('access_token');
      if (hasToken && pathname && !isPublicPage) {
        sessionStorage.setItem('last_authenticated_path', pathname);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Restore last path from session storage on mount
    if (typeof window !== 'undefined') {
      const savedPath = sessionStorage.getItem('last_authenticated_path');
      if (savedPath && savedPath !== '/login') {
        lastAuthenticatedPathRef.current = savedPath;
      }
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname, router]);

  return null;
}

