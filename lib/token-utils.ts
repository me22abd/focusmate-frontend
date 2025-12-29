/**
 * ============================================================================
 * TOKEN-UTILS.TS - JWT TOKEN UTILITIES
 * ============================================================================
 * 
 * Purpose: Utility functions for decoding and validating JWT tokens on the frontend.
 * Used to verify token version and ensure tokens are current.
 */

/**
 * Decode JWT token without verification (client-side only)
 * 
 * Note: This does NOT verify the signature - it only decodes the payload.
 * Signature verification is done by the backend.
 */
export function decodeToken(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Validate token version
 * 
 * Returns true if token version matches current required version, false otherwise.
 */
export function validateTokenVersion(token: string): boolean {
  const CURRENT_TOKEN_VERSION = 2; // Must match backend version
  
  try {
    const decoded = decodeToken(token);
    if (!decoded) {
      return false;
    }
    
    // If token has no version, it's an old token (before versioning was added)
    // For backward compatibility, we'll allow it but log a warning
    if (decoded.tokenVersion === undefined) {
      console.warn('⚠️ TOKEN UTILS: Token missing version (old format)');
      return true; // Allow for backward compatibility
    }
    
    // Check if version matches
    if (decoded.tokenVersion !== CURRENT_TOKEN_VERSION) {
      console.error('❌ TOKEN UTILS: Token version mismatch!');
      console.error(`    Token version: ${decoded.tokenVersion}`);
      console.error(`    Required version: ${CURRENT_TOKEN_VERSION}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ TOKEN UTILS: Error validating token version:', error);
    return false;
  }
}

/**
 * Get user ID from token
 */
export function getUserIdFromToken(token: string): string | null {
  try {
    const decoded = decodeToken(token);
    return decoded?.sub || null;
  } catch (error) {
    return null;
  }
}












