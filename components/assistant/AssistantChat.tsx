/**
 * Assistant Chat Component
 * Glassmorphic chat window with FocusAI assistant
 * Features: chat messages, input box, animated send button, mascot avatar
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, X, MessageSquare, ArrowLeft } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendAIMessage } from '@/lib/api/ai';
import { saveChatMessage, getChatHistory, ChatMessage } from '@/lib/api/chat';
import { useAuthStore } from '@/store/auth-store';
import { FocusAICharacter, FocusAIPose } from '@/components/mascot/FocusAICharacter';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface AssistantChatProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export function AssistantChat({ isOpen, onClose, userName }: AssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [mascotPose, setMascotPose] = useState<FocusAIPose>('happy');
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [memoryLearningActive, setMemoryLearningActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const shouldAutoScrollRef = useRef(true); // Track if we should auto-scroll
  const { user } = useAuthStore();
  const router = useRouter();

  // Handle close - always go to dashboard
  const handleClose = () => {
    onClose(); // Close the chat first
    router.push('/dashboard'); // Always navigate to dashboard
  };

  // Load chat history from backend when chat opens
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!isOpen || !user?.id) return;

      setIsLoadingHistory(true);
      try {
        const history = await getChatHistory(50); // Get last 50 messages
        
        if (history.length > 0) {
          setMessages(history);
          // Don't auto-scroll when loading history - let user see from top
          shouldAutoScrollRef.current = false;
        } else {
          // No history - show welcome message
          const greeting: ChatMessage = {
            role: 'assistant',
            content: `Hi ${userName}, ready to focus today? How can I help you?`,
            timestamp: new Date().toISOString(),
          };
          setMessages([greeting]);
          // Auto-scroll for new conversation
          shouldAutoScrollRef.current = true;
        }
      } catch (error) {
        toast.error('Failed to load chat history');
        // Show welcome message on error
        const greeting: ChatMessage = {
          role: 'assistant',
          content: `Hi ${userName}, ready to focus today? How can I help you?`,
          timestamp: new Date().toISOString(),
        };
        setMessages([greeting]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [isOpen, user?.id, userName]);

  // Track the previous message count to detect when new messages are added
  const prevMessageCountRef = useRef(messages.length);

  // Auto-scroll to bottom ONLY when NEW messages are added (not on initial load)
  useEffect(() => {
    const isNewMessage = messages.length > prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    // Only auto-scroll if:
    // 1. A new message was just added
    // 2. User is near the bottom (hasn't scrolled up)
    if (isNewMessage && shouldAutoScrollRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Detect when user manually scrolls - stop auto-scrolling if they scroll up
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100; // Within 100px of bottom
      shouldAutoScrollRef.current = isNearBottom;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus input when chat opens (but don't force scroll)
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setMascotPose('help');
      setLastActivityTime(Date.now());
      
      // Allow user to see conversation from wherever they left off
      // Only enable auto-scroll if this is a new conversation with just one message
      if (messages.length <= 1) {
        shouldAutoScrollRef.current = true;
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        // For existing conversations, start at the top
        shouldAutoScrollRef.current = false;
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = 0;
        }
      }
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

    // Add user message immediately to UI
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);
    shouldAutoScrollRef.current = true; // Enable auto-scroll when sending message

    try {
      // Save user message to backend
      await saveChatMessage('user', userMessage.content);

      // Send to unified AI engine with full conversation history for context
      // Map to AI ChatMessage format (filter out system messages, only user/assistant)
      const aiHistory = updatedMessages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: m.timestamp || m.createdAt,
        }));
      const result = await sendAIMessage(userMessage.content, aiHistory);

      // Add AI response
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setLastActivityTime(Date.now());
      shouldAutoScrollRef.current = true; // Enable auto-scroll when receiving message

      // Save AI response to backend
      await saveChatMessage('assistant', aiMessage.content);
      
      // Handle memory update feedback
      if (result.memoryUpdated) {
        // Trigger learning animation on mascot
        setMemoryLearningActive(true);
        setTimeout(() => setMemoryLearningActive(false), 2000);
        
        // Show subtle learning toast (only occasionally to not be annoying)
        if (Math.random() > 0.7) {
          setTimeout(() => {
            toast.success('🧠 FocusAI is learning your preferences...', {
              description: 'Your conversations help me provide better personalized advice.',
              duration: 3000,
            });
          }, 500);
        }
      }
      
      // Check if response is structured/helpful - use read pose
      if (result.response.includes('\n') || result.response.includes('•') || result.response.includes('-') || result.response.length > 100) {
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

  // Prevent body scroll when chat is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Chat Window - Full Screen */}
          <motion.div
            className="fixed inset-0 z-50 w-full h-full flex gap-0 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full">
              <GlassCard className="flex-1 flex flex-col shadow-2xl rounded-none border-0 min-h-0" noOverflow={true}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Back Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="h-8 w-8 flex-shrink-0"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  {/* Mascot Avatar */}
                  <div className="w-[70px] h-[70px] flex items-center justify-center overflow-visible flex-shrink-0 relative group">
                    <FocusAICharacter pose={mascotPose} size="md" animate />
                    {/* Learning spark animation */}
                    {memoryLearningActive && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: [1, 1.5, 0],
                          opacity: [1, 0.5, 0],
                          rotate: [0, 180, 360],
                        }}
                        transition={{ duration: 2, ease: 'easeOut' }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        <div className="text-2xl">✨</div>
                      </motion.div>
                    )}
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                      FocusAI knows your preferences, patterns, and goals
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
                    </div>
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
                    onClick={handleClose}
                    className="h-8 w-8"
                    aria-label="Close chat"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages Area - Fully scrollable from top to bottom */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 min-h-0"
                style={{ 
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain',
                }}
                onScroll={() => {
                  // Update auto-scroll preference based on scroll position
                  const container = messagesContainerRef.current;
                  if (container) {
                    const { scrollTop, scrollHeight, clientHeight } = container;
                    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
                    shouldAutoScrollRef.current = isNearBottom;
                  }
                }}
              >
                {/* Loading history state */}
                {isLoadingHistory && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading chat history...</span>
                  </div>
                )}

                {/* Messages */}
                {!isLoadingHistory && (
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
              )}

              {/* Loading indicator */}
              {isLoading && !isLoadingHistory && (
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

