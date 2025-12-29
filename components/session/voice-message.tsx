/**
 * ============================================================================
 * VOICE-MESSAGE.TSX - VOICE MESSAGE RECORDING AND PLAYBACK
 * ============================================================================
 * 
 * Purpose: Allows users to record and send voice messages during sessions.
 * Uses browser MediaRecorder API to record audio and sends via Socket.IO.
 * 
 * Features:
 * - Record audio using MediaRecorder API
 * - Send audio blob via Socket.IO
 * - Playback received voice messages
 * - Visual recording indicator
 * - Duration display
 * 
 * Socket.IO Events:
 * - Emits: 'session:voice-message'
 * - Listens: 'session:voice-message-received'
 * 
 * @author Marvelous Eromonsele
 * @component Session/VoiceMessage
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Mic, Square, Play, Pause, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceMessageProps {
  socket: Socket | null;
  roomId: string;
  currentUserId: string;
  className?: string;
}

interface VoiceMessageData {
  roomId: string;
  userId: string;
  userEmail: string;
  filePath: string;
  mimeType: string;
  duration: number;
  timestamp: string;
}

export function VoiceMessage({
  socket,
  roomId,
  currentUserId,
  className,
}: VoiceMessageProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [receivedMessages, setReceivedMessages] = useState<VoiceMessageData[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Listen for received voice messages
  useEffect(() => {
    if (!socket) return;

    const handleVoiceMessage = (data: VoiceMessageData) => {
      setReceivedMessages((prev) => [...prev, data]);
    };

    socket.on('session:voice-message-received', handleVoiceMessage);

    return () => {
      socket.off('session:voice-message-received', handleVoiceMessage);
    };
  }, [socket]);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });
        setRecordedBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Update duration
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
  };

  // Send voice message
  const sendVoiceMessage = async () => {
    if (!socket || !roomId || !recordedBlob) return;

    setIsUploading(true);

    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = (reader.result as string).split(',')[1];

        // Get audio duration
        const audio = new Audio();
        audio.src = URL.createObjectURL(recordedBlob);
        audio.onloadedmetadata = () => {
          const duration = Math.round(audio.duration);

          // Send via Socket.IO
          socket.emit('session:voice-message', {
            roomId,
            audioBlob: base64Audio,
            mimeType: 'audio/webm',
            duration,
            fileName: `voice_${Date.now()}.webm`,
          });

          // Reset state
          setRecordedBlob(null);
          setRecordingDuration(0);
          setIsUploading(false);
        };
      };
      reader.readAsDataURL(recordedBlob);
    } catch (error) {
      console.error('Failed to send voice message:', error);
      setIsUploading(false);
    }
  };

  // Play/pause voice message
  const togglePlayback = (message: VoiceMessageData) => {
    const audioId = message.filePath;
    let audio = audioRefs.current.get(audioId);

    if (!audio) {
      audio = new Audio();
      // Construct full URL using dynamic hostname (works on desktop + mobile)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
        (typeof window !== 'undefined'
          ? `http://${window.location.hostname}:3001`
          : 'http://localhost:3001');
      audio.src = `${baseUrl}${message.filePath}`;
      audioRefs.current.set(audioId, audio);

      audio.onended = () => {
        setPlayingId(null);
      };
    }

    if (playingId === audioId) {
      // Pause current
      audio.pause();
      setPlayingId(null);
    } else {
      // Stop other audios
      audioRefs.current.forEach((a, id) => {
        if (id !== audioId) {
          a.pause();
          a.currentTime = 0;
        }
      });

      // Play this one
      audio.play();
      setPlayingId(audioId);
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Recording controls */}
      <div className="flex items-center gap-3">
        {!isRecording && !recordedBlob && (
          <Button
            onClick={startRecording}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Mic className="h-4 w-4" />
            Record Voice
          </Button>
        )}

        {isRecording && (
          <div className="flex items-center gap-3">
            <Button
              onClick={stopRecording}
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-mono">
                {formatDuration(recordingDuration)}
              </span>
            </div>
          </div>
        )}

        {recordedBlob && !isUploading && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {formatDuration(recordingDuration)} recorded
            </span>
            <Button onClick={sendVoiceMessage} size="sm" className="gap-2">
              <Send className="h-4 w-4" />
              Send
            </Button>
            <Button
              onClick={() => {
                setRecordedBlob(null);
                setRecordingDuration(0);
              }}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        )}

        {isUploading && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Sending...
            </span>
          </div>
        )}
      </div>

      {/* Received voice messages */}
      {receivedMessages.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Voice Messages
          </p>
          {receivedMessages.map((msg) => {
            const isOwn = msg.userId === currentUserId;
            return (
              <div
                key={msg.filePath}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border',
                  isOwn
                    ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                )}
              >
                <Button
                  onClick={() => togglePlayback(msg)}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                >
                  {playingId === msg.filePath ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {isOwn ? 'You' : msg.userEmail.split('@')[0]}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDuration(msg.duration)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}










