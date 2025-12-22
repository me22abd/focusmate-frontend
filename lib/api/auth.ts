/**
 * ============================================================================
 * LIB/API/AUTH.TS - AUTHENTICATION API CLIENT
 * ============================================================================
 * 
 * Purpose: Centralized authentication API client that provides typed functions
 * for all auth-related backend communication. Acts as the single source of truth
 * for authentication endpoints, ensuring type safety and consistent error handling.
 * 
 * Architecture Role: API abstraction layer between frontend components and backend
 * authentication service. All auth pages (login, register, verify-email, etc.)
 * import functions from this file rather than making direct axios calls.
 * 
 * ============================================================================
 * 📘 CODE ORIGIN (REQUIRED FOR ACADEMIC HONESTY)
 * ============================================================================
 * 
 * a) LIBRARY CODE (Not original):
 * ───────────────────────────────────────────────────────────────────────────
 * - axiosInstance import                         [Line 59]
 * - axios.post(), axios.get(), axios.patch()     [Throughout]
 * 
 * Why Standard: Axios is the HTTP client library
 * Reference: Axios documentation
 * 
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * b) ADAPTED PATTERNS:
 * ───────────────────────────────────────────────────────────────────────────
 * - API client module structure                  [Entire file]
 * - Typed request/response interfaces            [Lines 61-114]
 * - Async function exports                       [Lines 116-374]
 * 
 * Source: Common API client patterns (e.g., React Query examples, API service
 * layers in Next.js tutorials)
 * 
 * What I Customized:
 * 
 * 1. Interface Definitions:
 *    - Standard pattern: Define TypeScript interfaces for type safety
 *    - MY interfaces: Match Focusmate backend API contracts exactly
 *    - MY decision: Which fields to include (name, email, phoneNumber, etc.)
 * 
 * 2. Function Organization:
 *    - Standard pattern: One function per endpoint
 *    - MY endpoints: Registration, login, verification, profile, password reset
 *    - MY naming: Clear, descriptive function names (registerUser, loginUser)
 * 
 * 3. Error Handling:
 *    - Standard pattern: try-catch with throw
 *    - MY enhancement: Detailed logging for debugging (login, sendVerificationEmailCode)
 * 
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * c) MY CUSTOM CODE (100% Original for Focusmate):
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * 1. ALL TYPESCRIPT INTERFACES [Lines 61-114]:
 *    MY complete type definitions for Focusmate's auth API:
 *    - RegisterData: name, email, password, optional phoneNumber
 *    - LoginData: email, password
 *    - RegisterResponse: user object structure
 *    - LoginResponse: tokens + user data structure
 *    - UserProfile: complete profile shape (avatar, verification status, etc.)
 *    - UpdateProfileData: partial update fields
 * 
 * 2. DEBUGGING LOGS [Lines 129-141, 159-183]:
 *    MY implementation of comprehensive error logging:
 *    - loginUser: Logs full error context (message, response, status, URL)
 *    - sendVerificationEmailCode: Logs request and response details with emojis
 *    - Enhanced error objects with response and status
 * 
 * 3. DUAL EMAIL VERIFICATION SYSTEM [Lines 175-197, 199-221]:
 *    MY implementation supporting two verification methods:
 *    - verifyEmail: Token-based (legacy, URL token)
 *    - sendVerificationEmailCode + verifyEmailCode: OTP-based (current)
 *    - Maintained both for backward compatibility
 * 
 * 4. ENHANCED ERROR CONTEXT [Lines 177-185]:
 *    MY error enhancement in sendVerificationEmailCode:
 *    - Create new error with better message
 *    - Attach response object
 *    - Attach status code
 *    - Provides components with rich error data
 * 
 * 5. ALL 11 API FUNCTIONS [Lines 116-374]:
 *    MY complete auth API:
 *    - registerUser
 *    - loginUser (with debugging)
 *    - getCurrentUser
 *    - verifyEmail (token-based)
 *    - resendVerificationEmail (token-based)
 *    - sendVerificationEmailCode (OTP-based, with debugging)
 *    - verifyEmailCode (OTP-based)
 *    - sendOtp (phone verification)
 *    - verifyOtp (phone verification)
 *    - forgotPassword
 *    - resetPassword
 *    - logoutUser
 *    - updateProfile
 * 
 * My Design Decisions:
 * ──────────────────────────────
 * ✨ Centralized API client (single source of truth)
 * ✨ TypeScript interfaces (type safety, autocomplete)
 * ✨ Async/await (clean, modern async code)
 * ✨ Detailed logging (debugging during development)
 * ✨ Dual verification systems (flexibility)
 * ✨ Enhanced error objects (better error handling in components)
 * ✨ Consistent naming (clear, descriptive function names)
 * ✨ Return type annotations (explicit return types)
 * 
 * ============================================================================
 * 
 * @author Eromonsele Marvelous
 * @module Frontend/API
 */

