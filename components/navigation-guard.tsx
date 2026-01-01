'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

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

    // If user has token and somehow ends up on login page, redirect to dashboard
    if (hasToken && pathname === '/login') {
      console.log('NavigationGuard: Authenticated user on /login, redirecting to /dashboard');
      router.replace('/dashboard');
      return;
    }

    // Handle popstate events (browser back/forward, swipe gestures)
    const handlePopState = () => {
      // Small delay to let the navigation complete, then check
      setTimeout(() => {
        const currentPath = window.location.pathname;
        const stillHasToken = typeof window !== 'undefined' && 
                             localStorage.getItem('access_token');
        
        // If we have a token and ended up on login, redirect away
        if (stillHasToken && currentPath === '/login') {
          console.log('NavigationGuard: Popstate detected navigation to /login, redirecting away');
          router.replace('/dashboard');
        }
      }, 0);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname, router]);

  return null;
}

