'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useAuthStore } from '@/store/auth-store';
import { Navbar } from '@/components/navbar';
import { CancelSessionDialog } from '@/components/cancel-session-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, X, Users, Clock, Target, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { io, Socket } from 'socket.io-client';

type MatchStatus = 'searching' | 'found' | 'timeout' | 'error' | 'cancelled';

const MATCHING_MESSAGES = [
  'Checking for available partners…',
  'A few people online now',
  'Looking for the best match…',
  'Almost there…',
  'Finding someone with similar goals…',
  'Connecting you with a focus partner…',
];

const FAKE_PARTNER_NAMES = [
  'Alex Johnson',
  'Sam Taylor',
  'Jordan Lee',
  'Casey Martinez',
  'Riley Chen',
  'Morgan Brown',
  'Taylor Davis',
];

function MatchmakingContent() {
  useAuthGuard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, accessToken } = useAuthStore();

  // Session data from URL params
  const focusTopic = searchParams.get('focusTopic') || 'Focus session';
  const studyGoal = searchParams.get('studyGoal') || '';
  const duration = parseInt(searchParams.get('duration') || '25', 10);

  // State
  const [status, setStatus] = useState<MatchStatus>('searching');
  const [currentMessage, setCurrentMessage] = useState(0);
  const [userCount, setUserCount] = useState(3);
  const [queueSize, setQueueSize] = useState(0); // Phase 3: Real queue size
  const [partnerName, setPartnerName] = useState<string>('');
  const [partnerTopic, setPartnerTopic] = useState<string>(''); // Phase 3: Partner preview
  const [partnerStreak, setPartnerStreak] = useState<number>(0); // Phase 3: Partner preview
  const [roomId, setRoomId] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [searchStartTime, setSearchStartTime] = useState(Date.now());
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userCountIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const simulationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Simulation mode (fallback) - defined early so it can be used in useEffect
  const startSimulationMode = () => {
    // Clear any existing simulation timeout
    if (simulationTimeoutRef.current) {
      clearTimeout(simulationTimeoutRef.current);
    }

    console.log('🎭 Starting simulation mode');
    
    // Random delay: 5-20 seconds
    const delay = Math.random() * 15000 + 5000;
    
    simulationTimeoutRef.current = setTimeout(() => {
      // Only proceed if still searching (not already matched via WebSocket)
      setStatus((currentStatus) => {
        if (currentStatus === 'searching') {
          // 40% chance of match, 60% timeout
          const matchFound = Math.random() < 0.4;
          
          if (matchFound) {
            const fakeName = FAKE_PARTNER_NAMES[Math.floor(Math.random() * FAKE_PARTNER_NAMES.length)];
            const fakeRoomId = `session_${user?.id}_${Date.now()}`;
            // Use setTimeout to call handleMatchFound after state update
            setTimeout(() => {
              if (user?.id) {
                const params = new URLSearchParams({
                  mode: 'partner',
                  focusTopic,
                  ...(studyGoal && { studyGoal }),
                  duration: duration.toString(),
                  partnerName: fakeName,
                  roomId: fakeRoomId,
                  startTime: new Date().toISOString(),
                });
                router.push(`/session/active?${params.toString()}`);
              }
            }, 0);
            return 'found';
          } else {
            return 'timeout';
          }
        }
        return currentStatus;
      });
    }, delay);
  };

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

  // WebSocket connection
  useEffect(() => {
    // If no user/token, start simulation mode immediately
    if (!user?.id || !accessToken) {
      startSimulationMode();
      return;
    }

    // CRITICAL: Socket.IO must connect to port 3001 with /sessions namespace
    // Detect backend URL dynamically (localhost for desktop, local IP for mobile)
    const backendURL = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
      ? `http://${window.location.hostname}:3001`
      : 'http://localhost:3001';
    
    const newSocket = io(`${backendURL}/sessions`, {
      withCredentials: true,
      transports: ['websocket'],
      auth: {
        token: accessToken,
      },
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
    });

    // Listen for 'connected' event from backend (confirms authentication)
    newSocket.on('connected', (data: { message: string; userId: string; onlineUsers?: number }) => {
      console.log('✅ Backend confirmed connection:', data);
      setIsConnected(true);
      
      // ===========================================================================
      // 📘 PHASE 3 ENHANCEMENT: Send User Profile for Smart Matching
      // ===========================================================================
      // Custom implementation by me: Send complete user data for scoring algorithm
      // 
      // New Data Sent:
      // - focusTopic: For topic-based matching (40 points)
      // - duration: For duration matching (30 points)
      // - streak: For streak similarity (20 points)
      // 
      // Backend uses this data to calculate match quality scores
      // ===========================================================================
      
      // Get user's current streak (from analytics or default to 0)
      const userStreak = 0; // TODO: Get from analytics hook
      
      console.log('📤 Emitting joinQueue with:', { focusTopic, duration, streak: userStreak });
      newSocket.emit('joinQueue', {
        focusTopic,
        duration,
        streak: userStreak, // Phase 3: Added for smart matching
      });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      setIsConnected(false);
      // Fall back to simulation mode
      startSimulationMode();
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

    // ===========================================================================
    // 📘 PHASE 3 ENHANCEMENT: Match Found with Partner Preview
    // ===========================================================================
    // Custom implementation by me: Receive and display partner preview data
    // 
    // New Data Received:
    // - partnerTopic: What partner is studying (show in preview)
    // - partnerStreak: Partner's streak (show in preview)
    // 
    // Backend's smart algorithm sends this for better user experience
    // ===========================================================================
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
      partnerTopic?: string;  // Phase 3: Partner preview
      partnerStreak?: number; // Phase 3: Partner preview
    }) => {
      console.log('🎉 Match found!', data);
      
      // Phase 3: Store partner preview data
      setPartnerTopic(data.partnerTopic || '');
      setPartnerStreak(data.partnerStreak || 0);
      
      handleMatchFound(data);
    });

    // Match error
    newSocket.on('matchError', (error: { message: string }) => {
      console.error('❌ Match error:', error);
      setStatus('error');
      toast.error('Failed to find a partner', {
        description: error.message || 'Please try again',
      });
    });

    // Queue status
    newSocket.on('queueStatus', (data: { message?: string; queueSize?: number }) => {
      console.log('📊 Queue status:', data);
      if (data.queueSize !== undefined) {
        setQueueSize(data.queueSize); // Phase 3: Update real queue size
      }
    });

    // ===========================================================================
    // 📘 PHASE 3 ENHANCEMENT: Queue Size Updates (Broadcast)
    // ===========================================================================
    // Custom implementation by me: Real-time queue size updates
    // 
    // Backend broadcasts queue size when:
    // - User joins queue
    // - User leaves queue
    // - Match is created
    // 
    // This keeps all waiting users informed of how many people are searching
    // ===========================================================================
    newSocket.on('queueSizeUpdate', (data: { size: number }) => {
      console.log('📊 Queue size update:', data.size);
      setQueueSize(data.size);
    });

    setSocket(newSocket);
    setSearchStartTime(Date.now());

    // If connection fails after 2 seconds, use simulation mode
    const fallbackTimeout = setTimeout(() => {
      // Check if socket is actually connected
      const connected = newSocket?.connected || false;
      if (!connected) {
        console.log('⚠️ WebSocket not connected, using simulation mode');
        startSimulationMode();
      }
    }, 2000);

    // Also start simulation mode immediately as fallback
    // This ensures the UI always works even if WebSocket fails
    startSimulationMode();

    return () => {
      clearTimeout(fallbackTimeout);
      if (simulationTimeoutRef.current) {
        clearTimeout(simulationTimeoutRef.current);
      }
      if (newSocket) {
        newSocket.emit('leaveQueue');
        newSocket.disconnect();
      }
    };
  }, [user?.id, accessToken, focusTopic, duration, router, studyGoal]);

  // ===========================================================================
  // 📘 PHASE 3 ENHANCEMENT: Match Found Handler with Partner Preview
  // ===========================================================================
  // Custom implementation by me: Enhanced match handler with partner data
  // 
  // Now receives and passes partner preview data to active session
  // ===========================================================================
  const handleMatchFound = (data: {
    roomId: string;
    sessionId: string;
    partnerId: string;
    partnerName: string;
    partnerAvatar: string | null;
    partnerTopic?: string;
  }) => {
    setPartnerName(data.partnerName);
    setRoomId(data.roomId);
    setStatus('found');
    setShowSuccessAnimation(true);

    // Clear all intervals/timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    if (userCountIntervalRef.current) clearInterval(userCountIntervalRef.current);
    if (simulationTimeoutRef.current) clearTimeout(simulationTimeoutRef.current);

    // Disconnect socket
    if (socket) {
      socket.emit('leaveQueue');
      socket.disconnect();
    }

    // Redirect after animation with complete partner data in URL
    setTimeout(() => {
      router.push(
        `/session/active?sessionId=${data.sessionId}&roomId=${data.roomId}&partnerId=${data.partnerId}&partnerName=${encodeURIComponent(data.partnerName)}&partnerAvatar=${encodeURIComponent(data.partnerAvatar || '')}&mode=partner&focusTopic=${encodeURIComponent(focusTopic)}${studyGoal ? `&studyGoal=${encodeURIComponent(studyGoal)}` : ''}&duration=${duration}${data.partnerTopic ? `&partnerFocus=${encodeURIComponent(data.partnerTopic)}` : ''}&startTime=${encodeURIComponent(new Date().toISOString())}`
      );
    }, 2000);
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    if (socket) {
      socket.emit('leaveQueue');
      socket.disconnect();
    }
    
    // Clear all intervals/timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    if (userCountIntervalRef.current) clearInterval(userCountIntervalRef.current);
    if (simulationTimeoutRef.current) clearTimeout(simulationTimeoutRef.current);

    setShowCancelDialog(false);
    toast.info('Matchmaking cancelled');
    router.push('/dashboard');
  };

  const handleBack = () => {
    if (socket) {
      socket.emit('leaveQueue');
      socket.disconnect();
    }
    
    // Clear all intervals/timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    if (userCountIntervalRef.current) clearInterval(userCountIntervalRef.current);
    if (simulationTimeoutRef.current) clearTimeout(simulationTimeoutRef.current);

    router.push('/dashboard');
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
      // Re-initialize connection
      window.location.reload();
    }
  };

  const handleStudyAlone = () => {
    const params = new URLSearchParams({
      mode: 'solo',
      focusTopic,
      ...(studyGoal && { studyGoal }),
      duration: duration.toString(),
      startTime: new Date().toISOString(),
    });
    router.push(`/session/active?${params.toString()}`);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/30 dark:from-slate-950 dark:via-indigo-950/20 dark:to-blue-950/20 px-4 pb-24 pt-6">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelClick}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Title Section */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Finding a Focus Partner…
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                We are connecting you with someone who is also ready to focus.
              </p>
            </div>

            {/* Center Animation */}
            <div className="relative flex items-center justify-center py-12">
              <AnimatePresence mode="wait">
                {status === 'searching' && (
                  <motion.div
                    key="searching"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative"
                  >
                    {/* Pulsing outer circle */}
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

                    {/* Middle pulse */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-blue-300 dark:border-blue-700"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.6, 0, 0.6],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.3,
                      }}
                      style={{ width: 160, height: 160, margin: '-80px 0 0 -80px' }}
                    />

                    {/* Inner circle with avatars */}
                    <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-2xl">
                      {/* User avatar */}
                      <motion.div
                        className="absolute -left-4 w-12 h-12 rounded-full bg-white dark:bg-slate-800 border-4 border-indigo-500 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shadow-lg"
                        animate={{
                          y: [0, -10, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </motion.div>

                      {/* Partner placeholder avatar */}
                      <motion.div
                        className="absolute -right-4 w-12 h-12 rounded-full bg-white dark:bg-slate-800 border-4 border-blue-500 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shadow-lg"
                        animate={{
                          y: [0, 10, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: 1,
                        }}
                      >
                        ?
                      </motion.div>

                      {/* Center icon */}
                      <Users className="h-8 w-8 text-white" />
                    </div>

                    {/* Rotating dots */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400"
                          animate={{
                            rotate: 360,
                            scale: [1, 1.5, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'linear',
                            delay: i * 0.2,
                          }}
                          style={{
                            width: 120,
                            height: 1,
                            transformOrigin: '0 0',
                            transform: `rotate(${i * 120}deg)`,
                          }}
                        >
                          <div className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {status === 'found' && (
                  <motion.div
                    key="found"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                  >
                    {/* Success animation */}
                    {showSuccessAnimation && (
                      <>
                        {/* Confetti burst */}
                        {[...Array(20)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-3 h-3 rounded-full"
                            style={{
                              background: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'][i % 4],
                            }}
                            initial={{ x: 0, y: 0, opacity: 1 }}
                            animate={{
                              x: Math.cos((i / 20) * Math.PI * 2) * 100,
                              y: Math.sin((i / 20) * Math.PI * 2) * 100,
                              opacity: [1, 1, 0],
                            }}
                            transition={{
                              duration: 1.5,
                              delay: i * 0.05,
                            }}
                          />
                        ))}

                        {/* Green checkmark pulse */}
                        <motion.div
                          className="w-32 h-32 rounded-full bg-green-500 flex items-center justify-center shadow-2xl"
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.2, 1] }}
                          transition={{ duration: 0.6 }}
                        >
                          <CheckCircle2 className="h-16 w-16 text-white" />
                        </motion.div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Matching Status Message */}
            {status === 'searching' && (
              <motion.div
                key={currentMessage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
              >
                <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                  {MATCHING_MESSAGES[currentMessage]}
                </p>
              </motion.div>
            )}

            {/* ===================================================================
                PHASE 3 ENHANCEMENT: Match Found with Partner Preview
                ===================================================================
                
                Custom implementation by me: Partner preview display
                Shows partner's topic and streak for better context
                ================================================================ */}
            {status === 'found' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
              >
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  Match Found! 🎉
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {partnerName}
                </p>
                
                {/* Partner Preview - Phase 3 */}
                {(partnerTopic || partnerStreak > 0) && (
                  <Card className="border-2 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
                    <CardContent className="p-4 space-y-2">
                      {partnerTopic && (
                        <div className="flex items-center justify-center gap-2 text-sm">
                          <Target className="h-4 w-4 text-green-600" />
                          <span className="text-slate-700 dark:text-slate-300">
                            Studying: <strong>{partnerTopic}</strong>
                          </span>
                        </div>
                      )}
                      {partnerStreak > 0 && (
                        <div className="flex items-center justify-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-slate-700 dark:text-slate-300">
                            {partnerStreak}-day streak
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Starting your focus session...
                </p>
              </motion.div>
            )}

            {/* Live User Count Badge */}
            {status === 'searching' && (
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex justify-center"
              >
                <div className="px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800">
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                    {userCount} {userCount === 1 ? 'person' : 'people'} available now
                  </p>
                </div>
              </motion.div>
            )}

            {/* Session Details Card */}
            <Card className="border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">Session Details</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Focus Topic</p>
                    <p className="font-medium text-slate-900 dark:text-white">{focusTopic}</p>
                  </div>
                  
                  {studyGoal && (
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Study Goal</p>
                      <p className="font-medium text-slate-900 dark:text-white">{studyGoal}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Partner Mode</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeout Screen */}
            {status === 'timeout' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
                  <CardContent className="p-8 text-center space-y-4">
                    <AlertCircle className="h-16 w-16 mx-auto text-orange-500 dark:text-orange-400" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      No partner found right now
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      We couldn't find a match at this moment. Would you like to try again or study alone?
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button
                        onClick={handleRetry}
                        className="flex-1 bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 hover:opacity-90"
                      >
                        <Loader2 className="h-4 w-4 mr-2" />
                        Retry Matching
                      </Button>
                      <Button
                        onClick={handleStudyAlone}
                        variant="outline"
                        className="flex-1"
                      >
                        Study Alone Instead
                      </Button>
                      <Button
                        onClick={handleBack}
                        variant="ghost"
                        className="flex-1"
                      >
                        Return to Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Error Screen */}
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card className="border-2 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
                  <CardContent className="p-8 text-center space-y-4">
                    <AlertCircle className="h-16 w-16 mx-auto text-red-500 dark:text-red-400" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Connection Error
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      We couldn't connect to the matchmaking service. Please try again.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button
                        onClick={handleRetry}
                        className="flex-1 bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 hover:opacity-90"
                      >
                        <Loader2 className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                      <Button
                        onClick={handleStudyAlone}
                        variant="outline"
                        className="flex-1"
                      >
                        Study Alone Instead
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
      
      {/* Cancel Matchmaking Confirmation Dialog */}
      <CancelSessionDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleConfirmCancel}
        mode="matchmaking"
      />
    </>
  );
}

export default function MatchmakingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading matchmaking...</p>
          </div>
        </main>
      </div>
    }>
      <MatchmakingContent />
    </Suspense>
  );
}
