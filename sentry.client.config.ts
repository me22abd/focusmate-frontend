/**
 * ============================================================================
 * SENTRY.CLIENT.CONFIG.TS - SENTRY CLIENT-SIDE CONFIGURATION
 * ============================================================================
 * 
 * Purpose: Configures Sentry error monitoring and performance tracking for
 * the Next.js frontend client-side code. Captures runtime errors, API errors,
 * WebSocket errors, and performance metrics.
 * 
 * Architecture Role: Error monitoring layer for client-side JavaScript execution.
 * Captures unhandled exceptions, promise rejections, and performance data.
 * 
 * @author Eromonsele Marvelous
 * @module Frontend/Monitoring
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Initialize Sentry for client-side code
 * 
 * This runs in the browser and captures:
 * - Unhandled JavaScript exceptions
 * - Promise rejections
 * - API request errors (via axios interceptor)
 * - WebSocket connection errors
 * - Performance metrics (page loads, API calls)
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Environment detection
  environment: process.env.NODE_ENV || 'development',
  
  // Enable error monitoring
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
  
  // Session replay (optional, can be enabled for debugging)
  replaysSessionSampleRate: 0, // Disabled by default
  replaysOnErrorSampleRate: 0.1, // 10% of error sessions
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || undefined,
  
  // Filter out noisy errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'atomicFindClose',
    'fb_xd_fragment',
    'bmi_SafeAddOnload',
    'EBCallBackMessageReceived',
    // Network errors that are expected
    'NetworkError',
    'Network request failed',
    // WebSocket connection errors (handled separately)
    'WebSocket is closed',
  ],
  
  // Filter out noisy URLs
  denyUrls: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
  ],
  
  // Additional context
  beforeSend(event, hint) {
    // Add custom context
    if (event.request?.url) {
      // Extract API endpoint from URL for better grouping
      const url = new URL(event.request.url);
      if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) {
        event.tags = {
          ...event.tags,
          api_endpoint: url.pathname,
        };
      }
    }
    
    return event;
  },
  
  // Integration configuration
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Initial scope configuration
  initialScope: {
    tags: {
      component: 'client',
    },
  },
});

