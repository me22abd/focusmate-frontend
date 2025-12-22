'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot } from 'lucide-react';
import { ChatMessage as ChatMessageComponent } from '@/components/chat-message';
import { QuickPrompts } from '@/components/quick-prompts';
import { sendChatMessage, ChatMessage } from '@/lib/api/ai';
import { toast } from 'sonner';
import { Navbar } from '@/components/navbar';
import { BottomNav } from '@/components/bottom-nav';
import { SimpleFooter } from '@/components/simple-footer';
import { QuickNav } from '@/components/quick-nav';

const STORAGE_KEY = 'focusmate_chat_history';

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        } else {
          // Show welcome message if no history
          setMessages([
            {
              role: 'assistant',
              content: "Hi! I'm your Focusmate AI Coach. 👋\n\nI can help you with:\n• Creating study plans and focus schedules\n• Analyzing your progress and productivity\n• Improving your focus streak\n• Suggesting new habits and goals\n• Answering questions about time management\n• Providing motivation and tips\n\nFeel free to ask me anything! What would you like to work on today?",
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } else {
        // Show welcome message if no history
        setMessages([
          {
            role: 'assistant',
            content: "Hi! I'm your Focusmate AI Coach. I can help you create study plans, analyze your progress, improve your streak, and suggest new habits. What would you like to work on today?",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setMessages([
        {
          role: 'assistant',
          content: "Hi! I'm your Focusmate AI Coach. I can help you create study plans, analyze your progress, improve your streak, and suggest new habits. What would you like to work on today?",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (error) {
        console.error('Failed to save chat history:', error);
      }
    }
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get conversation history (last 20 messages for context)
      const conversationHistory = [...messages, userMessage].slice(-20);

      // Send to backend
      const response = await sendChatMessage(textToSend, conversationHistory);

      // Add AI response
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      
      const errorMsg = error.message || 'Please try again';
      const isQuotaError = errorMsg.includes('quota') || errorMsg.includes('exceeded') || errorMsg.includes('billing');
      
      toast.error('Failed to get AI response', {
        description: errorMsg,
        duration: isQuotaError ? 10000 : 5000,
      });

      // Add helpful error message based on error type
      let errorContent = "I'm sorry, I encountered an error. Please try again in a moment.";
      
      if (isQuotaError) {
        errorContent = "I'm currently unavailable due to OpenAI API quota limits. This usually means:\n\n• Your OpenAI account has reached its usage limit\n• You may need to check your billing and upgrade your plan\n• Or wait for the quota to reset (usually monthly)\n\nPlease check your OpenAI account at https://platform.openai.com/account/billing\n\nIf you just updated your API key, make sure:\n• The new key is valid and has available quota\n• The backend has been restarted to load the new key\n• The key is correctly set in the backend .env file";
      } else if (errorMsg.includes('not configured')) {
        errorContent = "AI service is not available at the moment. Please contact support for assistance.";
      } else if (errorMsg.includes('busy') || errorMsg.includes('rate limit')) {
        errorContent = "I'm receiving too many requests right now. Please wait a moment and try again.";
      } else if (errorMsg.includes('connection') || errorMsg.includes('network')) {
        errorContent = "I'm having trouble connecting. Please check your internet connection and try again.";
      }

      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: errorContent,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    // Auto-send after a brief delay
    setTimeout(() => {
      handleSend(prompt);
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSend();
      }
    }
  };

  return (
    <>
      <Navbar />
      <QuickNav showBack={true} showHome={true} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  AI Coach
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Ask me anything about focus, productivity, or your progress
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Prompts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <QuickPrompts onSelect={handleQuickPrompt} disabled={isLoading} />
          </motion.div>

          {/* Chat Messages */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-4 sm:p-6 mb-4 min-h-[400px] max-h-[calc(100vh-400px)] overflow-y-auto"
          >
            <AnimatePresence>
              {messages.map((message, index) => (
                <ChatMessageComponent
                  key={`${message.role}-${index}-${message.timestamp}`}
                  role={message.role}
                  content={message.content}
                />
              ))}
              {isLoading && (
                <ChatMessageComponent
                  role="assistant"
                  content=""
                  isTyping={true}
                />
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </motion.div>

          {/* Input Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-4"
          >
            <div className="flex gap-3 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your question here... (e.g., 'How can I improve my focus?', 'Create a study plan', 'What should I focus on today?')"
                disabled={isLoading}
                rows={1}
                className="flex-1 resize-none rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  minHeight: '48px',
                  maxHeight: '120px',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Send className="h-5 w-5" />
              </motion.button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">Shift+Enter</kbd> for new line
              </p>
              {input.trim() && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  Ready to send
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      <BottomNav />
      <SimpleFooter variant="auth" />
    </>
  );
}

