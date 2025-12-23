'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play, Pause, X, User, Users, Plus, Save, FileText, MessageCircle, StickyNote, BrainCircuit, Phone, Video as VideoIcon } from 'lucide-react';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useAuthStore } from '@/store/auth-store';
import { Navbar } from '@/components/navbar';
import { BottomNav } from '@/components/bottom-nav';
import { SimpleFooter } from '@/components/simple-footer';
import { CircularTimer } from '@/components/circular-timer';
import { CancelSessionDialog } from '@/components/cancel-session-dialog';
import { NotesModal } from '@/components/notes/notes-modal';
import { FlashcardStudyModal } from '@/components/notes/flashcard-study-modal';
import { ChatPanel } from '@/components/session/chat-panel';
import { VoiceMessage } from '@/components/session/voice-message';
import { AudioCall } from '@/components/session/audio-call';
import { VideoCall } from '@/components/session/video-call';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { io, Socket } from 'socket.io-client';

const SESSION_STORAGE_PREFIX = 'focusmate_active_session_';
const NOTES_STORAGE_PREFIX = 'focusmate_session_notes_';

function ActiveSessionContent() {
  useAuthGuard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessToken, user } = useAuthStore();
  
  const mode = searchParams.get('mode') || 'solo';
  const focusTopic = searchParams.get('focusTopic') || '';
  const studyGoal = searchParams.get('studyGoal') || '';
  const duration = parseInt(searchParams.get('duration') || '25', 10);
  const startTime = searchParams.get('startTime') || new Date().toISOString();
  
  // Read partner data from URL query params FIRST (primary source)
  const urlPartnerName = searchParams.get('partnerName') || '';
  const urlPartnerFocus = searchParams.get('partnerFocus') || '';
  const urlPartnerId = searchParams.get('partnerId') || '';
  const urlPartnerAvatar = searchParams.get('partnerAvatar') || '';
  const urlRoomId = searchParams.get('roomId') || '';
  const urlSessionId = searchParams.get('sessionId') || '';

  // State to store socket-delivered partner data (fallback/secondary source)
  const [partnerData, setPartnerData] = useState<{
    partnerId: string;
    partnerName: string;
    partnerAvatar: string | null;
    partnerFocus?: string;
    roomId: string;
    sessionId: string;
  } | null>(null);

  // Use socket state if available, otherwise fall back to URL params
  const partnerId = partnerData?.partnerId || urlPartnerId;
  const partnerName = partnerData?.partnerName || urlPartnerName;
  const partnerAvatar = partnerData?.partnerAvatar || urlPartnerAvatar || null;
  const partnerFocus = partnerData?.partnerFocus || urlPartnerFocus;
  const roomId = partnerData?.roomId || urlRoomId;
  const sessionId = partnerData?.sessionId || urlSessionId;

  // Defensive check: Validate required parameters for partner sessions
  const isPartnerMode = mode === 'partner';
  const hasRequiredPartnerData = partnerId && roomId && partnerName;
  
  // If partner session but missing required data, show error and redirect
  useEffect(() => {
    if (isPartnerMode && !hasRequiredPartnerData) {
      toast.error('Session data incomplete', {
        description: 'Missing partner information. Redirecting...',
      });
      setTimeout(() => {
        router.push('/sessions/workspace');
      }, 3000);
    }
  }, [isPartnerMode, hasRequiredPartnerData, router]);

  // Generate session ID from start time or use provided sessionId
  const effectiveSessionId = sessionId || (startTime.split('T')[0] + '-' + Date.now());
  const sessionStorageKey = `${SESSION_STORAGE_PREFIX}${effectiveSessionId}`;
  const notesStorageKey = `${NOTES_STORAGE_PREFIX}${effectiveSessionId}`;

  const totalSeconds = duration * 60;

  // Load saved session state from localStorage
  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    if (typeof window === 'undefined') return totalSeconds;
    
    try {
      const saved = localStorage.getItem(sessionStorageKey);
      if (saved) {
        const sessionData = JSON.parse(saved);
        const elapsed = Math.floor((Date.now() - sessionData.startTime) / 1000);
        const remaining = Math.max(0, sessionData.initialSeconds - elapsed);
        return remaining;
      }
    } catch {
      // Ignore errors
    }
    return totalSeconds;
  });

  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem(notesStorageKey) || '';
    } catch {
      return '';
    }
  });
  const [notesSaved, setNotesSaved] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showFlashcardsModal, setShowFlashcardsModal] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'voice' | 'audio' | 'video'>('chat');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Save session state to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const sessionData = {
      startTime: new Date(startTime).getTime(),
      initialSeconds: totalSeconds,
      focusTopic,
      studyGoal,
      mode,
      partnerName,
      partnerFocus,
    };
    localStorage.setItem(sessionStorageKey, JSON.stringify(sessionData));
  }, [sessionStorageKey, duration, focusTopic, studyGoal, mode, partnerName, partnerFocus, startTime, totalSeconds]);

  // Auto-save notes when typing (debounced)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Only auto-save if there's actual content
    if (notes.trim().length > 0) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem(notesStorageKey, notes);
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 2000);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [notes, notesStorageKey]);

  // WebSocket connection for partner sessions
  useEffect(() => {
    // Only connect for partner sessions with roomId and required data
    if (mode !== 'partner' || !roomId || !accessToken || !hasRequiredPartnerData) {
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

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected for active session');
      // Join the room
      newSocket.emit('joinRoom', { roomId });
      
      // Send heartbeat ping every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        if (newSocket.connected) {
          newSocket.emit('ping', { roomId, timestamp: Date.now() });
        }
      }, 30000);

      // Cleanup heartbeat on disconnect
      newSocket.on('disconnect', () => {
        clearInterval(heartbeatInterval);
      });

      // Store interval for cleanup
      (newSocket as any).heartbeatInterval = heartbeatInterval;
    });

    // Handle matchFound event from socket (store in state as fallback)
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
      partnerTopic?: string;
    }) => {
      console.log('✅ Match found event received:', data);
      // Store socket-delivered partner data in state (fallback if URL params missing)
      setPartnerData({
        partnerId: data.partnerId,
        partnerName: data.partnerName,
        partnerAvatar: data.partnerAvatar || data.partner?.avatar || null,
        partnerFocus: data.partnerTopic,
        roomId: data.roomId,
        sessionId: data.sessionId,
      });
    });

    newSocket.on('sessionCancelled', (data: { userEmail: string; message: string }) => {
      console.log('🚫 Partner cancelled session:', data);
      toast.error('Partner left the session', {
        description: data.message,
        duration: 5000,
      });
      
      // End the session and navigate to summary
      setIsActive(false);
      setTimeout(() => {
        navigateToSummary();
      }, 3000);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        // Clear heartbeat interval
        if ((newSocket as any).heartbeatInterval) {
          clearInterval((newSocket as any).heartbeatInterval);
        }
        newSocket.emit('leaveRoom', { roomId });
        newSocket.disconnect();
      }
    };
  }, [mode, roomId, accessToken, hasRequiredPartnerData]);

  // Timer effect
  useEffect(() => {
    if (!isActive || secondsRemaining <= 0) {
      if (secondsRemaining <= 0 && typeof window !== 'undefined') {
        localStorage.removeItem(sessionStorageKey);
        localStorage.removeItem(notesStorageKey);
        toast.success('Focus session completed!', {
          description: 'Great job staying focused!',
        });
        setTimeout(() => {
          navigateToSummary();
        }, 2000);
      }
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          if (typeof window !== 'undefined') {
            localStorage.removeItem(sessionStorageKey);
            localStorage.removeItem(notesStorageKey);
          }
          toast.success('Focus session completed!', {
            description: 'Great job staying focused!',
          });
          setTimeout(() => {
            navigateToSummary();
          }, 2000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, secondsRemaining, sessionStorageKey, notesStorageKey]);

  const navigateToSummary = () => {
    const totalSeconds = duration * 60;
    const completedSeconds = totalSeconds - secondsRemaining;
    const completedDurationMinutes = Math.max(0, Math.floor(completedSeconds / 60));
    
    const params = new URLSearchParams({
      mode,
      duration: duration.toString(),
      focusTopic,
      completedDuration: completedDurationMinutes.toString(),
      ...(studyGoal && { studyGoal }),
      notes,
      startTime,
      ...(roomId && { roomId }),
      ...(mode === 'partner' && partnerName && { partnerName, partnerFocus }),
      ...(mode === 'partner' && partnerId && { partnerId }),
    });
    router.push(`/session/summary?${params.toString()}`);
  };

  const handleEndSessionClick = () => {
    setShowCancelDialog(true);
  };

  const handleConfirmEndSession = () => {
    setIsActive(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(sessionStorageKey);
      localStorage.removeItem(notesStorageKey);
    }
    setShowCancelDialog(false);
    
    // Notify partner via WebSocket if this is a partner session
    if (mode === 'partner' && roomId && socket) {
      socket.emit('cancelSession', { roomId });
      toast.info(`${partnerName} has been notified that you left the session`);
    }
    
    navigateToSummary();
  };

  const handleExtendSession = () => {
    const newTotal = totalSeconds + (5 * 60);
    setSecondsRemaining((prev) => prev + 5 * 60);
    toast.success('Session extended!', {
      description: 'Added 5 minutes to your session',
    });
  };

  const handleTogglePause = () => {
    setIsActive((prev) => !prev);
  };

  const handleSaveNotes = () => {
    // Check if there are any notes to save
    if (notes.trim().length === 0) {
      toast.info('No notes to save', {
        description: 'Type some notes first before saving',
      });
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(notesStorageKey, notes);
      setNotesSaved(true);
      toast.success('Notes saved!', {
        description: 'Your notes have been saved for this session',
      });
      setTimeout(() => setNotesSaved(false), 2000);
    }
  };

  const handleNotesKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSaveNotes();
    }
  };

  const progress = ((totalSeconds - secondsRemaining) / totalSeconds) * 100;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 px-4 sm:px-6 pb-24 pt-6 dark:bg-slate-950">
        <div className="container mx-auto max-w-4xl py-4 sm:py-8">
          {/* Error State: Missing Partner Data */}
          {isPartnerMode && !hasRequiredPartnerData && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="border-2 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <User className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                        Session Data Incomplete
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        Missing partner information. Please return to the matchmaking screen.
                      </p>
                      <Button
                        onClick={() => router.push('/sessions/workspace')}
                        variant="default"
                      >
                        Go to Sessions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Partner Card (if partner session) - with defensive checks */}
          {isPartnerMode && hasRequiredPartnerData && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {partnerAvatar ? (
                        <img
                          src={partnerAvatar}
                          alt={partnerName || 'Partner'}
                          className="h-12 w-12 rounded-full object-cover border-2 border-blue-200 dark:border-blue-800 shadow-lg"
                          onError={(e) => {
                            // Fallback to initial if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg ${partnerAvatar ? 'hidden' : ''}`}>
                        {(partnerName || 'Partner').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {partnerName || 'Partner'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          <span>Active</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowChat(!showChat)}
                        className="gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        {showChat ? 'Hide' : 'Show'} Chat
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowChat(true);
                          setActiveTab('audio');
                        }}
                        className="gap-2"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowChat(true);
                          setActiveTab('video');
                        }}
                        className="gap-2"
                      >
                        <VideoIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {partnerFocus && (
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                        Partner's Focus
                      </p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {partnerFocus}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Focus Topic */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              You're focusing on:
            </h2>
            <p className="text-xl sm:text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
              {focusTopic || 'General Focus'}
            </p>
            {studyGoal && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Goal: {studyGoal}
              </p>
            )}
          </motion.div>

          {/* Circular Timer Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Card className="border-2 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30 shadow-xl">
              <CardContent className="p-8 sm:p-12">
                <div className="flex flex-col items-center justify-center space-y-6">
                  {/* Circular Timer */}
                  <CircularTimer
                    secondsRemaining={secondsRemaining}
                    totalSeconds={totalSeconds}
                    size={280}
                    strokeWidth={16}
                  />

                  {/* Progress Bar */}
                  <div className="w-full max-w-md space-y-2">
                    <Progress value={progress} className="h-3" />
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>{Math.round(progress)}% Complete</span>
                      <span>{Math.floor((totalSeconds - secondsRemaining) / 60)}m / {duration}m</span>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center gap-4">
                    {/* Play/Pause Button */}
                    <Button
                      onClick={handleTogglePause}
                      size="lg"
                      className="h-14 w-14 rounded-full bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 hover:opacity-90 shadow-lg transition-all hover:scale-105"
                    >
                      {isActive ? (
                        <Pause className="h-6 w-6 text-white" />
                      ) : (
                        <Play className="h-6 w-6 text-white" />
                      )}
                    </Button>

                    {/* Extend Button */}
                    <Button
                      onClick={handleExtendSession}
                      variant="outline"
                      size="lg"
                      disabled={!isActive}
                      className="h-12 px-6 rounded-full border-2 transition-all hover:scale-105 disabled:opacity-50"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      +5 min
                    </Button>

                    {/* End Button */}
                    <Button
                      onClick={handleEndSessionClick}
                      variant="destructive"
                      size="lg"
                      className="h-12 px-6 rounded-full transition-all hover:scale-105"
                    >
                      <X className="mr-2 h-5 w-5" />
                      End Session
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Communication Panel (Chat, Voice, Calls) */}
          {mode === 'partner' && showChat && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <Card className="border border-slate-200 dark:border-slate-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Communication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="chat">Chat</TabsTrigger>
                      <TabsTrigger value="voice">Voice</TabsTrigger>
                      <TabsTrigger value="audio">Audio Call</TabsTrigger>
                      <TabsTrigger value="video">Video Call</TabsTrigger>
                    </TabsList>
                    <TabsContent value="chat" className="mt-4">
                      <ChatPanel
                        socket={socket}
                        roomId={roomId}
                        partnerId={partnerId}
                        partnerName={partnerName}
                        currentUserId={user?.id || ''}
                        className="h-[400px]"
                      />
                    </TabsContent>
                    <TabsContent value="voice" className="mt-4">
                      <div className="space-y-4">
                        <VoiceMessage
                          socket={socket}
                          roomId={roomId}
                          currentUserId={user?.id || ''}
                        />
                        {/* Show chat messages with voice messages */}
                        <div className="border-t pt-4">
                          <ChatPanel
                            socket={socket}
                            roomId={roomId}
                            partnerId={partnerId}
                            partnerName={partnerName}
                            currentUserId={user?.id || ''}
                            className="h-[300px]"
                          />
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="audio" className="mt-4">
                      <AudioCall
                        socket={socket}
                        roomId={roomId}
                        currentUserId={user?.id || ''}
                        partnerId={partnerId}
                        partnerName={partnerName}
                      />
                    </TabsContent>
                    <TabsContent value="video" className="mt-4">
                      <VideoCall
                        socket={socket}
                        roomId={roomId}
                        currentUserId={user?.id || ''}
                        partnerId={partnerId}
                        partnerName={partnerName}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Notes Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border border-slate-200 dark:border-slate-800 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Session Notes
                  </CardTitle>
                  <Button
                    onClick={handleSaveNotes}
                    variant="outline"
                    size="sm"
                    disabled={notes.trim().length === 0}
                    className={cn(
                      'gap-2',
                      notesSaved && notes.trim().length > 0 && 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400'
                    )}
                  >
                    <Save className={cn('h-4 w-4', notesSaved && notes.trim().length > 0 && 'animate-bounce')} />
                    {notesSaved && notes.trim().length > 0 ? 'Saved!' : 'Save'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  ref={textareaRef}
                  placeholder="Jot down your thoughts, goals, or accomplishments... (Cmd/Ctrl + Enter to save)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onKeyDown={handleNotesKeyDown}
                  className="min-h-[200px] resize-none transition-all focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {notes.trim().length > 0 
                      ? 'Auto-saves after 1 second of inactivity. Press Cmd/Ctrl + Enter to save manually.'
                      : 'Start typing to enable auto-save. Press Cmd/Ctrl + Enter to save manually.'}
                  </p>
                  {notesSaved && notes.trim().length > 0 && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-xs text-green-600 dark:text-green-400 font-medium"
                    >
                      ✓ Saved
                    </motion.span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <BottomNav />
      <SimpleFooter variant="auth" />
      
      {/* 📝 Floating Action Buttons - Notes & Flashcards */}
      <div className="fixed right-4 bottom-24 flex flex-col gap-3 z-40">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700"
          onClick={() => setShowNotesModal(true)}
        >
          <StickyNote className="h-6 w-6" />
        </Button>
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700"
          onClick={() => setShowFlashcardsModal(true)}
        >
          <BrainCircuit className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Cancel Session Confirmation Dialog */}
      <CancelSessionDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleConfirmEndSession}
        mode={mode as 'solo' | 'partner'}
        partnerName={partnerName}
      />

      {/* Notes Modal */}
      <NotesModal
        open={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        sessionId={sessionId}
      />

      {/* Flashcards Study Modal */}
      <FlashcardStudyModal
        open={showFlashcardsModal}
        onClose={() => setShowFlashcardsModal(false)}
      />
    </>
  );
}

export default function ActiveSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading session...</p>
          </div>
        </main>
      </div>
    }>
      <ActiveSessionContent />
    </Suspense>
  );
}