// Custom: Import MY configured axios instance (with auth interceptors)
// See ../axios.ts for token management implementation
import axiosInstance from '../axios';

/**
 * ===========================================================================
 * TYPESCRIPT INTERFACE DEFINITIONS - My Complete Type System
 * ===========================================================================
 * 
 * 📘 CODE ORIGIN: 100% Custom Implementation
 * ────────────────────────────────────────────────────────────────────────────
 * All interfaces defined here are MY original work, designed to match
 * Focusmate's backend API contracts exactly.
 * 
 * Why These Specific Interfaces:
 * - RegisterData: Fields required for user registration (backend expects these)
 * - LoginData: Fields required for authentication
 * - LoginResponse: What backend returns after successful login (tokens + user)
 * - UserProfile: Complete user object shape (all fields from backend)
 * - UpdateProfileData: Partial update (only fields being changed)
 * 
 * Design Decision:
 * Explicit TypeScript interfaces provide:
 * - Type safety (catch errors at compile time)
 * - IDE autocomplete (better developer experience)
 * - Documentation (interfaces document the API contract)
 * - Maintainability (changes to API reflected in types)
 * ────────────────────────────────────────────────────────────────────────────
 */

// Custom: Registration request payload shape
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;  // Optional: phone verification is optional
}

// Custom: Login request payload shape
export interface LoginData {
  email: string;
  password: string;
}

// Custom: Registration response shape (from backend)
export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
  };
}

// Custom: Login response shape (tokens + basic user data)
export interface LoginResponse {
  message: string;
  access_token: string;   // JWT access token
  refresh_token: string;  // JWT refresh token
  user: {
    id: string;
    name: string;
    email: string;
    role: string;          // 'user' or 'admin'
    lastLoginAt: string;
  };
}

// Custom: Complete user profile shape (includes avatar, verification status)
// This is what getCurrentUser returns and what's stored in Zustand
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;           // Profile picture URL
  isEmailVerified: boolean;     // Email verification status
  isPhoneVerified: boolean;     // Phone verification status
  role: string;
  lastLoginAt: string;
  createdAt: string;
}

// Custom: Profile update payload (partial - only fields being updated)
export interface UpdateProfileData {
  name?: string;
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

/**
 * ===========================================================================
 * AUTHENTICATION API FUNCTIONS - My Complete Auth API Client
 * ===========================================================================
 * All functions below are MY implementations, designed for Focusmate's
 * specific authentication requirements.
 * ===========================================================================
 */

// ---------------------------------------------------------------------------
// USER REGISTRATION
// ---------------------------------------------------------------------------
/**
 * 📘 CODE ORIGIN: Custom Implementation
 * ────────────────────────────────────────────────────────────────────────────
 * Pattern source: Standard API client function structure
 * Custom implementation by me: Focusmate registration endpoint
 * 
 * What I Built:
 * - Typed request (RegisterData)
 * - Typed response (RegisterResponse)
 * - POST to /auth/register
 * - Returns user data (no tokens - user must verify email first)
 * 
 * Used By: register/page.tsx
 * ────────────────────────────────────────────────────────────────────────────
 */
export const registerUser = async (data: RegisterData): Promise<RegisterResponse> => {
  const response = await axiosInstance.post('/auth/register', data);
  return response.data;
};

// ---------------------------------------------------------------------------
// USER LOGIN WITH ENHANCED DEBUGGING
// ---------------------------------------------------------------------------
/**
 * 📘 CODE ORIGIN: Custom Implementation with Debugging
 * ────────────────────────────────────────────────────────────────────────────
 * Pattern source: Standard API client with try-catch
 * Custom implementation by me: Enhanced error logging for debugging
 * 
 * What I Built:
 * - Comprehensive error logging (message, response, status, URL, baseURL)
 * - Helps debug connection issues during development
 * - Re-throws original error (preserves error chain)
 * 
 * Why Enhanced Logging:
 * Login failures can have many causes (wrong credentials, network issues,
 * backend down, CORS, wrong URL). Detailed logs help identify the issue quickly.
 * 
 * Used By: login/page.tsx
 * ────────────────────────────────────────────────────────────────────────────
 */
export const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  } catch (error: any) {
    // Custom: Comprehensive error logging for debugging
    console.error('Login error details:', {
      message: error.message,
      response: error.response?.data,     // Backend error message
      status: error.response?.status,     // HTTP status code
      url: error.config?.url,             // Endpoint
      baseURL: error.config?.baseURL,     // Base URL being used
    });
    throw error;  // Re-throw for component to handle
  }
};

