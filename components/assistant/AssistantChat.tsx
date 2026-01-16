/**
 * Assistant Chat Component - Modern ChatGPT-style Interface
 * Features: Multi-conversation support, proper scrolling, history, timestamps, day dividers
 */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, X, MessageSquare, Plus, ChevronLeft, Calendar } from 'lucide-react';
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

interface Conversation {
  id: string; // conversationId
  title: string;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
}

export function AssistantChat({ isOpen, onClose, userName }: AssistantChatProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [mascotPose, setMascotPose] = useState<FocusAIPose>('happy');
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [memoryLearningActive, setMemoryLearningActive] = useState(false);
  
  // Conversation management
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showConversationsSidebar, setShowConversationsSidebar] = useState(false);
  
  // Refs for scrolling
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate new conversation ID
  const generateConversationId = () => {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Load all conversations (group messages by conversationId)
  const loadConversations = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Get all messages (without conversationId filter) to find all conversations
      const allMessages = await getChatHistory(1000); // Get large batch
      
      // Group by conversationId
      const conversationMap = new Map<string, Conversation>();
      
      allMessages.forEach((msg) => {
        const convId = msg.conversationId || 'default';
        if (!conversationMap.has(convId)) {
          conversationMap.set(convId, {
            id: convId,
            title: msg.content.substring(0, 50) || 'New Conversation',
            lastMessage: msg.content,
            lastMessageAt: msg.createdAt || msg.timestamp || new Date().toISOString(),
            messageCount: 0,
          });
        }
        const conv = conversationMap.get(convId)!;
        conv.messageCount++;
        const msgDate = new Date(msg.createdAt || msg.timestamp || 0);
        const lastDate = new Date(conv.lastMessageAt);
        if (msgDate > lastDate) {
          conv.lastMessage = msg.content;
          conv.lastMessageAt = msg.createdAt || msg.timestamp || new Date().toISOString();
        }
      });

      const sortedConversations = Array.from(conversationMap.values())
        .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

      setConversations(sortedConversations);
      
      // If no current conversation, load the most recent one
      if (!currentConversationId && sortedConversations.length > 0) {
        setCurrentConversationId(sortedConversations[0].id);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }, [user?.id, currentConversationId]);

  // Load messages for current conversation
  const loadMessagesForConversation = useCallback(async (conversationId: string | null) => {
    if (!user?.id) return;

    setIsLoadingHistory(true);
    try {
      if (conversationId && conversationId !== 'default') {
        const history = await getChatHistory(100, conversationId);
        if (history.length > 0) {
          setMessages(history);
          shouldAutoScrollRef.current = false; // Don't auto-scroll when loading history
          setTimeout(() => {
            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
          }, 100);
        } else {
          setMessages([]);
        }
      } else {
        // New conversation - show greeting
        setMessages([{
          role: 'assistant',
          content: `Hi ${userName}, ready to focus today? How can I help you?`,
          timestamp: new Date().toISOString(),
        }]);
        shouldAutoScrollRef.current = true;
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load chat history');
      setMessages([{
        role: 'assistant',
        content: `Hi ${userName}, ready to focus today? How can I help you?`,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user?.id, userName]);

  // Load conversations and messages when chat opens
  useEffect(() => {
    if (isOpen && user?.id) {
      loadConversations();
    }
  }, [isOpen, user?.id, loadConversations]);

  // Load messages when conversation changes
  useEffect(() => {
    if (isOpen && currentConversationId !== null) {
      loadMessagesForConversation(currentConversationId);
    } else if (isOpen && currentConversationId === null) {
      // New conversation - show greeting
      setMessages([{
        role: 'assistant',
        content: `Hi ${userName}, ready to focus today? How can I help you?`,
        timestamp: new Date().toISOString(),
      }]);
    }
  }, [currentConversationId, isOpen, loadMessagesForConversation, userName]);

  // Auto-scroll to bottom when new messages arrive (only if user is near bottom)
  useEffect(() => {
    if (shouldAutoScrollRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Track scroll position to determine if we should auto-scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      shouldAutoScrollRef.current = isNearBottom;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setMascotPose('help');
      setLastActivityTime(Date.now());
    }
  }, [isOpen]);

  // Inactivity timer
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

  // Prevent body scroll when chat is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Create new conversation
  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMessages([{
      role: 'assistant',
      content: `Hi ${userName}, ready to focus today? How can I help you?`,
      timestamp: new Date().toISOString(),
    }]);
    shouldAutoScrollRef.current = true;
    setShowConversationsSidebar(false);
    inputRef.current?.focus();
  };

  // Switch conversation
  const handleSwitchConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    setShowConversationsSidebar(false);
    shouldAutoScrollRef.current = false; // Don't auto-scroll when switching
  };

  // Send message
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Create conversation ID if this is a new conversation
    let convId = currentConversationId;
    if (!convId) {
      convId = generateConversationId();
      setCurrentConversationId(convId);
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
      conversationId: convId,
    };

    // Update pose based on message content
    setLastActivityTime(Date.now());
    const message = inputValue.trim().toLowerCase();
    if (message.includes('how') || message.includes('what') || message.includes('why') || message.includes('help')) {
      setMascotPose('help');
    } else if (message.includes('idea') || message.includes('suggestion') || message.includes('tip') || message.includes('advice')) {
      setMascotPose('idea');
    } else {
      setMascotPose('read');
    }

    // Add user message immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);
    shouldAutoScrollRef.current = true;

    try {
      // Save user message to backend
      await saveChatMessage('user', userMessage.content, convId);

      // Send to AI with full conversation history
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
        conversationId: convId,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setLastActivityTime(Date.now());
      shouldAutoScrollRef.current = true;

      // Save AI message to backend
      await saveChatMessage('assistant', aiMessage.content, convId);
      
      // Refresh conversations list
      await loadConversations();

      // Handle memory update
      if (result.memoryUpdated) {
        setMemoryLearningActive(true);
        setTimeout(() => setMemoryLearningActive(false), 2000);
        if (Math.random() > 0.7) {
          setTimeout(() => {
            toast.success('🧠 FocusAI is learning your preferences...', {
              description: 'Your conversations help me provide better personalized advice.',
              duration: 3000,
            });
          }, 500);
        }
      }
      
      // Update pose based on response
      if (result.response.includes('\n') || result.response.includes('•') || result.response.includes('-') || result.response.length > 100) {
        setMascotPose('read');
      } else {
        setMascotPose('happy');
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      
      let errorMessageText = 'Sorry, I encountered an error. Please try again in a moment.';
      let toastMessage = error.message || 'Failed to get AI response. Please try again.';
      
      if (error.status === 429 || error.message?.includes('quota') || error.message?.includes('429')) {
        errorMessageText = 'I\'m currently experiencing high demand. Please wait a few moments and try again.';
        toastMessage = 'AI service is temporarily unavailable. Please try again in a moment.';
      } else if (error.message?.includes('network') || error.message?.includes('timeout')) {
        errorMessageText = 'I\'m having trouble connecting right now. Please check your internet connection and try again.';
        toastMessage = 'Connection error. Please check your internet and try again.';
      }
      
      toast.error(toastMessage);
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: errorMessageText,
        timestamp: new Date().toISOString(),
        conversationId: convId,
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

  // Format timestamp
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (isYesterday) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + 
             date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
  };

  // Format date for day divider
  const formatDateDivider = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();
    
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // Group messages by day
  const groupMessagesByDay = (messages: ChatMessage[]) => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = '';
    let currentGroup: ChatMessage[] = [];

    messages.forEach((msg) => {
      const msgDate = formatDateDivider(msg.timestamp || msg.createdAt);
      if (msgDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = msgDate;
        currentGroup = [msg];
      } else {
        currentGroup.push(msg);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  };

  const messageGroups = groupMessagesByDay(messages);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 w-full h-full flex overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Conversations Sidebar */}
          <AnimatePresence>
            {showConversationsSidebar && (
              <motion.div
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: 'spring', damping: 25 }}
                className="w-80 bg-white/40 dark:bg-white/5 backdrop-blur-xl border-r border-white/20 dark:border-slate-800/50 flex flex-col"
              >
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Conversations</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowConversationsSidebar(false)}
                      className="h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleNewChat}
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-90"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Chat
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {conversations.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageSquare className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">No conversations yet</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {conversations.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => handleSwitchConversation(conv.id)}
                          className={cn(
                            'w-full text-left p-3 rounded-lg transition-colors',
                            currentConversationId === conv.id
                              ? 'bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                          )}
                        >
                          <p className="text-sm font-medium text-foreground truncate mb-1">
                            {conv.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {conv.lastMessage}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(conv.lastMessageAt)}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 h-full">
            <GlassCard className="flex-1 flex flex-col shadow-2xl rounded-none border-0 min-h-0" noOverflow={true}>
              {/* Header - Fixed */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Menu Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowConversationsSidebar(!showConversationsSidebar)}
                    className="h-8 w-8 flex-shrink-0"
                    aria-label="Conversations"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  
                  {/* New Chat Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNewChat}
                    className="flex-shrink-0"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    New Chat
                  </Button>

                  {/* Mascot Avatar */}
                  <div className="w-[70px] h-[70px] flex items-center justify-center overflow-visible flex-shrink-0 relative group">
                    <FocusAICharacter pose={mascotPose} size="md" animate />
                    {memoryLearningActive && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [1, 1.5, 0], opacity: [1, 0.5, 0], rotate: [0, 180, 360] }}
                        transition={{ duration: 2, ease: 'easeOut' }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        <div className="text-2xl">✨</div>
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate">FocusAI</h3>
                    <p className="text-xs text-muted-foreground">Your Productivity Companion</p>
                  </div>
                </div>
                
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 flex-shrink-0"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages Area - Scrollable */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto overflow-x-hidden min-h-0"
                style={{ 
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain',
                }}
              >
                <div className="p-4 space-y-4">
                  {isLoadingHistory && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">Loading chat history...</span>
                    </div>
                  )}

                  {!isLoadingHistory && (
                    <AnimatePresence>
                      {messageGroups.map((group, groupIndex) => (
                        <div key={group.date}>
                          {/* Day Divider */}
                          <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
                            <span className="text-xs font-medium text-muted-foreground px-3">
                              {group.date}
                            </span>
                            <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
                          </div>

                          {/* Messages for this day */}
                          {group.messages.map((message, index) => (
                            <motion.div
                              key={`${message.id || index}-${message.timestamp}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2, delay: index * 0.02 }}
                              className={cn(
                                'flex mb-4',
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                              )}
                            >
                              <div className={cn(
                                'flex gap-3 max-w-[80%]',
                                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                              )}>
                                {/* Mascot for assistant messages */}
                                {message.role === 'assistant' && (
                                  <div className="flex-shrink-0 w-8 h-8 mt-1">
                                    <FocusAICharacter pose="happy" size="sm" animate={false} />
                                  </div>
                                )}
                                
                                <div className="flex-1 min-w-0">
                                  <div
                                    className={cn(
                                      'rounded-2xl px-4 py-2',
                                      message.role === 'user'
                                        ? 'bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 text-white'
                                        : 'bg-white/40 dark:bg-white/10 backdrop-blur-sm text-foreground border border-white/20'
                                    )}
                                  >
                                    <p className="text-sm whitespace-pre-wrap break-words">
                                      {message.content}
                                    </p>
                                  </div>
                                  <p className={cn(
                                    'text-xs mt-1 px-2',
                                    message.role === 'user' ? 'text-right text-muted-foreground' : 'text-left text-muted-foreground'
                                  )}>
                                    {formatTime(message.timestamp || message.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
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
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 mt-1">
                          <FocusAICharacter pose="read" size="sm" animate={false} />
                        </div>
                        <div className="bg-white/40 dark:bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area - Fixed */}
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
      )}
    </AnimatePresence>
  );
}
