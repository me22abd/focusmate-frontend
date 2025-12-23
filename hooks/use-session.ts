'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket';
import { toast } from 'sonner';

export interface SessionData {
  roomId: string;
  partnerId: string;
  partnerName: string;
  startTime: Date;
  duration: number; // in minutes
  status: 'searching' | 'matched' | 'active' | 'ended';
}

export function useSession() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isSearching, setIsSearching] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Mock event listeners (replace with real events when backend is ready)
    socket.on('mock:match-found', (data: any) => {
      setSession({
        roomId: data.roomId,
        partnerId: data.partnerId,
        partnerName: data.partnerName,
        startTime: new Date(),
        duration: 25,
        status: 'matched',
      });
      setIsSearching(false);
      toast.success('Match Found!', {
        description: `You've been matched with ${data.partnerName}`,
      });
      router.push('/session/matched');
    });

    socket.on('mock:timer-update', (data: { timeLeft: number }) => {
      setTimeLeft(data.timeLeft);
    });

    socket.on('session:partner-left', () => {
      toast.error('Your partner left the session');
      endSession();
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('mock:match-found');
      socket.off('mock:timer-update');
      socket.off('session:partner-left');
    };
  }, [router]);

  const startSearching = async () => {
    setIsSearching(true);
    connectSocket();

    try {
      // Call backend API to start matchmaking
      // For now, just emit mock event
      const socket = getSocket();
      setTimeout(() => {
        socket?.emit('mock:match-found', {
          partnerId: 'mock-partner-123',
          partnerName: 'Alex Johnson',
          roomId: 'session_' + Date.now(),
        });
      }, 3000);
    } catch (error) {
      toast.error('Failed to start matchmaking');
      setIsSearching(false);
    }
  };

  const cancelSearch = () => {
    setIsSearching(false);
    disconnectSocket();
    router.push('/dashboard');
  };

  const startSession = () => {
    if (session) {
      setSession({ ...session, status: 'active' });
      router.push('/session/active');
    }
  };

  const endSession = async () => {
    try {
      // Call backend API to end session
      // For now, just disconnect
      disconnectSocket();
      setSession(null);
      setTimeLeft(25 * 60);
      toast.success('Session ended successfully');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to end session');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    session,
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isSearching,
    isConnected,
    startSearching,
    cancelSearch,
    startSession,
    endSession,
  };
}
















