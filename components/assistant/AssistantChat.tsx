/**
 * Assistant Chat Component
 * Glassmorphic chat window with FocusAI assistant
 * Features: chat messages, input box, animated send button, mascot avatar
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, X, MessageSquare, Plus, Trash2, Clock } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendAIMessage, ChatMessage } from '@/lib/api/ai';
import { useAuthStore } from '@/store/auth-store';
import { FocusAICharacter, FocusAIPose } from '@/components/mascot/FocusAICharacter';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AssistantChatProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// Storage keys are now user-specific (will be generated with userId)
const getConversationsStorageKey = (userId: string) => `focusai_conversations_${userId}`;
const getCurrentConversationKey = (userId: string) => `focusai_current_conversation_id_${userId}`;

export function AssistantChat({ isOpen, onClose, userName }: AssistantChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mascotPose, setMascotPose] = useState<FocusAIPose>('happy');
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuthStore();

  // Load conversations from localStorage (user-specific)
  useEffect(() => {
    if (typeof window === 'undefined' || !user?.id) {
      // Clear conversations if no user
      setConversations([]);
      setCurrentConversationId(null);
      setMessages([]);
      return;
    }
    
    try {
      const conversationsKey = getConversationsStorageKey(user.id);
      const currentIdKey = getCurrentConversationKey(user.id);
      
      const stored = localStorage.getItem(conversationsKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) {
          setConversations(parsed);

          const currentId = localStorage.getItem(currentIdKey);
          if (currentId) {
            const conversation = parsed.find((c: Conversation) => c.id === currentId);
            if (conversation) {
              setCurrentConversationId(currentId);
              setMessages(conversation.messages);
              return;
            }
          }
          // If no current conversation found, use the first one
          if (parsed.length > 0) {
            setCurrentConversationId(parsed[0].id);
            setMessages(parsed[0].messages);
            return;
          }
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }

    // Create new conversation if none exists for this user
    createNewConversation();
  }, [user?.id]); // Reload when user changes

  // Save conversations to localStorage whenever they change (user-specific)
  useEffect(() => {
    if (typeof window === 'undefined' || conversations.length === 0 || !user?.id) return;
    
    try {
      const conversationsKey = getConversationsStorageKey(user.id);
      const currentIdKey = getCurrentConversationKey(user.id);
      
      localStorage.setItem(conversationsKey, JSON.stringify(conversations));
      if (currentConversationId) {
        localStorage.setItem(currentIdKey, currentConversationId);
      }
    } catch (error) {
      console.error('Failed to save conversations:', error);
    }
  }, [conversations, currentConversationId, user?.id]);

  // Update current conversation when messages change
  useEffect(() => {
    if (!currentConversationId || messages.length === 0) return;

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversationId
          ? {
              ...conv,
              messages,
              updatedAt: new Date().toISOString(),
              title: getConversationTitle(messages),
            }
          : conv
      )
    );
  }, [messages, currentConversationId]);

  const getConversationTitle = (msgs: ChatMessage[]): string => {
    const firstUserMessage = msgs.find((m) => m.role === 'user');
    if (firstUserMessage) {
      const content = firstUserMessage.content;
      return content.length > 30 ? content.substring(0, 30) + '...' : content;
    }
    return 'New Conversation';
  };

  const createNewConversation = () => {
    const newId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const greeting: ChatMessage = {
      role: 'assistant',
      content: `Hi ${userName}, ready to focus today? How can I help you?`,
      timestamp: new Date().toISOString(),
    };
    
    const newConversation: Conversation = {
      id: newId,
      title: 'New Conversation',
      messages: [greeting],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setConversations((prev) => [newConversation, ...prev]);
    setCurrentConversationId(newId);
    setMessages([greeting]);
    setShowSidebar(false);
  };

  const switchConversation = (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setMessages(conversation.messages);
      setShowSidebar(false);
    }
  };

  const deleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    
    if (currentConversationId === conversationId) {
      const remaining = conversations.filter((c) => c.id !== conversationId);
      if (remaining.length > 0) {
        switchConversation(remaining[0].id);
      } else {
        createNewConversation();
      }
    }
  };

  const formatConversationDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setMascotPose('help');
      setLastActivityTime(Date.now());
    }
  }, [isOpen]);

  // Inactivity timer - switch to sleep pose after 10 seconds
  useEffect(() => {
    if (!isOpen) return;

    const checkInactivity = () => {
      const timeSinceActivity = Date.now() - lastActivityTime;
      if (timeSinceActivity > 10000 && !isLoading) {
        setMascotPose('neutral');
      }
    };

    inactivityTimerRef.current = setInterval(checkInactivity, 1000);

    return () => {
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
    };
  }, [isOpen, lastActivityTime, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    // Update pose based on message content
    setLastActivityTime(Date.now());
    const message = inputValue.trim().toLowerCase();
    if (message.includes('how') || message.includes('what') || message.includes('why') || message.includes('help')) {
      setMascotPose('help');
    } else if (message.includes('idea') || message.includes('suggestion') || message.includes('tip') || message.includes('advice')) {
      setMascotPose('idea');
    } else {
      setMascotPose('read'); // Default to read for structured responses
    }

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send to unified AI engine (handles all features automatically)
      const response = await sendAIMessage(userMessage.content);

      // Add AI response
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setLastActivityTime(Date.now());
      
      // Show learning message when memory is updated (every 3rd message or randomly)
      // The backend returns memoryUpdated: true, but we show message occasionally to not be annoying
      if (Math.random() > 0.7) { // 30% chance to show learning message
        setTimeout(() => {
          toast.success('🧠 FocusAI is learning your preferences...', {
            description: 'Your conversations help me provide better personalized advice.',
            duration: 3000,
          });
        }, 500);
      }
      
      // Check if response is structured/helpful - use read pose
      if (response.includes('\n') || response.includes('•') || response.includes('-') || response.length > 100) {
        setMascotPose('read');
      } else {
        setMascotPose('happy');
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Enhanced error handling for different error types
      let errorMessageText = 'Sorry, I encountered an error. Please try again in a moment.';
      let toastMessage = error.message || 'Failed to get AI response. Please try again.';
      
      // Handle 429 (rate limit/quota exceeded) specifically
      if (error.status === 429 || error.message?.includes('quota') || error.message?.includes('429')) {
        errorMessageText = 'I\'m currently experiencing high demand. This could be due to:\n\n• Rate limit reached - Please wait a few moments and try again\n• Quota exceeded - The service may need to be upgraded\n\nPlease try again in a minute or contact support if this persists.';
        toastMessage = 'AI service is temporarily unavailable. Please try again in a moment.';
      } else if (error.message?.includes('network') || error.message?.includes('timeout')) {
        errorMessageText = 'I\'m having trouble connecting right now. Please check your internet connection and try again.';
        toastMessage = 'Connection error. Please check your internet and try again.';
      }
      
      toast.error(toastMessage);
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: errorMessageText,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Removed for full-screen experience */}

          {/* Chat Window - Full Screen */}
          <motion.div
            className="fixed inset-0 z-50 w-screen h-screen flex gap-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Sidebar - Conversation List */}
            <AnimatePresence>
              {showSidebar && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <GlassCard className="h-full flex flex-col shadow-xl rounded-none border-r border-white/10">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">Conversations</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowSidebar(false)}
                        className="h-6 w-6"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="p-2">
                      <Button
                        onClick={createNewConversation}
                        className="w-full justify-start gap-2 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 hover:opacity-90"
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                        New Conversation
                      </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                      {conversations.map((conv) => (
                        <div
                          key={conv.id}
                          onClick={() => switchConversation(conv.id)}
                          className={cn(
                            'p-3 rounded-lg cursor-pointer transition-all group relative',
                            currentConversationId === conv.id
                              ? 'bg-indigo-500/20 border border-indigo-500/30'
                              : 'hover:bg-white/10 border border-transparent'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {conv.title}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {formatConversationDate(conv.updatedAt)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => deleteConversation(conv.id, e)}
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <GlassCard className="h-full flex-1 flex flex-col shadow-2xl min-w-0 rounded-none border-0">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Mascot Avatar */}
                  <div className="w-[70px] h-[70px] flex items-center justify-center overflow-visible flex-shrink-0">
                    <FocusAICharacter pose={mascotPose} size="md" animate />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate">FocusAI</h3>
                    <p className="text-xs text-muted-foreground">Your Productivity Companion</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="h-8 w-8"
                    aria-label="Toggle conversations"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8"
                    aria-label="Close chat"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages Area - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        'flex',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-4 py-2',
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 text-white'
                            : 'bg-white/40 dark:bg-white/10 backdrop-blur-sm text-foreground border border-white/20'
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Loading indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/40 dark:bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-white/10 flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about Focusmate..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 hover:opacity-90"
                    size="icon"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

