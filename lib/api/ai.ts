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
export const sendChatMessage = async (
  message: string, 
  conversationHistory: ChatMessage[] = [],
  retries: number = 0
): Promise<string> => {
  const maxRetries = 2; // Retry up to 2 times for rate limits
  
  try {
    // Custom: POST to MY AI endpoint with message and history
    const response = await axiosInstance.post<ChatResponse>('/ai/chat', {
      message,
      conversationHistory,
    });
    
    // Custom: Extract just the response string (simplify for components)
    return response.data.response;
    
  } catch (error: any) {
    console.error('Failed to send chat message:', error);
    
    // -----------------------------------------------------------------------
    // Custom: Enhanced error message extraction (MY implementation)
    // -----------------------------------------------------------------------
    // Backend can return errors in various formats depending on error type:
    // - Validation error: response.data.message
    // - General error: response.data.error
    // - Network error: error.message
    // 
    // Check all possible locations and provide user-friendly fallback
    const errorMessage = 
      error.response?.data?.message ||      // Backend validation error
      error.response?.data?.error ||        // Backend general error
      error.message ||                      // Network/client error
      'Failed to get AI response. Please try again.';  // Fallback
    
    const statusCode = error.response?.status;
    
    // Retry logic for rate limits (429) with exponential backoff
    if (statusCode === 429 && retries < maxRetries) {
      const delay = Math.pow(2, retries) * 1000; // Exponential backoff: 1s, 2s
      console.log(`Rate limited. Retrying in ${delay}ms... (attempt ${retries + 1}/${maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendChatMessage(message, conversationHistory, retries + 1);
    }
    
    // Custom: Create new Error with extracted message
    const chatError = new Error(errorMessage);
    
    // Custom: Preserve HTTP status code (for components to check)
    if (statusCode) {
      (chatError as any).status = statusCode;
    }
    
    throw chatError;
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
