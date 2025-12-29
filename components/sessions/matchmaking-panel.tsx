/**
 * ============================================================================
 * MATCHMAKING-PANEL.TSX - MATCHMAKING PANEL FOR SESSION WORKSPACE
 * ============================================================================
 * 
 * Purpose: Provides matchmaking functionality directly within the Session workspace.
 * Allows users to start/stop matchmaking, see search status, and automatically
 * redirect to active partner session once matched.
 * 
 * Features:
 * - Start/stop matchmaking
 * - Real-time search status display
 * - Partner search status updates
 * - Auto-redirect to active session on match
 * - Reuses existing matchmaking logic from /session/matchmaking
 * 
 * @author Marvelous Eromonsele
 * @component Session/Matchmaking
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  UsersRound,
  Loader2,
  X,
  Clock,
  Target,
  CheckCircle2,
  AlertCircle,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { io, Socket } from 'socket.io-client';

type MatchStatus = 'idle' | 'searching' | 'found' | 'timeout' | 'error' | 'cancelled';

const MATCHING_MESSAGES = [
  'Checking for available partners…',
  'A few people online now',
  'Looking for the best match…',
  'Almost there…',
  'Finding someone with similar goals…',
  'Connecting you with a focus partner…',
];

export function MatchmakingPanel() {
  const router = useRouter();
  const { user, accessToken } = useAuthStore();

  // Form state
  const [focusTopic, setFocusTopic] = useState('Focus session');
  const [studyGoal, setStudyGoal] = useState('');
  const [duration, setDuration] = useState(25);

  // Matchmaking state
  const [status, setStatus] = useState<MatchStatus>('idle');
  const [currentMessage, setCurrentMessage] = useState(0);
  const [userCount, setUserCount] = useState(3);
  const [queueSize, setQueueSize] = useState(0);
  const [partnerName, setPartnerName] = useState<string>('');
  const [partnerTopic, setPartnerTopic] = useState<string>('');
  const [partnerStreak, setPartnerStreak] = useState<number>(0);
  const [roomId, setRoomId] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [searchStartTime, setSearchStartTime] = useState(Date.now());

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userCountIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Rotate matching messages
  useEffect(() => {
    if (status !== 'searching') return;

    messageIntervalRef.current = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % MATCHING_MESSAGES.length);
    }, 3000);

    return () => {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
      }
    };
  }, [status]);

  // Simulate user count fluctuations
  useEffect(() => {
    if (status !== 'searching') return;

    userCountIntervalRef.current = setInterval(() => {
      setUserCount(Math.floor(Math.random() * 10) + 1);
    }, 4000);

    return () => {
      if (userCountIntervalRef.current) {
        clearInterval(userCountIntervalRef.current);
      }
    };
  }, [status]);

  // Timeout after 20 seconds
  useEffect(() => {
    if (status !== 'searching') return;

    timeoutRef.current = setTimeout(() => {
      setStatus('timeout');
      if (socket) {
        socket.emit('leaveQueue');
        socket.disconnect();
      }
    }, 20000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [status, socket]);

  // WebSocket connection for matchmaking
  useEffect(() => {
    if (status !== 'searching' || !user?.id || !accessToken) return;

    // CRITICAL: Socket.IO must connect with /socket.io path
    // Detect backend URL dynamically (localhost for desktop, local IP for mobile, production)
    const getBackendURL = () => {
      if (typeof window === 'undefined') {
        return process.env.NEXT_PUBLIC_WS_URL?.replace('/socket.io', '') || 
               process.env.NEXT_PUBLIC_API_URL || 
               'http://localhost:3001';
      }
      if (process.env.NEXT_PUBLIC_WS_URL) {
        return process.env.NEXT_PUBLIC_WS_URL.replace('/socket.io', '');
      }
      if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
      }
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001';
      }
      return `http://${hostname}:3001`;
    };
    
    const backendURL = getBackendURL();
    const newSocket = io(backendURL, {
      path: '/socket.io', // WebSocket path: /socket.io
      withCredentials: true,
      transports: ['websocket'],
      auth: {
        token: accessToken,
      },
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected for matchmaking');
      setIsConnected(true);
    });

    // Listen for 'connected' event from backend (confirms authentication)
    newSocket.on('connected', (data: { message: string; userId: string; onlineUsers?: number }) => {
      console.log('✅ Backend confirmed connection:', data);
      setIsConnected(true);
      
      // Now that we're authenticated, join the queue
      const userStreak = 0; // TODO: Get from analytics hook
      
      console.log('📤 Emitting joinQueue with:', { focusTopic, duration, streak: userStreak });
      newSocket.emit('joinQueue', {
        focusTopic,
        duration,
        streak: userStreak,
      });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      setIsConnected(false);
      setStatus('error');
      toast.error('Failed to connect to matchmaking service', {
        description: error.message || 'Check if backend is running on port 3001',
      });
    });

    // Listen for authentication errors
    newSocket.on('error', (error: { message: string }) => {
      console.error('❌ WebSocket error:', error);
      if (error.message?.includes('Authentication') || error.message?.includes('token')) {
        toast.error('Authentication failed', {
          description: 'Please log in again',
        });
        setStatus('error');
      }
    });

    newSocket.on('matchFound', (data: { 
      roomId: string;
      sessionId: string;
      partnerId: string;
      partnerName: string;
      partnerAvatar: string | null;
      partner?: {
        id: string;
        name: string;
        email: string;
        avatar: string | null;
        status: string;
      };
      partnerEmail?: string; // Backward compatibility
      partnerFocus?: string | null;
      partnerStreak?: number;
    }) => {
      console.log('🎉 Match found!', data);
      
      setPartnerTopic(data.partnerFocus || '');
      setPartnerStreak(data.partnerStreak || 0);
      handleMatchFound(data);
    });

    newSocket.on('matchError', (error: { message: string }) => {
      console.error('❌ Match error:', error);
      setStatus('error');
      toast.error('Failed to find a partner', {
        description: error.message || 'Please try again',
      });
    });

    newSocket.on('queueStatus', (data: { message?: string; queueSize?: number }) => {
      console.log('📊 Queue status:', data);
      if (data.queueSize !== undefined) {
        setQueueSize(data.queueSize);
      }
    });

    newSocket.on('queueSizeUpdate', (data: { size: number }) => {
      console.log('📊 Queue size update:', data.size);
      setQueueSize(data.size);
    });

    setSocket(newSocket);
    setSearchStartTime(Date.now());

    return () => {
      if (newSocket) {
        newSocket.emit('leaveQueue');
        newSocket.disconnect();
      }
    };
  }, [status, user?.id, accessToken, focusTopic, duration]);

  const handleMatchFound = (data: {
    roomId: string;
    sessionId: string;
    partnerId: string;
    partnerName: string;
    partnerAvatar: string | null;
    partnerFocus?: string | null;
    partnerEmail?: string;
    partnerStreak?: number;
  }) => {
    setPartnerName(data.partnerName);
    setRoomId(data.roomId);
    setStatus('found');

    // Clear all intervals/timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    if (userCountIntervalRef.current) clearInterval(userCountIntervalRef.current);

    // Disconnect socket
    if (socket) {
      socket.emit('leaveQueue');
      socket.disconnect();
    }

    // Build query parameters with ALL required fields
    const startTime = new Date().toISOString();
    const params = new URLSearchParams({
      sessionId: data.sessionId || '',
      roomId: data.roomId || '',
      partnerId: data.partnerId || '',
      partnerName: data.partnerName || data.partnerEmail || 'Partner',
      partnerAvatar: data.partnerAvatar || '',
      partnerFocus: data.partnerFocus || '',
      mode: 'partner',
      focusTopic: focusTopic || '',
      duration: duration.toString(),
      startTime: startTime,
    });

    // Add optional fields if they exist
    if (studyGoal) params.set('studyGoal', studyGoal);
    if (data.partnerEmail) params.set('partnerEmail', data.partnerEmail);
    if (data.partnerStreak !== undefined) params.set('partnerStreak', data.partnerStreak.toString());

    // Redirect to active session with ALL required query parameters
    setTimeout(() => {
      router.push(`/session/active?${params.toString()}`);
    }, 1500);
  };

  const handleStartMatchmaking = () => {
    if (!focusTopic.trim()) {
      toast.error('Please enter a focus topic');
      return;
    }

    setStatus('searching');
    setCurrentMessage(0);
    setUserCount(Math.floor(Math.random() * 10) + 1);
    setSearchStartTime(Date.now());
    setPartnerName('');
    setRoomId('');
  };

  const handleStopMatchmaking = () => {
    if (socket) {
      socket.emit('leaveQueue');
      socket.disconnect();
    }
    
    // Clear all intervals/timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    if (userCountIntervalRef.current) clearInterval(userCountIntervalRef.current);

    setStatus('idle');
    toast.info('Matchmaking cancelled');
  };

  const handleRetry = () => {
    setStatus('searching');
    setCurrentMessage(0);
    setUserCount(Math.floor(Math.random() * 10) + 1);
    setSearchStartTime(Date.now());
    
    // Reconnect socket
    if (socket && !socket.connected) {
      socket.connect();
    } else if (!socket && user?.id && accessToken) {
      // Trigger re-initialization
      setStatus('idle');
      setTimeout(() => setStatus('searching'), 100);
    }
  };

  return (
    <div className="space-y-6">
      {/* Session Setup Form - Only show when idle */}
      {status === 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersRound className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Start Matchmaking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="focusTopic">Focus Topic *</Label>
                <Input
                  id="focusTopic"
                  value={focusTopic}
                  onChange={(e) => setFocusTopic(e.target.value)}
                  placeholder="What will you focus on?"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="studyGoal">Study Goal (Optional)</Label>
                <Textarea
                  id="studyGoal"
                  value={studyGoal}
                  onChange={(e) => setStudyGoal(e.target.value)}
                  placeholder="What do you want to accomplish?"
                  className="mt-1 min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <div className="flex gap-2 mt-1">
                  {[15, 25, 45, 60].map((mins) => (
                    <Button
                      key={mins}
                      variant={duration === mins ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDuration(mins)}
                    >
                      {mins}m
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleStartMatchmaking}
                className="w-full bg-gradient-to-r from-indigo-600 to-sky-500"
                size="lg"
              >
                <UsersRound className="mr-2 h-5 w-5" />
                Start Matchmaking
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Searching Status */}
      {status === 'searching' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="border-2 border-indigo-200 dark:border-indigo-800">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                {/* Animation */}
                <div className="relative flex items-center justify-center py-8">
                  <motion.div
                    className="relative"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-2xl">
                      <UsersRound className="h-12 w-12 text-white" />
                    </div>
                  </motion.div>
                  
                  {/* Pulsing circles */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-800"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{ width: 200, height: 200, margin: '-100px 0 0 -100px' }}
                  />
                </div>

                {/* Status Message */}
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentMessage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-lg font-medium text-slate-700 dark:text-slate-300"
                  >
                    {MATCHING_MESSAGES[currentMessage]}
                  </motion.p>
                </AnimatePresence>

                {/* User Count */}
                <div className="px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 inline-block">
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                    {userCount} {userCount === 1 ? 'person' : 'people'} available now
                  </p>
                </div>

                {/* Session Details */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Target className="h-4 w-4" />
                    <span>{focusTopic}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span>{duration} minutes</span>
                  </div>
                </div>

                {/* Cancel Button */}
                <Button
                  onClick={handleStopMatchmaking}
                  variant="outline"
                  className="mt-4"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel Matchmaking
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Match Found */}
      {status === 'found' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="p-8 text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.6 }}
                className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto shadow-2xl"
              >
                <CheckCircle2 className="h-10 w-10 text-white" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
                Match Found! 🎉
              </h2>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {partnerName}
              </p>
              
              {(partnerTopic || partnerStreak > 0) && (
                <div className="space-y-2 pt-2">
                  {partnerTopic && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Studying: <strong>{partnerTopic}</strong>
                    </p>
                  )}
                  {partnerStreak > 0 && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {partnerStreak}-day streak
                    </p>
                  )}
                </div>
              )}
              
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Redirecting to session...
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Timeout */}
      {status === 'timeout' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-orange-200 dark:border-orange-800">
            <CardContent className="p-8 text-center space-y-4">
              <AlertCircle className="h-16 w-16 mx-auto text-orange-500 dark:text-orange-400" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                No partner found right now
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                We couldn't find a match at this moment. Would you like to try again?
              </p>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleRetry}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-sky-500"
                >
                  <Loader2 className="h-4 w-4 mr-2" />
                  Retry Matching
                </Button>
                <Button
                  onClick={handleStopMatchmaking}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Error */}
      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-red-200 dark:border-red-800">
            <CardContent className="p-8 text-center space-y-4">
              <AlertCircle className="h-16 w-16 mx-auto text-red-500 dark:text-red-400" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Connection Error
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                We couldn't connect to the matchmaking service. Please try again.
              </p>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleRetry}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-sky-500"
                >
                  <Loader2 className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={handleStopMatchmaking}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}