// ---------------------------------------------------------------------------
// GET CURRENT USER PROFILE
// ---------------------------------------------------------------------------
/**
 * 📘 CODE ORIGIN: Custom Implementation
 * ────────────────────────────────────────────────────────────────────────────
 * What I Built:
 * - GET /auth/me (protected endpoint, requires auth token)
 * - Returns complete UserProfile (includes avatar, verification status)
 * 
 * Used By:
 * - login/page.tsx (fetch full profile after login)
 * - Navbar (get latest user data)
 * - Profile page (display user information)
 * ────────────────────────────────────────────────────────────────────────────
 */
export const getCurrentUser = async (): Promise<{ message: string; user: UserProfile }> => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

// ---------------------------------------------------------------------------
// EMAIL VERIFICATION (TOKEN-BASED - LEGACY)
// ---------------------------------------------------------------------------
/**
 * 📘 CODE ORIGIN: Custom Implementation
 * ────────────────────────────────────────────────────────────────────────────
 * What I Built:
 * - GET /auth/verify-email/:token
 * - Token comes from email link
 * - Legacy system (now using OTP codes instead)
 * 
 * Why Keep:
 * Maintained for backward compatibility if any old verification emails
 * still in circulation.
 * ────────────────────────────────────────────────────────────────────────────
 */
export const verifyEmail = async (token: string): Promise<{ message: string }> => {
  const response = await axiosInstance.get(`/auth/verify-email/${token}`);
  return response.data;
};

// ---------------------------------------------------------------------------
// RESEND VERIFICATION EMAIL (TOKEN-BASED - LEGACY)
// ---------------------------------------------------------------------------
/**
 * 📘 CODE ORIGIN: Custom Implementation
 * ────────────────────────────────────────────────────────────────────────────
 * Legacy token-based resend (replaced by OTP system)
 * Kept for backward compatibility
 * ────────────────────────────────────────────────────────────────────────────
 */
export const resendVerificationEmail = async (email: string): Promise<{ message: string }> => {
  const response = await axiosInstance.post('/auth/resend-verification', { email });
  return response.data;
};

// ---------------------------------------------------------------------------
// SEND EMAIL VERIFICATION CODE (OTP-BASED - CURRENT SYSTEM)
// ---------------------------------------------------------------------------
/**
 * 📘 CODE ORIGIN: Custom Implementation with Enhanced Debugging
 * ────────────────────────────────────────────────────────────────────────────
 * Pattern source: API client with try-catch
 * Custom implementation by me: 6-digit OTP verification system with logging
 * 
 * What I Built:
 * - POST /auth/send-verification-email with email
 * - Backend sends 6-digit code to email
 * - Returns canResendIn (cooldown duration)
 * - Dev mode: Returns code in response (testing)
 * - Enhanced error logging with emojis (better debugging)
 * - Enhanced error object with response and status
 * 
 * Why Enhanced Error:
 * Components need access to response.data.message and status code for
 * user-friendly error messages. Enhanced error object provides this.
 * 
 * Used By: verify-email/page.tsx
 * ────────────────────────────────────────────────────────────────────────────
 */
