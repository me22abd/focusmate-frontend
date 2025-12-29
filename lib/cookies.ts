/**
 * Cookie utility functions for user authentication
 * Separate from admin_token to avoid conflicts
 */

// Helper to get cookie value (works in both client and server)
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Helper to set cookie with secure settings
// CRITICAL: httpOnly is NOT set (disabled) so axios can read the cookie
// This allows the request interceptor to extract auth_token and add it to Authorization header
export function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const isSecure = window.location.protocol === 'https:' || process.env.NODE_ENV === 'production';
  const secureFlag = isSecure ? ';secure' : '';
  // SameSite=Lax to allow cross-site requests when needed
  // Path=/ ensures cookie is available for all routes
  // httpOnly is NOT set (disabled) - allows JavaScript/axios to read the cookie
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax${secureFlag}`;
}

// Helper to delete cookie
export function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  const isSecure = window.location.protocol === 'https:' || process.env.NODE_ENV === 'production';
  const secureFlag = isSecure ? ';secure' : '';
  // SameSite=Lax to match setCookie
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax${secureFlag}`;
}










