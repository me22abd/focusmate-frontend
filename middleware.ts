import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminMiddleware } from './middleware-admin';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CRITICAL: Handle /admin routes FIRST and EXCLUSIVELY
  // Admin routes use admin_token and are completely separate from user auth
  // This MUST run before any user auth logic
  if (pathname.startsWith('/admin')) {
    // Completely isolate admin routes - return immediately
    // Do NOT let any user auth logic touch admin routes
    return adminMiddleware(request);
  }

  // For all non-admin routes, user middleware can run here
  // But we rely on client-side guards for user auth
  // This ensures admin routes are NEVER touched by user auth logic
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};

