/**
 * ============================================================================
 * VIDEO-CALL.TSX - WEBRTC VIDEO CALL COMPONENT
 * ============================================================================
 * 
 * Purpose: Provides peer-to-peer video call functionality during sessions.
 * Uses WebRTC for direct video/audio connection between partners.
 * 
 * Features:
 * - WebRTC peer-to-peer video/audio connection
 * - Toggle camera/mic buttons
 * - Full-screen mode
 * - Switch camera for mobile (front/back)
 * - Show user avatar when video is off
 * - Socket.IO signaling (offer/answer/ICE candidates)
 * - TURN/STUN configuration for NAT traversal
 * 
 * Socket.IO Events:
 * - Emits: 'session:call-offer', 'session:call-answer', 'session:ice-candidate', 'session:call-end'
 * - Listens: 'session:call-offer-received', 'session:call-answer-received', 'session:ice-candidate-received', 'session:call-ended'
 * 
 * @author Marvelous Eromonsele
 * @component Session/VideoCall
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import {
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Maximize,
  Minimize,
  Loader2,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface VideoCallProps {
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

export function VideoCall({
  socket,
  roomId,
  currentUserId,
  partnerId,
  partnerName,
  className,
}: VideoCallProps) {
  const [callState, setCallState] = useState<CallState>('idle');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get available cameras
  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((device) => device.kind === 'videoinput');
        setAvailableCameras(cameras);
        if (cameras.length > 0 && !selectedCameraId) {
          setSelectedCameraId(cameras[0].deviceId);
        }
      } catch (error) {
        console.error('Failed to get cameras:', error);
      }
    };
    getCameras();
  }, []);

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
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
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
      // Get user media (video + audio)
      const constraints: MediaStreamConstraints = {
        video: selectedCameraId ? { deviceId: { exact: selectedCameraId } } : true,
        audio: true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      // Show local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

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
        callType: 'video',
      });

      setIsInitiator(true);
      setCallState('calling');
    } catch (error) {
      console.error('Failed to start call:', error);
      alert('Failed to access camera/microphone. Please check permissions.');
    }
  };

  // Answer call (receiver)
  const answerCall = async (offer: RTCSessionDescriptionInit) => {
    if (!socket || !roomId) return;

    try {
      // Get user media (video + audio)
      const constraints: MediaStreamConstraints = {
        video: selectedCameraId ? { deviceId: { exact: selectedCameraId } } : true,
        audio: true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      // Show local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

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

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
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
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    setIsFullscreen(false);
    setIsInitiator(false);
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  // Switch camera
  const switchCamera = async () => {
    if (!localStreamRef.current || availableCameras.length < 2) return;

    const currentIndex = availableCameras.findIndex(
      (cam) => cam.deviceId === selectedCameraId
    );
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextCameraId = availableCameras[nextIndex].deviceId;

    // Stop current video track
    localStreamRef.current.getVideoTracks().forEach((track) => track.stop());

    // Get new video track
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: nextCameraId } },
      audio: false,
    });

    // Replace video track in peer connection
    const newVideoTrack = newStream.getVideoTracks()[0];
    const sender = peerConnectionRef.current?.getSenders().find((s) =>
      s.track?.kind === 'video'
    );
    if (sender && newVideoTrack) {
      await sender.replaceTrack(newVideoTrack);
    }

    // Update local stream
    localStreamRef.current.removeTrack(
      localStreamRef.current.getVideoTracks()[0]
    );
    localStreamRef.current.addTrack(newVideoTrack);

    // Update local video element
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    setSelectedCameraId(nextCameraId);
    newStream.getVideoTracks().forEach((track) => {
      if (track !== newVideoTrack) track.stop();
    });
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
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
      if (data.callType === 'video') {
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
    <Card
      ref={containerRef}
      className={cn(
        'p-4',
        isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className
      )}
    >
      <CardContent className="p-0">
        <div className="flex flex-col h-full">
          {/* Video area */}
          {callState === 'connected' && (
            <div className="relative flex-1 bg-slate-900 rounded-lg overflow-hidden mb-4">
              {/* Remote video */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Local video (picture-in-picture) */}
              {localVideoRef && (
                <div className="absolute bottom-4 right-4 w-32 h-24 bg-slate-800 rounded-lg overflow-hidden border-2 border-white">
                  {isVideoEnabled ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-700">
                      <User className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
              )}

              {/* Partner video off indicator */}
              {!isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <User className="h-16 w-16 text-white mx-auto mb-2" />
                    <p className="text-white text-sm">{partnerName || 'Partner'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Call status */}
          {callState === 'calling' && (
            <div className="flex flex-col items-center justify-center py-8 mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
              <p className="text-sm font-medium">
                Calling {partnerName || 'partner'}...
              </p>
            </div>
          )}

          {callState === 'ringing' && (
            <div className="flex flex-col items-center justify-center py-8 mb-4">
              <p className="text-sm font-medium">Incoming video call...</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {callState === 'idle' && (
              <Button onClick={startCall} size="lg" className="gap-2">
                <Video className="h-5 w-5" />
                Start Video Call
              </Button>
            )}

            {callState === 'connected' && (
              <>
                <Button
                  onClick={toggleVideo}
                  variant={isVideoEnabled ? 'outline' : 'destructive'}
                  size="icon"
                  className="h-12 w-12"
                >
                  {isVideoEnabled ? (
                    <Video className="h-5 w-5" />
                  ) : (
                    <VideoOff className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  onClick={toggleAudio}
                  variant={isAudioEnabled ? 'outline' : 'destructive'}
                  size="icon"
                  className="h-12 w-12"
                >
                  {isAudioEnabled ? (
                    <Mic className="h-5 w-5" />
                  ) : (
                    <MicOff className="h-5 w-5" />
                  )}
                </Button>
                {availableCameras.length > 1 && (
                  <Button
                    onClick={switchCamera}
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                    title="Switch camera"
                  >
                    <Video className="h-5 w-5" />
                  </Button>
                )}
                <Button
                  onClick={toggleFullscreen}
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                >
                  {isFullscreen ? (
                    <Minimize className="h-5 w-5" />
                  ) : (
                    <Maximize className="h-5 w-5" />
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
        </div>
      </CardContent>
    </Card>
  );
}






