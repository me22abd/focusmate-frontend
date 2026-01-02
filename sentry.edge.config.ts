/**
 * ============================================================================
 * SENTRY.EDGE.CONFIG.TS - SENTRY EDGE RUNTIME CONFIGURATION
 * ============================================================================
 * 
 * Purpose: Configures Sentry for Next.js Edge Runtime (middleware, edge API routes).
 * Lightweight configuration for edge functions.
 * 
 * Architecture Role: Error monitoring for edge runtime execution.
 * 
 * @author Eromonsele Marvelous
 * @module Frontend/Monitoring
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Initialize Sentry for Edge Runtime
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
});


