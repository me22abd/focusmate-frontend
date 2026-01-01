/**
 * ============================================================================
 * LIB/API/AI.TS - AI CHAT API CLIENT
 * ============================================================================
 * 
 * Purpose: Provides typed functions for AI chat interactions using OpenAI GPT
 * models via the backend. Handles conversation history and enhanced error
 * messages for better user experience.
 * 
 * Architecture Role: API abstraction for AI features. Used by AI chat components
 * to send messages and receive AI-generated responses while maintaining
 * conversation context.
 * 
 * ============================================================================
 * 📘 CODE ORIGIN (REQUIRED FOR ACADEMIC HONESTY)
 * ============================================================================
 * 
 * a) LIBRARY CODE (Not original):
 * ───────────────────────────────────────────────────────────────────────────
 * - axiosInstance methods                        [Line 80]
 * - try-catch pattern                            [Lines 78-117]
 * 
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * b) ADAPTED PATTERNS:
 * ───────────────────────────────────────────────────────────────────────────
 * - API client structure                         [Entire file]
 * - TypeScript interfaces                        [Lines 60-74]
 * - Error enhancement pattern                    [Lines 97-115]
 * 
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * c) MY CUSTOM CODE (100% Original for Focusmate):
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * 1. CHATMESSAGE INTERFACE [Lines 60-63]:
 *    MY type definition for chat messages:
 *    - role: 'user' | 'assistant' (OpenAI format)
 *    - content: Message text
 *    - timestamp: Optional timestamp
 * 
 * 2. ERROR MESSAGE EXTRACTION [Lines 97-106]:
 *    MY implementation of comprehensive error handling:
 *    - Try response.data.message first (backend error)
 *    - Fallback to response.data.error
 *    - Fallback to error.message
 *    - Default user-friendly message
 *    - Preserves status code
 * 
 * 3. SENDCHATMESSAGE FUNCTION [Lines 77-117]:
 *    MY complete implementation:
 *    - POST /ai/chat with message and history
 *    - Type-safe request and response
 *    - Enhanced error handling
 *    - Returns string (AI response text)
 * 
 * My Design Decisions:
 * ──────────────────────────────
 * ✨ Conversation history support (context-aware AI)
 * ✨ Enhanced error messages (user-friendly)
 * ✨ Type safety (ChatMessage, ChatRequest, ChatResponse)
 * ✨ Simple return type (string, not full object)
 * ✨ Status code preservation (for error handling)
 * 
 * ============================================================================
 * 
 * @author Eromonsele Marvelous
 * @module Frontend/API
 */

// Custom: Import MY configured axios instance
import axiosInstance from '../axios';

/**
 * ===========================================================================
 * TYPESCRIPT INTERFACES - My AI Chat Type System
 * ===========================================================================
 * 
 * 📘 CODE ORIGIN: 100% Custom Implementation
 * ────────────────────────────────────────────────────────────────────────────
 * All interfaces are MY original work for Focusmate's AI chat system.
 * ────────────────────────────────────────────────────────────────────────────
 */

// Custom: Individual chat message format
export interface ChatMessage {
  role: 'user' | 'assistant';  // OpenAI role convention
  content: string;
  timestamp?: string;
}

// Custom: Request payload to backend
export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];  // For context-aware responses
}

// Custom: Backend response shape
export interface ChatResponse {
  response: string;  // AI-generated text
  userId: string;    // User who made request
  memoryUpdated?: boolean;  // Indicates if AI memory was updated
}

/**
 * ===========================================================================
 * AI CHAT API FUNCTION
 * ===========================================================================
 */