export const sendVerificationEmailCode = async (email: string): Promise<{ message: string; canResendIn?: number; code?: string; devMode?: boolean }> => {
  try {
    // Custom: Request logging (debugging)
    console.log('📧 Frontend: Sending verification code request to:', '/auth/send-verification-email');
    console.log('📧 Frontend: Email:', email);
    
    const response = await axiosInstance.post('/auth/send-verification-email', { email });
    
    // Custom: Success logging (debugging)
    console.log('✅ Frontend: Verification code response:', response.data);
    return response.data;
    
  } catch (error: any) {
    // Custom: Comprehensive error logging (debugging)
    console.error('❌ Frontend: Send verification code error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullError: error,
    });
    
    // -----------------------------------------------------------------------
    // Custom: Enhanced error object (MY implementation)
    // -----------------------------------------------------------------------
    // Standard approach: Just throw error
    // My enhancement: Create new error with better message and attach
    // response/status for components to access
    // 
    // Why:
    // Components show user-friendly error messages based on backend response.
    // Need access to error.response.data.message and status code.
    const enhancedError = new Error(error.response?.data?.message || error.message || 'Failed to send verification code');
    (enhancedError as any).response = error.response;
    (enhancedError as any).status = error.response?.status;
    throw enhancedError;
  }
};

// ---------------------------------------------------------------------------
// VERIFY EMAIL WITH CODE (OTP-BASED - CURRENT SYSTEM)
// ---------------------------------------------------------------------------
/**
 * 📘 CODE ORIGIN: Custom Implementation
 * ────────────────────────────────────────────────────────────────────────────
 * What I Built:
 * - POST /auth/verify-email-code with email and 6-digit code
 * - Backend validates code
 * - Marks email as verified
 * 
 * Used By: verify-email/code/page.tsx (code entry page)
 * ────────────────────────────────────────────────────────────────────────────
 */
export const verifyEmailCode = async (email: string, code: string): Promise<{ message: string; user?: UserProfile }> => {
  const response = await axiosInstance.post('/auth/verify-email-code', { email, code });
  return response.data;
};

// ---------------------------------------------------------------------------
// PHONE VERIFICATION - SEND OTP
// ---------------------------------------------------------------------------
/**
 * 📘 CODE ORIGIN: Custom Implementation
 * ────────────────────────────────────────────────────────────────────────────
 * What I Built:
 * - POST /auth/send-otp with phoneNumber
 * - Backend sends SMS OTP via Twilio
 * - Optional feature (phone verification not required)
 * 
 * Used By: settings/page.tsx (phone verification section)
 * ────────────────────────────────────────────────────────────────────────────
 */
export const sendOtp = async (phoneNumber: string): Promise<{ message: string }> => {
  const response = await axiosInstance.post('/auth/send-otp', { phoneNumber });
  return response.data;
};

// ---------------------------------------------------------------------------
// PHONE VERIFICATION - VERIFY OTP
// ---------------------------------------------------------------------------
/**
 * 📘 CODE ORIGIN: Custom Implementation
 * ────────────────────────────────────────────────────────────────────────────
 * What I Built:
 * - POST /auth/verify-otp with phoneNumber and OTP
 * - Marks phone as verified
 * 
 * Used By: settings/page.tsx (phone verification section)
 * ────────────────────────────────────────────────────────────────────────────
 */
export const verifyOtp = async (phoneNumber: string, otp: string): Promise<{ message: string }> => {
  const response = await axiosInstance.post('/auth/verify-otp', { phoneNumber, otp });
  return response.data;
};

// ---------------------------------------------------------------------------
// FORGOT PASSWORD - REQUEST RESET
// ---------------------------------------------------------------------------
/**
 * 📘 CODE ORIGIN: Custom Implementation
 * ────────────────────────────────────────────────────────────────────────────
 * What I Built:
 * - POST /auth/forgot-password with email
 * - Backend sends password reset OTP to email
 * 
 * Used By: forgot-password/page.tsx
 * ────────────────────────────────────────────────────────────────────────────
 */
export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const response = await axiosInstance.post('/auth/forgot-password', { email });
  return response.data;
};

// ---------------------------------------------------------------------------
// RESET PASSWORD WITH OTP
// ---------------------------------------------------------------------------
/**
 * 📘 CODE ORIGIN: Custom Implementation
 * ────────────────────────────────────────────────────────────────────────────
 * What I Built:
 * - POST /auth/reset-password with email, OTP, and newPassword
 * - Validates OTP
 * - Updates password
 * 
 * Used By: reset-password/page.tsx
 * ────────────────────────────────────────────────────────────────────────────
 */
export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string
): Promise<{ message: string }> => {
  const response = await axiosInstance.post('/auth/reset-password', {
    email,
    otp,
    newPassword,
  });
  return response.data;
};

