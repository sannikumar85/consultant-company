import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// Create socket context
const SocketContext = createContext();

// Socket provider component
export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const socket = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to socket server
      socket.current = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3001', {
        auth: {
          token: localStorage.getItem('token'),
        },
        transports: ['websocket'],
      });

      // Connection event handlers
      socket.current.on('connect', () => {
        console.log('✅ Connected to server');
        setIsConnected(true);
        
        // Join user's room
        socket.current.emit('join', user._id || user.id);
      });

      socket.current.on('disconnect', () => {
        console.log('❌ Disconnected from server');
        setIsConnected(false);
      });

      socket.current.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        setIsConnected(false);
      });

      // Chat message handlers
      socket.current.on('receiveMessage', (messageData) => {
        console.log('📨 New message received:', messageData);
        // This will be handled by the chat components
      });

      // Video call handlers
      socket.current.on('incomingCall', (callData) => {
        console.log('📞 Incoming call from:', callData.callerName);
        toast((t) => (
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                📞 Incoming call from {callData.callerName}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  acceptCall(callData);
                  toast.dismiss(t.id);
                }}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
              >
                Accept
              </button>
              <button
                onClick={() => {
                  rejectCall(callData);
                  toast.dismiss(t.id);
                }}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        ), {
          duration: 30000,
          style: {
            background: '#fff',
            color: '#000',
            border: '2px solid #10B981',
          },
        });
      });

      socket.current.on('callAccepted', (callData) => {
        console.log('✅ Call accepted');
        // Handle call acceptance in video call component
      });

      socket.current.on('callRejected', () => {
        console.log('❌ Call rejected');
        toast.error('Call was rejected');
      });

      // Online users handler
      socket.current.on('userOnline', (userId) => {
        setOnlineUsers(prev => new Set([...prev, userId]));
      });

      socket.current.on('userOffline', (userId) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      // Handle active users update from server
      socket.current.on('activeUsersUpdate', (userList) => {
        setOnlineUsers(new Set(userList));
      });

      // Handle join confirmation
      socket.current.on('joinConfirmed', (data) => {
        console.log('✅ Successfully joined socket room:', data);
      });

      // Cleanup on unmount
      return () => {
        if (socket.current) {
          socket.current.disconnect();
          socket.current = null;
          setIsConnected(false);
        }
      };
    }
  }, [isAuthenticated, user]);

  // Send message function
  const sendMessage = (messageData) => {
    if (socket.current && isConnected) {
      socket.current.emit('sendMessage', messageData);
    }
  };

  // Initiate call function
  const initiateCall = (receiverId, callerName) => {
    if (socket.current && isConnected) {
      socket.current.emit('initiateCall', {
        receiverId,
        callerId: user.id,
        callerName,
      });
    }
  };

  // Accept call function
  const acceptCall = (callData) => {
    if (socket.current && isConnected) {
      socket.current.emit('acceptCall', {
        callerId: callData.callerId,
      });
      // Navigate to video call page
      window.location.href = `/video-call/${callData.callId}`;
    }
  };

  // Reject call function
  const rejectCall = (callData) => {
    if (socket.current && isConnected) {
      socket.current.emit('rejectCall', {
        callerId: callData.callerId,
      });
    }
  };

  // End call function
  const endCall = () => {
    if (socket.current && isConnected) {
      socket.current.emit('endCall');
    }
  };

  // Join room function
  const joinRoom = (roomId) => {
    if (socket.current && isConnected) {
      socket.current.emit('joinRoom', roomId);
    }
  };

  // Leave room function
  const leaveRoom = (roomId) => {
    if (socket.current && isConnected) {
      socket.current.emit('leaveRoom', roomId);
    }
  };

  // Get socket instance
  const getSocket = () => socket.current;

  const value = {
    socket: socket.current,
    isConnected,
    onlineUsers,
    sendMessage,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    joinRoom,
    leaveRoom,
    getSocket,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