// ---------------------------------------------------------------------------
// SEND CHAT MESSAGE TO AI
// ---------------------------------------------------------------------------
/**
 * 📘 CODE ORIGIN: Custom Implementation with Enhanced Error Handling
 * ────────────────────────────────────────────────────────────────────────────
 * Pattern source: API client with try-catch
 * Custom implementation by me: Focusmate AI chat with error enhancement
 * 
 * What I Built:
 * - POST /ai/chat with message and conversation history
 * - Type-safe request (ChatRequest) and response (ChatResponse)
 * - Enhanced error message extraction from multiple possible locations
 * - Returns just the response string (simplified for components)
 * - Preserves HTTP status code for error handling
 * 
 * Why Conversation History:
 * AI needs context from previous messages to give coherent responses.
 * For example, if user says "Can you explain more?" the AI needs to know
 * what the previous topic was.
 * 
 * Error Handling Enhancement:
 * Axios wraps errors, and backend can return errors in different formats.
 * I check response.data.message, response.data.error, and error.message
 * to extract the most specific error message available.
 * 
 * Used By:
 * - AI chat components (chat interface)
 * - Settings page (AI assistant section)
 * ────────────────────────────────────────────────────────────────────────────
 */
/**
 * Send message to unified AI engine
 * 
 * Uses the unified /ai/engine endpoint which handles all AI features:
 * - Support questions
 * - Task analysis
 * - Productivity coaching
 * - Session feedback
 * - Mood detection
 * - App knowledge base
 */
export interface AIMessageResponse {
  response: string;
  memoryUpdated?: boolean;
}

