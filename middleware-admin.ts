/**
 * Admin Middleware
 * Protects /admin/* routes with admin authentication
 * 
 * CRITICAL RULES:
 * - ONLY checks admin_token, NEVER access_token
 * - NEVER redirects to /login (user login)
 * - Admin routes are completely isolated from user authentication
 * - If no admin_token → redirect ONLY to /admin/login
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function adminMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Get admin token (ONLY check admin_token, ignore access_token completely)
  const adminToken = request.cookies.get('admin_token')?.value;

  // Handle /admin root path - allow access to landing page (no redirect)
  if (pathname === '/admin') {
    return NextResponse.next();
  }

  // Handle public admin routes (login and register)
  if (pathname === '/admin/login' || pathname === '/admin/register') {
    // If admin token exists, redirect to dashboard (already logged in)
    if (adminToken) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    // No admin token, allow access to login/register
    return NextResponse.next();
  }

  // For all other /admin/* routes, require admin_token
  if (!adminToken) {
    // CRITICAL: Redirect ONLY to /admin/login, NEVER to /login
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin token exists, allow access to any /admin/* route
  // CRITICAL: Do NOT check access_token, do NOT redirect to user login
  return NextResponse.next();
}











