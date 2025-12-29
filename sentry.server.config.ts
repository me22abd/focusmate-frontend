/**
 * ============================================================================
 * SENTRY.SERVER.CONFIG.TS - SENTRY SERVER-SIDE CONFIGURATION
 * ============================================================================
 * 
 * Purpose: Configures Sentry error monitoring for Next.js server-side code
 * (API routes, server components, middleware). Captures server-side errors
 * and API route performance.
 * 
 * Architecture Role: Error monitoring layer for server-side Next.js execution.
 * Captures errors in API routes, server components, and middleware.
 * 
 * @author Eromonsele Marvelous
 * @module Frontend/Monitoring
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Initialize Sentry for server-side code
 * 
 * This runs on the Next.js server and captures:
 * - API route errors
 * - Server component errors
 * - Middleware errors
 * - Server-side rendering errors
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Environment detection
  environment: process.env.NODE_ENV || 'development',
  
  // Enable error monitoring
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || undefined,
  
  // Filter out noisy errors
  ignoreErrors: [
    // Common non-critical errors
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
  ],
  
  // Additional context
  beforeSend(event, hint) {
    // Add server-specific context
    event.tags = {
      ...event.tags,
      component: 'server',
    };
    
    return event;
  },
  
  // Integration configuration
  integrations: [
    // Sentry.nodeProfilingIntegration(), // Commented out - may not be available in this Sentry version
  ],
});

