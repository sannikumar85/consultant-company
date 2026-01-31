import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Monitor, 
  Users,
  MessageCircle,
  Settings
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const VideoCallPage = () => {
  const { callId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useAuth();
  
  // Video refs
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef();
  
  // State
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [turnConfig, setTurnConfig] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState('');
  const [currentCall, setCurrentCall] = useState(null);

  // Load call information
  useEffect(() => {
    const loadCall = async () => {
      if (!callId) return;
      
      try {
        // Get call details from API if needed
        console.log('Loading call:', callId);
        setCurrentCall({ _id: callId });
      } catch (error) {
        console.error('Error loading call:', error);
      }
    };

    loadCall();
  }, [callId]);

  // Get TURN server configuration
  useEffect(() => {
    const getTurnConfig = async () => {
      try {
        const response = await api.get('/webrtc/turn-config');
        setTurnConfig(response.data.data);
        console.log('📋 TURN Config loaded:', response.data.data);
      } catch (error) {
        console.error('❌ Failed to get TURN config:', error);
        // Fallback configuration
        setTurnConfig({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
          ]
        });
      }
    };

    getTurnConfig();
  }, []);

  // Initialize media and peer connection
  useEffect(() => {
    if (!turnConfig) return;

    const initializeCall = async () => {
      try {
        setIsConnecting(true);
        
        // Get user media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Create peer connection with TURN servers
        const peerConnection = new RTCPeerConnection(turnConfig);
        peerConnectionRef.current = peerConnection;

        // Add local stream to peer connection
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });

        // Handle remote stream
        peerConnection.ontrack = (event) => {
          console.log('📺 Received remote stream');
          const [remoteStream] = event.streams;
          setRemoteStream(remoteStream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          setIsConnected(true);
          setIsConnecting(false);
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate && socket) {
            socket.emit('iceCandidate', {
              candidate: event.candidate,
              callId: callId
            });
          }
        };

        // Connection state changes
        peerConnection.onconnectionstatechange = () => {
          console.log('🔗 Connection state:', peerConnection.connectionState);
          if (peerConnection.connectionState === 'connected') {
            setIsConnected(true);
            setIsConnecting(false);
          } else if (peerConnection.connectionState === 'failed') {
            setError('Connection failed. Please check your internet connection.');
            setIsConnecting(false);
          }
        };

        console.log('✅ Call initialized successfully');
        
      } catch (error) {
        console.error('❌ Failed to initialize call:', error);
        setError('Failed to access camera/microphone. Please check permissions.');
        setIsConnecting(false);
      }
    };

    initializeCall();

    return () => {
      // Cleanup
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [turnConfig, callId, socket]); // Remove localStream from dependencies

  // Call duration timer
  useEffect(() => {
    let interval;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // End call
  const endCall = async () => {
    try {
      // End call via API
      if (callId) {
        await api.put(`/calls/${callId}/end`);
      }
    } catch (error) {
      console.error('Error ending call via API:', error);
    }

    // Cleanup local resources
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (socket) {
      socket.emit('endCall', { callId });
    }
    
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
      
      {/* Main video container */}
      <div className="relative h-screen flex flex-col">
        {/* Remote video (main) */}
        <div className="flex-1 relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          
          {/* Connection status overlay */}
          {isConnecting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-lg">Connecting to call...</p>
              </div>
            </motion.div>
          )}
          
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-red-500/50 flex items-center justify-center"
            >
              <div className="text-center text-white p-6">
                <p className="text-lg mb-4">{error}</p>
                <button
                  onClick={() => navigate(-1)}
                  className="btn btn-white"
                >
                  Go Back
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Call info */}
          {isConnected && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-6 left-6 text-white"
            >
              <div className="bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-sm opacity-75">Call Duration</p>
                <p className="text-xl font-mono">{formatDuration(callDuration)}</p>
              </div>
            </motion.div>
          )}
          
          {/* Local video (picture-in-picture) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-6 right-6 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20"
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <VideoOff className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </motion.div>
        </div>
        
        {/* Control panel */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
        >
          <div className="bg-black/40 backdrop-blur-sm rounded-full px-6 py-4">
            <div className="flex items-center space-x-4">
              {/* Audio toggle */}
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full transition-colors ${
                  isAudioEnabled 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </button>
              
              {/* Video toggle */}
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full transition-colors ${
                  isVideoEnabled 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </button>
              
              {/* End call */}
              <button
                onClick={endCall}
                className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
              
              {/* Additional controls */}
              <button className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors">
                <Monitor className="w-6 h-6" />
              </button>
              
              <button className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors">
                <MessageCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VideoCallPage;