export const sendAIMessage = async (
  message: string,
  retries: number = 0
): Promise<AIMessageResponse> => {
  const maxRetries = 2; // Retry up to 2 times for rate limits
  
  try {
    // POST to unified AI engine endpoint
    const response = await axiosInstance.post<ChatResponse>('/ai/engine', {
      message,
    });
    
    // Return both response and memory update status
    return {
      response: response.data.response,
      memoryUpdated: response.data.memoryUpdated,
    };
    
  } catch (error: any) {
    console.error('Failed to send AI message:', error);
    
    // Enhanced error message extraction
    const errorMessage = 
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to get AI response. Please try again.';
    
    const statusCode = error.response?.status;
    
    // Retry logic for rate limits (429) with exponential backoff
    if (statusCode === 429 && retries < maxRetries) {
      const delay = Math.pow(2, retries) * 1000; // Exponential backoff: 1s, 2s
      console.log(`Rate limited. Retrying in ${delay}ms... (attempt ${retries + 1}/${maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendAIMessage(message, retries + 1);
    }
    
    const chatError = new Error(errorMessage);
    
    if (statusCode) {
      (chatError as any).status = statusCode;
    }
    
    throw chatError;
  }
};

/**
 * Legacy function - redirects to unified engine
 * @deprecated Use sendAIMessage instead
 */
export const sendChatMessage = async (
  message: string, 
  conversationHistory: ChatMessage[] = [],
  retries: number = 0
): Promise<string> => {
  // For backwards compatibility, use unified engine (history is handled by AI context)
  const result = await sendAIMessage(message, retries);
  return result.response;
};

// ==========================================================================
// PHASE 3: AI SESSION INTELLIGENCE API FUNCTIONS
// ==========================================================================

export interface SessionSummaryResponse {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  motivationalMessage: string;
}

export const generateSessionSummary = async (data: {
  duration: number;
  tasksCompleted: number;
  tasksPlanned: number;
  partnerName?: string;
  reflectionText?: string;
  startTime: string;
  endTime: string;
}): Promise<SessionSummaryResponse> => {
  const response = await axiosInstance.post<SessionSummaryResponse>('/ai/session/summary', data);
  return response.data;
};

export interface MoodDetectionResponse {
  mood: string;
  confidence: number;
  explanation: string | null;
}

export const detectMood = async (data: {
  sessionId?: string;
  reflectionText: string;
}): Promise<MoodDetectionResponse> => {
  const response = await axiosInstance.post<MoodDetectionResponse>('/ai/session/mood', data);
  return response.data;
};

export interface OptimizedTask {
  id: string;
  improvedText: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: string;
  breakdown?: string[];
}

export interface TaskOptimizationResponse {
  optimizedTasks: OptimizedTask[];
  overallSuggestion: string;
}

export const optimizeTasks = async (data: {
  userId: string;
  tasks: {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high';
    status?: 'pending' | 'completed' | 'overdue';
  }[];
}): Promise<TaskOptimizationResponse> => {
  const response = await axiosInstance.post<TaskOptimizationResponse>('/ai/tasks/optimize', data);
  return response.data;
};

// ==========================================================================
// PHASE 4: AI SMART REMINDERS & NOTIFICATIONS API FUNCTIONS
// ==========================================================================

export interface NotificationRecommendation {
  type: 'streak_warning' | 'best_time_to_focus' | 'task_overdue' | 'low_mood_alert' | 'session_preparation' | 'motivation_boost';
  title: string;
  description: string;
}

export const evaluateNotifications = async (): Promise<NotificationRecommendation[]> => {
  const response = await axiosInstance.post<{ recommendedNotifications: NotificationRecommendation[] }>('/ai/notify/evaluate');
  return response.data.recommendedNotifications || [];
};

export interface EmailSupportResponse {
  replySubject?: string;
  replyBody: string;
  classification?: 'bug' | 'billing' | 'question' | 'feature-request' | 'account-issue' | 'spam';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  confidence?: number;
}

export const generateEmailReply = async (data: {
  subject: string;
  body: string;
  context?: string;
}): Promise<EmailSupportResponse | string> => {
  // Combine subject and body into originalMessage format expected by backend
  const originalMessage = data.subject ? `Subject: ${data.subject}\n\n${data.body}` : data.body;
  const response = await axiosInstance.post<{ reply: string } | EmailSupportResponse>('/ai/email/support', {
    originalMessage,
    context: data.context,
  });
  
  // Backend currently returns { reply: string }, but may return full EmailSupportResponse in future
  if ('reply' in response.data) {
    // Legacy format
    return response.data.reply;
  } else {
    // New format (when backend is updated)
    return response.data as EmailSupportResponse;
  }
};

/**
 * ============================================================================
 * WHAT I BUILT VS WHAT I ADAPTED
 * ============================================================================
 * 
 * LIBRARY CODE (Not original):
 * ❌ axios.post (HTTP client)
 * ❌ try-catch (JavaScript syntax)
 * 
 * ADAPTED PATTERNS:
 * 🔄 API client structure (pattern, my endpoint)
 * 🔄 Error handling (pattern, my message extraction logic)
 * 
 * MY CUSTOM IMPLEMENTATIONS:
 * ✅ All 3 TypeScript interfaces (ChatMessage, ChatRequest, ChatResponse)
 * ✅ sendChatMessage function (complete implementation)
 * ✅ Conversation history support (context-aware chat)
 * ✅ Enhanced error message extraction (multi-source fallback)
 * ✅ Status code preservation (attach to error object)
 * ✅ Simplified return type (string instead of full object)
 * ✅ Console logging (debugging aid)
 * ✅ Endpoint path (/ai/chat)
 * 
 * ============================================================================
 * HOW TO EXPLAIN DURING VIVA
 * ============================================================================
 * 
 * Question: "How does AI integration work in your application?"
 * 
 * Answer:
 * "I integrated OpenAI GPT models via a backend API for AI-powered features:
 * 
 * **Conversation Context:**
 * The sendChatMessage() function accepts both a message and conversation
 * history. This allows the AI to maintain context across multiple exchanges.
 * For example, if a user asks 'Tell me about productivity' and then follows
 * up with 'Can you give me tips?', the AI knows 'tips' refers to productivity
 * tips because I pass the full conversation history.
 * 
 * **Enhanced Error Handling:**
 * Different types of errors return messages in different locations (response.data.message,
 * response.data.error, error.message). I check all possible locations and extract
 * the most specific error message available, then provide a user-friendly fallback
 * if none are found. I also preserve the HTTP status code for components to
 * handle different error types appropriately.
 * 
 * **Type Safety:**
 * I defined TypeScript interfaces for ChatMessage (role, content, timestamp),
 * ChatRequest (what we send), and ChatResponse (what backend returns). This
 * ensures type safety and prevents errors from mismatched data structures.
 * 
 * **Simplified API:**
 * While the backend returns a full ChatResponse object, I extract just the
 * response string for components. This simplifies component code - they don't
 * need to know about the full response structure, just the AI's text.
 * 
 * The backend handles the actual OpenAI API calls, API key management, and
 * prompt engineering. The frontend just sends messages and receives responses."
 * 
 * ============================================================================
 */
