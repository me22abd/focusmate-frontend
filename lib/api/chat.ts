/**
 * Chat History API Client
 * Handles saving and retrieving chat messages from the backend
 */
import axiosInstance from '@/lib/axios';

// Shared ChatMessage interface - used across chat and AI modules
export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  conversationId?: string | null;
  createdAt?: string;
  timestamp?: string; // For frontend compatibility
}

// Compatible type for AI module (without system role for OpenAI)
export type AIMessage = Omit<ChatMessage, 'role' | 'id' | 'conversationId' | 'createdAt'> & {
  role: 'user' | 'assistant';
};

export interface SaveChatMessageResponse {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  conversationId: string | null;
  createdAt: string;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  count: number;
}

/**
 * Save a chat message to the backend
 */
export const saveChatMessage = async (
  role: 'user' | 'assistant' | 'system',
  content: string,
  conversationId?: string
): Promise<SaveChatMessageResponse> => {
  const response = await axiosInstance.post<SaveChatMessageResponse>('/ai/chat/save', {
    role,
    content,
    conversationId: conversationId || undefined,
  });
  return response.data;
};

/**
 * Get chat history from the backend
 * @param limit - Number of messages to retrieve (default: 50)
 * @param conversationId - Optional conversation ID filter
 */
export const getChatHistory = async (
  limit: number = 50,
  conversationId?: string
): Promise<ChatMessage[]> => {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  if (conversationId) {
    params.append('conversationId', conversationId);
  }

  const response = await axiosInstance.get<ChatHistoryResponse>(
    `/ai/chat/history?${params.toString()}`
  );
  
  // Transform backend response to frontend format
  return response.data.messages.map((msg) => ({
    ...msg,
    timestamp: msg.createdAt, // Map createdAt to timestamp for frontend compatibility
  }));
};
