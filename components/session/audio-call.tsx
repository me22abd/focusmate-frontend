/**
 * ============================================================================
 * AUDIO-CALL.TSX - WEBRTC AUDIO CALL COMPONENT
 * ============================================================================
 * 
 * Purpose: Provides peer-to-peer audio call functionality during sessions.
 * Uses WebRTC for direct audio connection between partners.
 * 
 * Features:
 * - WebRTC peer-to-peer audio connection
 * - Mute/unmute controls
 * - "Calling..." state until partner answers
 * - End call button
 * - Socket.IO signaling (offer/answer/ICE candidates)
 * - TURN/STUN configuration for NAT traversal
 * 
 * Socket.IO Events:
 * - Emits: 'session:call-offer', 'session:call-answer', 'session:ice-candidate', 'session:call-end'
 * - Listens: 'session:call-offer-received', 'session:call-answer-received', 'session:ice-candidate-received', 'session:call-ended'
 * 
 * @author Marvelous Eromonsele
 * @component Session/AudioCall
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Phone, PhoneOff, Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AudioCallProps {
  socket: Socket | null;
  roomId: string;
  currentUserId: string;
  partnerId?: string;
  partnerName?: string;
  className?: string;
}

type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';

// WebRTC Configuration (TURN/STUN servers)
const rtcConfig: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Add your TURN server here if needed:
    // {
    //   urls: 'turn:your-turn-server.com:3478',
    //   username: 'your-username',
    //   credential: 'your-password',
    // },
  ],
};

export function AudioCall({
  socket,
  roomId,
  currentUserId,
  partnerId,
  partnerName,
  className,
}: AudioCallProps) {
  const [callState, setCallState] = useState<CallState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  // Initialize WebRTC
  const initializePeerConnection = () => {
    const pc = new RTCPeerConnection(rtcConfig);

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('session:ice-candidate', {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      if (remoteAudioRef.current && event.streams[0]) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setCallState('connected');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCall();
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  // Start call (initiator)
  const startCall = async () => {
    if (!socket || !roomId) return;

    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      // Initialize peer connection
      const pc = initializePeerConnection();
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer via Socket.IO
      socket.emit('session:call-offer', {
        roomId,
        offer,
        callType: 'audio',
      });

      setIsInitiator(true);
      setCallState('calling');
    } catch (error) {
      console.error('Failed to start call:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  // Answer call (receiver)
  const answerCall = async (offer: RTCSessionDescriptionInit) => {
    if (!socket || !roomId) return;

    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      // Initialize peer connection
      const pc = initializePeerConnection();
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Set remote description
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer via Socket.IO
      socket.emit('session:call-answer', {
        roomId,
        answer,
      });

      setIsInitiator(false);
      setCallState('connected');
    } catch (error) {
      console.error('Failed to answer call:', error);
      endCall();
    }
  };

  // End call
  const endCall = () => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Notify partner
    if (socket && roomId && callState !== 'idle') {
      socket.emit('session:call-end', { roomId });
    }

    setCallState('idle');
    setIsMuted(false);
    setIsInitiator(false);
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleCallOffer = (data: {
      roomId: string;
      fromUserId: string;
      offer: RTCSessionDescriptionInit;
      callType: string;
    }) => {
      if (data.callType === 'audio') {
        setCallState('ringing');
        // Auto-answer for now (can add accept/reject UI later)
        answerCall(data.offer);
      }
    };

    const handleCallAnswer = async (data: {
      roomId: string;
      fromUserId: string;
      answer: RTCSessionDescriptionInit;
    }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
        setCallState('connected');
      }
    };

    const handleIceCandidate = async (data: {
      roomId: string;
      fromUserId: string;
      candidate: RTCIceCandidateInit;
    }) => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        } catch (error) {
          console.error('Failed to add ICE candidate:', error);
        }
      }
    };

    const handleCallEnded = () => {
      endCall();
    };

    socket.on('session:call-offer-received', handleCallOffer);
    socket.on('session:call-answer-received', handleCallAnswer);
    socket.on('session:ice-candidate-received', handleIceCandidate);
    socket.on('session:call-ended', handleCallEnded);

    return () => {
      socket.off('session:call-offer-received', handleCallOffer);
      socket.off('session:call-answer-received', handleCallAnswer);
      socket.off('session:ice-candidate-received', handleIceCandidate);
      socket.off('session:call-ended', handleCallEnded);
    };
  }, [socket, roomId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  return (
    <Card className={cn('p-4', className)}>
      <CardContent className="p-0">
        <div className="flex flex-col items-center gap-4">
          {/* Call status */}
          <div className="text-center">
            {callState === 'calling' && (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <p className="text-sm font-medium">Calling {partnerName || 'partner'}...</p>
              </div>
            )}
            {callState === 'ringing' && (
              <p className="text-sm font-medium">Incoming call...</p>
            )}
            {callState === 'connected' && (
              <p className="text-sm font-medium text-green-600">
                Call connected
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {callState === 'idle' && (
              <Button onClick={startCall} size="lg" className="gap-2">
                <Phone className="h-5 w-5" />
                Start Audio Call
              </Button>
            )}

            {callState === 'connected' && (
              <>
                <Button
                  onClick={toggleMute}
                  variant={isMuted ? 'destructive' : 'outline'}
                  size="icon"
                  className="h-12 w-12"
                >
                  {isMuted ? (
                    <MicOff className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  onClick={endCall}
                  variant="destructive"
                  size="icon"
                  className="h-12 w-12"
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </>
            )}

            {(callState === 'calling' || callState === 'ringing') && (
              <Button onClick={endCall} variant="destructive" size="lg" className="gap-2">
                <PhoneOff className="h-5 w-5" />
                Cancel
              </Button>
            )}
          </div>

          {/* Remote audio (hidden, plays automatically) */}
          <audio ref={remoteAudioRef} autoPlay />
        </div>
      </CardContent>
    </Card>
  );
}












