/**
 * Admin API Client
 * Handles all admin-related API calls with separate admin_token cookie
 */

import axios from 'axios';

// Admin API Base URL - Always use port 3001 for admin endpoints
// CRITICAL: Admin endpoints are on port 3001, not 3000
// CRITICAL: baseURL is http://localhost:3001/admin (includes /admin prefix)
const getAdminBaseURL = () => {
  // Always use port 3001 for admin API
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Use port 3001 and include /admin prefix
    return `http://${hostname}:3001/admin`;
  }
  return 'http://localhost:3001/admin';
};

// Helper to get base URL for shared routes (not under /admin prefix)
// CRITICAL: Some routes like /analytics/overview and /sessions/history are shared
// They need to use port 3001 but without /admin prefix
const getSharedBaseURL = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return `http://${hostname}:3001`;
  }
  return 'http://localhost:3001';
};

// Create separate axios instance for admin (uses admin_token cookie)
// CRITICAL: baseURL must be http://localhost:3001/admin (port 3001, not 3000)
// CRITICAL: withCredentials must be true to send cookies
const adminAxios = axios.create({
  baseURL: 'http://localhost:3001/admin', // Fixed baseURL - always port 3001
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for cookie-based auth - sends cookies with requests
});

// Set axios defaults
axios.defaults.withCredentials = true;

// Request interceptor: Log document.cookie before every request
// CRITICAL: admin_token is httpOnly, so JavaScript can't read it from document.cookie
// CRITICAL: Browser automatically sends cookie with withCredentials: true
adminAxios.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      console.log('🔵 AdminAxios Request Interceptor');
      console.log('  BaseURL:', config.baseURL);
      console.log('  Full URL:', config.baseURL ? `${config.baseURL}${config.url}` : config.url);
      console.log('  document.cookie:', document.cookie || '(empty or httpOnly cookies not visible)');
      console.log('  withCredentials:', config.withCredentials);
      console.log('  admin_token cookie: Will be sent automatically by browser (httpOnly)');
      
      // CRITICAL: Ensure withCredentials is true
      config.withCredentials = true;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401/403 errors - ONLY log, do NOT redirect
// CRITICAL: Remove automatic redirection - let components handle redirects
adminAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401/403 errors - ONLY log, do NOT redirect
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('❌ Admin API authentication error:');
      console.error('  Status:', error.response?.status);
      console.error('  URL:', error.config?.url);
      console.error('  BaseURL:', error.config?.baseURL);
      console.error('  Full URL:', error.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error.config?.url);
      console.error('  Response data:', error.response?.data);
      console.error('  document.cookie:', typeof document !== 'undefined' ? document.cookie : 'N/A');
      console.error('  ⚠️ No automatic redirect - component should handle this');
    }
    return Promise.reject(error);
  }
);

