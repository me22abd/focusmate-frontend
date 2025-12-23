/**
 * ============================================================================
 * CHAT-PANEL.TSX - REAL-TIME CHAT COMPONENT FOR SESSION
 * ============================================================================
 * 
 * Purpose: Provides real-time text chat functionality during focus sessions.
 * Displays chat messages, typing indicators, and online/offline presence.
 * 
 * Features:
 * - Real-time message sending/receiving via Socket.IO
 * - Typing indicators (shows when partner is typing)
 * - Online/offline presence status
 * - Chat history loading
 * - Auto-scroll to latest message
 * - Responsive design
 * 
 * Socket.IO Events:
 * - Emits: 'chatMessage', 'typing', 'stopTyping'
 * - Listens: 'newMessage', 'partnerTyping', 'typingStopped', 'userOnline', 'userOffline'
 * 
 * @author Marvelous Eromonsele
 * @component Session/Chat
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import axios from 'axios';

interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userEmail: string;
  message: string;
  timestamp: Date | string;
}

interface ChatPanelProps {
  socket: Socket | null;
  roomId: string;
  partnerId?: string;
  partnerName?: string;
  currentUserId: string;
  className?: string;
}

export function ChatPanel({
  socket,
  roomId,
  partnerId,
  partnerName,
  currentUserId,
  className,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { accessToken } = useAuthStore();

  // Load chat history on mount
  useEffect(() => {
    if (!roomId || !accessToken) return;

    const loadHistory = async () => {
      try {
        const baseUrl =
          typeof window !== 'undefined'
            ? `http://${window.location.hostname}:3001`
            : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        const response = await axios.get(`${baseUrl}/sessions/chat/${roomId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setMessages(response.data || []);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [roomId, accessToken]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
      scrollToBottom();
    };

    const handlePartnerTyping = () => {
      setPartnerTyping(true);
      setTimeout(() => setPartnerTyping(false), 3000);
    };

    const handleTypingStopped = () => {
      setPartnerTyping(false);
    };

    const handleUserOnline = (data: { userId: string }) => {
      if (data.userId === partnerId) {
        setPartnerOnline(true);
      }
    };

    const handleUserOffline = (data: { userId: string }) => {
      if (data.userId === partnerId) {
        setPartnerOnline(false);
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('partnerTyping', handlePartnerTyping);
    socket.on('typingStopped', handleTypingStopped);
    socket.on('userOnline', handleUserOnline);
    socket.on('userOffline', handleUserOffline);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('partnerTyping', handlePartnerTyping);
      socket.off('typingStopped', handleTypingStopped);
      socket.off('userOnline', handleUserOnline);
      socket.off('userOffline', handleUserOffline);
    };
  }, [socket, partnerId]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle typing indicator
  const handleInputChange = (value: string) => {
    setInputMessage(value);

    if (!socket || !roomId) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing if not already typing
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      socket.emit('typing', { roomId });
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && roomId) {
        socket.emit('stopTyping', { roomId });
        setIsTyping(false);
      }
    }, 2000);
  };

  // Send message
  const handleSendMessage = useCallback(() => {
    if (!socket || !roomId || !inputMessage.trim()) return;

    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTyping) {
      socket.emit('stopTyping', { roomId });
      setIsTyping(false);
    }

    // Send message
    socket.emit('chatMessage', {
      roomId,
      message: inputMessage.trim(),
    });

    setInputMessage('');
  }, [socket, roomId, inputMessage, isTyping]);

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <Card className={cn('h-full', className)}>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                partnerOnline ? 'bg-green-500' : 'bg-gray-400'
              )}
            />
            <span className="text-slate-600 dark:text-slate-400">
              {partnerOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-400 py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.userId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex',
                    isOwn ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[75%] rounded-lg px-4 py-2',
                      isOwn
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
                    )}
                  >
                    {!isOwn && (
                      <p className="text-xs font-semibold mb-1 opacity-70">
                        {msg.userEmail.split('@')[0]}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.message}
                    </p>
                    <p className="text-xs opacity-60 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing indicator */}
          {partnerTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-200 dark:bg-slate-800 rounded-lg px-4 py-2">
                <div className="flex gap-1">
                  <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" />
                  <div
                    className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <div
                    className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}