// ---------------------------------------------------------------------------
// LOGOUT USER
// ---------------------------------------------------------------------------
/**
 * 📘 CODE ORIGIN: Custom Implementation
 * ────────────────────────────────────────────────────────────────────────────
 * What I Built:
 * - POST /auth/logout
 * - Invalidates refresh token on backend
 * - Component also clears local storage and Zustand store
 * 
 * Used By: navbar.tsx (logout button)
 * ────────────────────────────────────────────────────────────────────────────
 */
export const logoutUser = async (): Promise<{ message: string }> => {
  const response = await axiosInstance.post('/auth/logout');
  return response.data;
};

// ---------------------------------------------------------------------------
// UPDATE USER PROFILE
// ---------------------------------------------------------------------------
/**
 * 📘 CODE ORIGIN: Custom Implementation
 * ────────────────────────────────────────────────────────────────────────────
 * What I Built:
 * - PATCH /auth/me with UpdateProfileData (partial update)
 * - Updates name, email, phoneNumber, or avatarUrl
 * - Returns updated UserProfile
 * 
 * Used By:
 * - settings/page.tsx (profile updates)
 * - Avatar upload functionality
 * ────────────────────────────────────────────────────────────────────────────
 */
export const updateProfile = async (data: UpdateProfileData): Promise<{ message: string; user: UserProfile }> => {
  const response = await axiosInstance.patch('/auth/me', data);
  return response.data;
};

/**
 * ============================================================================
 * WHAT I BUILT VS WHAT I ADAPTED
 * ============================================================================
 * 
 * LIBRARY CODE (Not original):
 * ❌ axios.post(), axios.get(), axios.patch() (Axios library methods)
 * ❌ async/await syntax (JavaScript language feature)
 * 
 * ADAPTED PATTERNS:
 * 🔄 API client module structure (common pattern, my endpoints)
 * 🔄 TypeScript interfaces (pattern, my specific types)
 * 🔄 Try-catch error handling (pattern, my logging implementation)
 * 
 * MY CUSTOM IMPLEMENTATIONS:
 * ✅ All 6 TypeScript interfaces (RegisterData, LoginData, LoginResponse,
 *    RegisterResponse, UserProfile, UpdateProfileData)
 * ✅ All 13 API functions (register, login, getCurrentUser, verifyEmail, etc.)
 * ✅ Enhanced error logging (loginUser, sendVerificationEmailCode)
 * ✅ Enhanced error objects (response and status attachment)
 * ✅ Dual verification system (token-based + OTP-based)
 * ✅ All endpoint paths (/auth/register, /auth/login, etc.)
 * ✅ Request/response typing (ensures type safety)
 * ✅ Console logging with emojis (debugging aid)
 * 
 * ============================================================================
 * HOW TO EXPLAIN DURING VIVA
 * ============================================================================
 * 
 * Question: "How does your frontend communicate with the backend?"
 * 
 * Answer:
 * "I created a centralized API client layer that handles all backend communication.
 * For authentication, I built /lib/api/auth.ts which exports 13 typed functions
 * covering the complete auth lifecycle:
 * 
 * **Type Safety**: I defined TypeScript interfaces for all requests and responses.
 * For example, LoginResponse specifies that the backend returns access_token,
 * refresh_token, and a user object with specific fields. This catches errors
 * at compile time rather than runtime.
 * 
 * **Abstraction**: Components import functions like registerUser() or loginUser()
 * rather than making raw axios calls. This centralizes endpoint URLs and makes
 * updates easier - if the backend API changes, I only update this file.
 * 
 * **Error Handling**: I enhanced error handling in critical functions. For example,
 * in loginUser(), I log comprehensive error details (response, status, URL) to
 * help debug connection issues. In sendVerificationEmailCode(), I create an
 * enhanced error object that includes the backend response and status code, so
 * components can show user-friendly error messages.
 * 
 * **Dual Verification**: I support two email verification methods - the original
 * token-based system (verifyEmail) and the new OTP system (sendVerificationEmailCode,
 * verifyEmailCode). I kept both for backward compatibility.
 * 
 * **Authentication Flow**: The functions work together: registerUser() creates
 * account → sendVerificationEmailCode() sends OTP → verifyEmailCode() verifies
 * → loginUser() returns tokens → getCurrentUser() fetches complete profile.
 * 
 * All functions use my custom axios instance (from ../axios.ts) which handles
 * token injection and automatic token refresh transparently."
 * 
 * ============================================================================
 */