// Helper to get cookie value (works in both client and server)
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Helper to set cookie with secure settings
// CRITICAL: httpOnly is NOT set (disabled) so axios can read the cookie
// This allows the request interceptor to extract admin_token and add it to Authorization header
// Note: Server-side Set-Cookie header can set httpOnly, but we need client-side access
// CRITICAL: Must be readable by axios request interceptor
function setCookie(name: string, value: string, days = 7) {
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
function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  const isSecure = window.location.protocol === 'https:' || process.env.NODE_ENV === 'production';
  const secureFlag = isSecure ? ';secure' : '';
  // SameSite=Lax to match setCookie
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax${secureFlag}`;
}

// ============================================================================
// TYPES
// ============================================================================

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    lastLoginAt: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  suspended: boolean;
  role: string;
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface SystemHealth {
  dbStatus: string;
  dbLatency?: string;
  uptime?: string;
  memoryUsage?: string;
  cpuUsage?: string;
  environment?: string;
  error?: string;
  timestamp?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number; // Non-suspended users
  suspendedUsers: number; // Suspended users
  activeUsersToday: number; // Users who logged in today
  sessionsToday: number;
  totalSessions: number;
  newUsersThisWeek: number;
  // Legacy fields for backward compatibility
  chartData?: Array<{ label: string; value: number }>;
}

export interface Session {
  id: string;
  userAId?: string;
  userBId?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  taskId?: string;
  notesCount?: number;
}

export interface UserDetails {
  id: string;
  name: string;
  email: string;
  notesCount?: number;
  tasksCount?: number;
  flashcardsCount?: number;
  sessionsCount?: number;
  suspended: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

// Analytics Types
export interface AnalyticsOverview {
  totalSessions?: number;
  totalLogs?: number;
  activeUsers?: number;
  dailyActiveUsers?: Array<{ date: string; count: number }>;
  weeklySignups?: Array<{ date: string; count: number }>;
}

export interface HourlySessions {
  hourlyDistribution?: Record<string, number>;
  bestHour?: number;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalMinutes: number;
  sessionCount: number;
}

export interface DailyActiveData {
  days?: Array<{ date: string; minutes: number }>;
  range?: number;
}

// ============================================================================
// ADMIN AUTHENTICATION
// ============================================================================

export interface AdminRegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AdminRegisterResponse {
  message: string;
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface AdminCreateRequest {
  name: string;
  email: string;
  password: string;
}

export interface AdminCreateResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export async function adminRegister(name: string, email: string, password: string): Promise<AdminRegisterResponse> {
  // Use admin axios instance which already has correct baseURL (port 3001)
  const response = await adminAxios.post<AdminRegisterResponse>(
    '/register', // Relative path - baseURL already includes /admin
    { name, email, password },
    { withCredentials: true } // Ensure credentials are sent
  );
  
  // CRITICAL: Backend sets admin_token as httpOnly cookie automatically
  // Frontend does NOT need to set it (httpOnly cookies can't be set by JavaScript anyway)
  // The cookie is sent automatically by browser with withCredentials: true
  
  return response.data;
}

export async function adminLogin(email: string, password: string): Promise<AdminLoginResponse> {
  // Use admin axios instance which already has correct baseURL (port 3001)
  // Backend endpoint: POST /admin/auth/login
  const response = await adminAxios.post<AdminLoginResponse>(
    '/auth/login', // Relative path - baseURL already includes /admin, so this becomes /admin/auth/login
    { email, password },
    { withCredentials: true } // Ensure credentials are sent
  );
  
  // CRITICAL: Backend sets admin_token as httpOnly cookie automatically
  // Frontend does NOT need to set it (httpOnly cookies can't be set by JavaScript anyway)
  // The cookie is sent automatically by browser with withCredentials: true
  
  return response.data;
}

export async function createAdmin(name: string, email: string, password: string): Promise<AdminCreateResponse> {
  const response = await adminAxios.post<AdminCreateResponse>(
    '/create', // Relative path - baseURL already includes /admin
    { name, email, password }
  );
  return response.data;
}

export async function getAdmins(): Promise<Admin[]> {
  const response = await adminAxios.get<Admin[]>('/admins'); // Relative path - baseURL already includes /admin
  return response.data;
}

export function adminLogout() {
  deleteCookie('admin_token');
  // CRITICAL: Always redirect to admin login, never user login
  if (typeof window !== 'undefined') {
    // Use hard redirect to ensure cookie is cleared
    window.location.href = '/admin/login';
  }
}

// Helper to get admin ID from token (decode JWT)
export function getAdminIdFromToken(): string | null {
  if (typeof document === 'undefined') return null;
  const token = getCookie('admin_token');
  if (!token) return null;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded?.sub || null;
  } catch {
    return null;
  }
}

// ============================================================================
// SYSTEM MONITORING
// ============================================================================

export async function getSystemHealth(): Promise<SystemHealth> {
  const response = await adminAxios.get<SystemHealth>('/system-health'); // Relative path - baseURL already includes /admin
  return response.data;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await adminAxios.get<DashboardStats>('/dashboard'); // Relative path - baseURL already includes /admin
  return response.data;
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export async function getAllUsers(): Promise<User[]> {
  try {
    console.log('🔍 Fetching all users from /admin/users...');
    const response = await adminAxios.get<User[]>('/users'); // Relative path - baseURL already includes /admin
    console.log('✅ Users API response:', response);
    console.log('✅ Users data:', response.data);
    console.log(`✅ Received ${Array.isArray(response.data) ? response.data.length : 0} users`);
    
    // Ensure we always return an array
    const users = Array.isArray(response.data) ? response.data : [];
    console.log(`✅ Returning ${users.length} users to component`);
    return users;
  } catch (error: any) {
    console.error('❌ Failed to fetch users:', error);
    console.error('❌ Error response:', error.response);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error data:', error.response?.data);
    
    // Return empty array on error instead of throwing
    return [];
  }
}

export async function suspendUser(userId: string, adminId: string): Promise<{ message: string }> {
  const response = await adminAxios.patch<{ message: string }>(
    `/users/${userId}/suspend`, // Relative path - baseURL already includes /admin
    { adminId }
  );
  return response.data;
}

export async function deleteUser(userId: string, adminId: string): Promise<{ message: string }> {
  const response = await adminAxios.delete<{ message: string }>(
    `/users/${userId}`, // Relative path - baseURL already includes /admin
    { data: { adminId } }
  );
  return response.data;
}

export async function getUserDetails(userId: string): Promise<UserDetails> {
  try {
    // Try to get user details - if endpoint doesn't exist, return basic info
    const response = await adminAxios.get(`/users/${userId}/details`); // Relative path - baseURL already includes /admin
    return response.data;
  } catch {
    // Fallback: return basic user info
    const users = await getAllUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    return {
      ...user,
      notesCount: 0,
      tasksCount: 0,
      flashcardsCount: 0,
      sessionsCount: 0,
    };
  }
}

export async function resetUserPassword(userId: string, adminId: string): Promise<{ message: string; temporaryPassword?: string }> {
  try {
    const response = await adminAxios.post<{ message: string; temporaryPassword?: string }>(
      `/users/${userId}/reset-password`, // Relative path - baseURL already includes /admin
      { adminId }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to reset password');
  }
}

// ============================================================================
// ANALYTICS
// ============================================================================

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  try {
    // Route: GET /analytics/overview (shared route, not under /admin)
    // Uses sharedAxios which has baseURL: http://localhost:3001 (port 3001, no /admin)
    const response = await sharedAxios.get<AnalyticsOverview>('/analytics/overview');
    return response.data;
  } catch (error: any) {
    // Return empty structure if endpoint fails
    return {};
  }
}

export async function getDailyActive(userId?: string): Promise<DailyActiveData> {
  try {
    // If no userId, we'll need to aggregate - for now return empty
    // In production, you'd have an admin endpoint for aggregated daily data
    if (!userId) {
      return { days: [], range: 7 };
    }
    // Route: GET /sessions/analytics/daily/:userId/7 (shared route, port 3001)
    const response = await sharedAxios.get<DailyActiveData>(`/sessions/analytics/daily/${userId}/7`);
    return response.data;
  } catch (error: any) {
    return { days: [], range: 7 };
  }
}

export async function getHourlySessions(userId?: string): Promise<HourlySessions> {
  try {
    // If no userId, we'll need to aggregate - for now return empty
    if (!userId) {
      return { hourlyDistribution: {}, bestHour: undefined };
    }
    // Route: GET /sessions/analytics/hourly/:userId (shared route, port 3001)
    const response = await sharedAxios.get<HourlySessions>(`/sessions/analytics/hourly/${userId}`);
    return response.data;
  } catch (error: any) {
    return { hourlyDistribution: {}, bestHour: undefined };
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    // Route: GET /sessions/analytics/leaderboard (shared route, port 3001)
    const response = await sharedAxios.get<LeaderboardEntry[]>('/sessions/analytics/leaderboard');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    return [];
  }
}

export async function getRetentionAnalytics() {
  try {
    // Route: GET /analytics/admin/retention (shared route, port 3001)
    const response = await sharedAxios.get('/analytics/admin/retention');
    return response.data;
  } catch {
    return null;
  }
}

// ============================================================================
// SESSIONS
// ============================================================================

export async function getAllSessions(): Promise<Session[]> {
  try {
    // Route: GET /sessions/history?all=true (shared route, port 3001)
    // Uses sharedAxios which has baseURL: http://localhost:3001 (port 3001, no /admin)
    const response = await sharedAxios.get<Session[]>('/sessions/history?all=true');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    console.error('Failed to fetch all sessions:', error);
    return [];
  }
}

export async function testEmailService(): Promise<any> {
  try {
    const response = await adminAxios.post('/mail/test');
    return response.data;
  } catch (error: any) {
    console.error('Failed to test email service:', error);
    throw error;
  }
}

// ============================================================================
// NOTIFICATIONS (Admin)
// ============================================================================

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export async function getAllNotifications(unreadOnly = false): Promise<Notification[]> {
  try {
    const response = await adminAxios.get<{ notifications: Notification[] }>('/notifications', {
      params: { unreadOnly: unreadOnly ? 'true' : 'false' },
    });
    return Array.isArray(response.data.notifications) ? response.data.notifications : [];
  } catch (error: any) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
}

// ============================================================================
// ADMIN LOGS
// ============================================================================

export interface AdminLog {
  id: string;
  action: string;
  targetUserId?: string;
  metadata?: any;
  createdAt: string;
}

export async function getAdminLogs(limit = 10): Promise<{ success: boolean; count: number; logs: AdminLog[] }> {
  try {
    const response = await adminAxios.get(`/logs?limit=${limit}`); // Relative path - baseURL already includes /admin
    return response.data;
  } catch {
    // Fallback if endpoint doesn't exist
    return { success: false, count: 0, logs: [] };
  }
}

// ============================================================================
// ACHIEVEMENTS
// ============================================================================

export interface Achievement {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
}

export async function getAllAchievements(): Promise<Achievement[]> {
  try {
    const response = await adminAxios.get<Achievement[]>('/achievements');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    console.error('Failed to fetch achievements:', error);
    return [];
  }
}
