import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, 
  ArrowLeft, 
  Video, 
  MoreVertical,
  Smile,
  Paperclip,
  Search,
  Star,
  CheckCheck,
  Phone,
  Info,
  Camera,
  Mic,
  Plus,
  Image as ImageIcon,
  MicIcon,
  X,
  Play,
  Pause
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { userAPI } from '../utils/api';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { theme } = useTheme();
  const messagesEndRef = useRef(null);
  
  // Debug logging
  console.log('🔍 ChatPage Debug - User object:', user);
  console.log('🔍 ChatPage Debug - Teacher ID:', teacherId);
  console.log('🔍 ChatPage Debug - Socket:', socket?.connected);
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  
  // File upload ref
  const fileInputRef = useRef(null);
  const recordingTimerRef = useRef(null);

  // Load chat data function - moved before useEffect to avoid hoisting issues
  const loadChatData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Handle case where teacherId is the same as current user
      const userId = user?._id || user?.id;
      if (userId === teacherId) {
        console.log('🏫 Teacher accessing their own page - this is now supported for receiving messages');
        // Set recipient to the user themselves for display purposes
        setRecipient(user);
      } else {
        // Load recipient info for normal case
        const recipientResponse = await userAPI.getUserById(teacherId);
        if (recipientResponse.data.success) {
          setRecipient(recipientResponse.data.user);
        }
      }
      
      // Load existing conversation messages from database
      try {
        console.log('📥 Loading conversation with:', teacherId);
        const conversationResponse = await api.get(`/chat/conversation/${teacherId}`);
        if (conversationResponse.data.success && conversationResponse.data.conversation) {
          const loadedMessages = conversationResponse.data.conversation.messages || [];
          setMessages(loadedMessages);
          console.log(`✅ Loaded ${loadedMessages.length} messages from database`);
        } else {
          // No conversation exists yet, start fresh
          setMessages([]);
          console.log('📝 No existing conversation, starting fresh');
        }
      } catch (conversationError) {
        // If conversation doesn't exist yet (404), that's okay
        if (conversationError.response?.status === 404) {
          setMessages([]);
          console.log('📝 No conversation found, starting new chat');
        } else {
          console.error('Error loading conversation:', conversationError);
          setMessages([]);
        }
      }
      
    } catch (error) {
      console.error('Error loading chat data:', error);
      toast.error('Failed to load chat');
    } finally {
      setLoading(false);
    }
  }, [user, teacherId]);

  useEffect(() => {
    if (teacherId) {
      loadChatData();
    } else {
      navigate('/dashboard');
    }

    // Cleanup when component unmounts or teacherId changes
    return () => {
      console.log('🧹 Clearing chat messages on exit');
      setMessages([]);
    };
  }, [teacherId, navigate, loadChatData]);

  // Socket event listeners for real-time chat
  useEffect(() => {
    if (socket && user && teacherId) {
      console.log('🔗 Setting up socket listeners for chat');
      console.log('Socket connected:', socket.connected);
      console.log('User:', user);
      console.log('Teacher ID:', teacherId);
      
      // Get user ID - try multiple possible fields
      const userId = user._id || user.id;
      
      if (!userId) {
        console.error('❌ No user ID found');
        return;
      }
      
      // Join user's room to ensure message delivery
      socket.emit('join', userId);
      console.log('🚀 Joining room with user ID:', userId);
      
      // Force emit join after a small delay to ensure connection is stable
      setTimeout(() => {
        socket.emit('join', userId);
        console.log('🔄 Re-joining room to ensure connection');
      }, 1000);
      
      // Listen for join confirmation
      const handleJoinConfirmed = (data) => {
        console.log('✅ Join confirmed:', data);
      };
      
      // Listen for active users updates
      const handleActiveUsersUpdate = (activeUsers) => {
        console.log('👥 Active users update:', activeUsers);
      };
      
      // Listen for incoming messages
      const handleReceiveMessage = (messageData) => {
        console.log('📨 Received message data:', messageData);
        console.log('🔍 Current user ID:', userId);
        console.log('🔍 Teacher ID (chat partner):', teacherId);
        console.log('🔍 Message senderId:', messageData.senderId);
        console.log('🔍 Message receiverId:', messageData.receiverId);
        
        // Process message if it's part of this conversation
        // Enhanced logic to handle all chat scenarios
        let isForThisChat = false;
        
        // Always show messages where current user is involved
        const userInvolvedInMessage = (messageData.senderId === userId || messageData.receiverId === userId);
        
        if (userId === teacherId) {
          // User is on their own page - show all messages involving them
          isForThisChat = userInvolvedInMessage;
          console.log('👤 User on own page - showing messages involving user ID:', userId);
        } else {
          // User is on someone else's page - show conversation between them
          const conversationPartners = [userId, teacherId].sort();
          const messagePartners = [messageData.senderId, messageData.receiverId].sort();
          isForThisChat = JSON.stringify(conversationPartners) === JSON.stringify(messagePartners);
          console.log('💬 Conversation between', conversationPartners, 'vs message between', messagePartners);
        }
        
        console.log('🔍 Message filter result:', isForThisChat, 'for message:', messageData.message?.substring(0, 50));
        
        if (isForThisChat) {
          console.log('✅ Processing message for this chat conversation');
          const newMessage = {
            _id: messageData.messageId || Date.now(),
            sender: messageData.senderId,
            content: messageData.message,
            messageType: messageData.messageType || 'text',
            fileName: messageData.fileName,
            duration: messageData.duration,
            timestamp: new Date(messageData.timestamp),
            isRead: true,
            isSentByMe: messageData.senderId === userId
          };
          
          setMessages(prev => {
            // Prevent duplicate messages
            const exists = prev.find(msg => msg._id === newMessage._id);
            if (exists) {
              console.log('⚠️ Message already exists, skipping duplicate');
              return prev;
            }
            console.log('📨 Adding new message to chat');
            console.log('📊 Previous message count:', prev.length);
            console.log('💬 New message content:', newMessage.content);
            const updatedMessages = [...prev, newMessage];
            console.log('📊 New message count:', updatedMessages.length);
            return updatedMessages;
          });
          
          // Show toast notification for incoming message (not sent by current user)
          if (messageData.senderId !== userId) {
            toast.success('New message received');
          }
          console.log('📨 Message processed successfully');
        } else {
          console.log('❌ Message not for this chat conversation');
          console.log('❌ Expected chat between:', userId, 'and', teacherId);
        }
      };

      // Listen for message confirmations and failures
      const handleMessageConfirmed = (confirmationData) => {
        console.log('✅ Message confirmed:', confirmationData);
        // Update message status if needed
      };
      
      const handleMessageFailed = (failureData) => {
        console.error('❌ Message failed:', failureData);
        toast.error(failureData.error || 'Failed to send message');
        
        // Remove failed message from state if messageId matches
        if (failureData.messageId) {
          setMessages(prev => prev.filter(msg => msg._id !== failureData.messageId));
        }
      };

      socket.on('receiveMessage', handleReceiveMessage);
      socket.on('messageConfirmed', handleMessageConfirmed);
      socket.on('messageFailed', handleMessageFailed);
      socket.on('joinConfirmed', handleJoinConfirmed);
      socket.on('activeUsersUpdate', handleActiveUsersUpdate);

      return () => {
        socket.off('receiveMessage', handleReceiveMessage);
        socket.off('messageConfirmed', handleMessageConfirmed);
        socket.off('messageFailed', handleMessageFailed);
        socket.off('joinConfirmed', handleJoinConfirmed);
        socket.off('activeUsersUpdate', handleActiveUsersUpdate);
      };
    }
  }, [socket, user, teacherId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll when typing indicator changes
  useEffect(() => {
    scrollToBottom();
  }, [isTyping, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest'
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    const messageText = message.trim();
    setMessage('');
    
    // Check socket connection
    if (!socket || !socket.connected) {
      toast.error('Not connected to server. Please refresh the page.');
      setMessage(messageText); // Restore message
      return;
    }
    
    // Get user ID - try multiple possible fields and log what we find
    const possibleIds = [user?._id, user?.id, user?.userId];
    const userId = possibleIds.find(id => id);
    
    console.log('🔍 Debug - user object keys:', Object.keys(user || {}));
    console.log('🔍 Debug - user._id:', user?._id);
    console.log('🔍 Debug - user.id:', user?.id);
    console.log('🔍 Debug - possibleIds:', possibleIds);
    console.log('🔍 Debug - final userId:', userId);
    
    if (!userId || !teacherId) {
      console.error('❌ Missing user or teacher ID:', { userId, teacherId, user });
      toast.error('Session expired. Please refresh the page.');
      setMessage(messageText); // Restore message
      return;
    }
    
    try {
      // Determine the actual recipient - simplified logic
      let actualReceiverId = teacherId;
      
      // If user is on their own page, find conversation partner from recent messages
      if (userId === teacherId) {
        const recentPartners = [...new Set(
          messages
            .filter(msg => msg.sender !== userId)
            .map(msg => msg.sender)
        )];
        
        if (recentPartners.length === 1) {
          actualReceiverId = recentPartners[0];
          console.log('🔍 Found conversation partner from messages:', actualReceiverId);
        } else if (recentPartners.length === 0) {
          // For demo purposes, allow sending to any of the active users
          // In a real app, this would show a user picker
          toast.error('No conversation history found. Start a new conversation from the dashboard.');
          setMessage(messageText);
          return;
        } else {
          // Multiple partners, use the most recent
          const lastMessage = [...messages].reverse().find(msg => msg.sender !== userId);
          actualReceiverId = lastMessage?.sender;
          console.log('🔍 Multiple partners found, using most recent:', actualReceiverId);
        }
      }
      
      console.log('📤 Sending message from', userId, 'to', actualReceiverId);
      
      // Create message object for local display
      const messageId = `msg_${Date.now()}_${userId}`;
      const newMessage = {
        _id: messageId,
        sender: userId,
        content: messageText,
        messageType: 'text',
        timestamp: new Date(),
        isRead: true,
        isSentByMe: true,
        status: 'sending'
      };
      
      // Add message to local state immediately
      setMessages(prev => [...prev, newMessage]);
      
      // Send real-time message via socket
      const socketMessage = {
        receiverId: actualReceiverId,
        senderId: userId,
        message: messageText,
        messageType: 'text',
        chatId: `${userId}-${actualReceiverId}`,
        messageId: messageId,
        senderName: user.name || user.email || 'User',
        timestamp: new Date().toISOString()
      };
      
      console.log('📤 Sending socket message:', {
        ...socketMessage,
        message: socketMessage.message.substring(0, 50) + '...'
      });
      
      socket.emit('sendMessage', socketMessage);
      
      // Force immediate local update for better UX
      setTimeout(() => {
        setMessages(prev => {
          const hasMessage = prev.find(msg => msg._id === messageId);
          if (!hasMessage) {
            console.log('🔄 Message not found in local state, adding it now');
            return [...prev, newMessage];
          }
          return prev;
        });
      }, 100);
      
      // Update message status to sent after a brief delay
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, status: 'sent' }
            : msg
        ));
      }, 500);
      
      console.log('📤 Message sent via socket');
      
      // Auto-scroll to bottom after sending message
      scrollToBottom();
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Video call handler
  const handleVideoCall = async () => {
    console.log('🎥 Video call button clicked');
    console.log('Socket status:', socket?.connected);
    console.log('User:', user);
    console.log('Teacher ID:', teacherId);
    
    // Get user ID - try multiple possible fields
    const userId = user?._id || user?.id;
    
    // Validate prerequisites
    if (!socket) {
      toast.error('Connection not available');
      console.error('❌ Socket not available');
      return;
    }
    
    if (!socket.connected) {
      toast.error('Not connected to server');
      console.error('❌ Socket not connected');
      return;
    }
    
    if (!userId) {
      toast.error('User not authenticated');
      console.error('❌ User ID not available');
      return;
    }
    
    if (!teacherId) {
      toast.error('Teacher not selected');
      console.error('❌ Teacher ID not available');
      return;
    }
    
    if (userId === teacherId) {
      toast.error('Cannot call yourself');
      console.error('❌ Cannot call yourself');
      return;
    }

    try {
      const callData = {
        receiverId: teacherId,
        callerName: user.name || user.email || 'User',
        callId: `call_${userId}_${teacherId}_${Date.now()}`,
        callerId: userId
      };
      
      console.log('🎥 Initiating video call:', callData);
      
      // Show loading state
      const loadingToast = toast.loading('Initiating video call...');
      
      // Emit video call event
      socket.emit('initiateVideoCall', callData);
      
      // Navigate to video call page after brief delay
      setTimeout(() => {
        toast.dismiss(loadingToast);
        toast.success('Video call started!');
        navigate(`/video-call/${callData.callId}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error starting video call:', error);
      toast.error('Failed to start video call');
    }
  };

  // Handle incoming video calls
  useEffect(() => {
    if (socket && user) {
      const handleIncomingVideoCall = (callData) => {
        console.log('📞 Incoming video call:', callData);
        
        toast((t) => (
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                📹 Incoming video call from {callData.callerName}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  socket.emit('acceptVideoCall', callData);
                  navigate(`/video-call/${callData.callId}`);
                  toast.dismiss(t.id);
                }}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
              >
                Accept
              </button>
              <button
                onClick={() => {
                  socket.emit('rejectVideoCall', callData);
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
      };

      socket.on('incomingVideoCall', handleIncomingVideoCall);
      
      return () => {
        socket.off('incomingVideoCall', handleIncomingVideoCall);
      };
    }
  }, [socket, user, navigate]);

  // Enhanced message functions
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;
      sendImageMessage(imageData, file.name);
    };
    reader.readAsDataURL(file);
    
    event.target.value = '';
    setShowImageUpload(false);
  };

  const sendImageMessage = (imageData, fileName) => {
    try {
      const newMessage = {
        _id: Date.now(),
        sender: user._id,
        content: imageData,
        messageType: 'image',
        fileName: fileName,
        timestamp: new Date(),
        isRead: true,
        isSentByMe: true
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      if (socket) {
        const socketMessage = {
          receiverId: teacherId,
          senderId: user._id,
          message: imageData,
          messageType: 'image',
          fileName: fileName,
          chatId: `${user._id}-${teacherId}`,
          messageId: newMessage._id,
          senderName: user.name
        };
        
        socket.emit('sendMessage', socketMessage);
        toast.success('Image sent!');
      }
    } catch (error) {
      console.error('Error sending image:', error);
      toast.error('Failed to send image');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const sendVoiceMessage = () => {
    if (!audioBlob) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const audioData = e.target.result;
      
      const newMessage = {
        _id: Date.now(),
        sender: user._id,
        content: audioData,
        messageType: 'audio',
        duration: recordingTime,
        timestamp: new Date(),
        isRead: true,
        isSentByMe: true
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      if (socket) {
        const socketMessage = {
          receiverId: teacherId,
          senderId: user._id,
          message: audioData,
          messageType: 'audio',
          duration: recordingTime,
          chatId: `${user._id}-${teacherId}`,
          messageId: newMessage._id,
          senderName: user.name
        };
        
        socket.emit('sendMessage', socketMessage);
        toast.success('Voice message sent!');
      }
      
      setAudioBlob(null);
      setRecordingTime(0);
    };
    reader.readAsDataURL(audioBlob);
  };

  const emojis = ['😀', '😂', '😍', '🥰', '😊', '😉', '😎', '🤔', '😢', '😭', '😡', '🤯', '👍', '👎', '👌', '🙏', '❤️', '💔', '🔥', '⭐', '🎉', '🎊', '💯', '✨'];

  const addEmoji = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  if (loading) {
    return (
      <div 
        className={`min-h-screen flex items-center justify-center ${
          theme === 'bright'
          ? 'bg-gradient-to-br from-yellow-50 via-white to-yellow-100'
          : 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900'
        }`}
      >
        <div className="text-center">
          <div 
            className={`w-12 h-12 border-4 rounded-full animate-spin mb-4 mx-auto ${
              theme === 'bright'
              ? 'border-orange-500 border-t-transparent'
              : 'border-blue-500 border-t-transparent'
            }`} 
          />
          <p 
            className={`${
              theme === 'bright' ? 'text-gray-600' : 'text-gray-300'
            }`}
          >
            Loading chat...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`h-screen flex flex-col ${
        theme === 'bright'
        ? 'bg-gradient-to-b from-gray-50 to-gray-100'
        : 'bg-gradient-to-b from-gray-900 to-gray-800'
      }`}
    >
      {/* WhatsApp-style Header */}
      <div 
        className={`flex-shrink-0 shadow-lg border-b backdrop-blur-sm ${
          theme === 'bright'
          ? 'bg-gradient-to-r from-white/90 to-yellow-50/90 border-yellow-200/50'
          : 'bg-gradient-to-r from-gray-800/90 to-blue-900/90 border-gray-700/50'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className={`p-2 rounded-lg transition-all ${
                theme === 'bright'
                ? 'hover:bg-yellow-100 text-gray-700'
                : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            {/* Profile Picture with Online Status */}
            <div className="relative">
              {recipient?.avatar ? (
                <img
                  src={recipient.avatar}
                  alt={recipient.name}
                  className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div 
                  className={`h-12 w-12 rounded-full flex items-center justify-center border-2 border-white shadow-md ${
                    theme === 'bright'
                    ? 'bg-gradient-to-r from-orange-400 to-red-400'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  }`}
                >
                  <span className="text-white font-bold text-lg">
                    {recipient?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
              {isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            
            <div>
              <h2 
                className={`font-bold text-lg ${
                  theme === 'bright' ? 'text-gray-900' : 'text-white'
                }`}
              >
                {recipient?.name}
              </h2>
              <div className="flex items-center space-x-2">
                <p 
                  className={`text-sm capitalize ${
                    theme === 'bright' ? 'text-gray-600' : 'text-gray-300'
                  }`}
                >
                  {recipient?.role}
                </p>
                {isOnline && (
                  <span 
                    className={`text-xs px-2 py-1 rounded-full ${
                      theme === 'bright'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-green-900 text-green-300'
                    }`}
                  >
                    Online
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            <button 
              className={`p-3 rounded-full transition-all ${
                theme === 'bright'
                ? 'hover:bg-yellow-100 text-gray-700'
                : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              <Video className="h-5 w-5" />
            </button>
            <button 
              className={`p-3 rounded-full transition-all ${
                theme === 'bright'
                ? 'hover:bg-yellow-100 text-gray-700'
                : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              <Phone className="h-5 w-5" />
            </button>
            <button 
              className={`p-3 rounded-full transition-all ${
                theme === 'bright'
                ? 'hover:bg-yellow-100 text-gray-700'
                : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp-style Messages Area */}
      <div 
        className={`flex-1 overflow-y-auto pb-20 ${
          theme === 'bright'
          ? 'bg-gradient-to-b from-gray-50 to-white'
          : 'bg-gradient-to-b from-gray-900 to-gray-800'
        }`}
        style={{
          backgroundImage: theme === 'bright' 
            ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Cg fill-opacity=\'0.03\'%3E%3Cpolygon fill=\'%23000\' points=\'50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40\'/%3E%3C/g%3E%3C/svg%3E")'
            : 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Cg fill-opacity=\'0.03\'%3E%3Cpolygon fill=\'%23fff\' points=\'50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40\'/%3E%3C/g%3E%3C/svg%3E")'
        }}
      >
        <div className="max-w-4xl mx-auto space-y-3 px-4 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div 
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  theme === 'bright'
                  ? 'bg-gradient-to-r from-yellow-100 to-orange-100'
                  : 'bg-gradient-to-r from-blue-900/50 to-purple-900/50'
                }`}
              >
                <Send 
                  className={`h-10 w-10 ${
                    theme === 'bright' ? 'text-orange-500' : 'text-blue-400'
                  }`} 
                />
              </div>
              <h3 
                className={`text-xl font-bold mb-2 ${
                  theme === 'bright' ? 'text-gray-900' : 'text-white'
                }`}
              >
                Start a conversation
              </h3>
              <p 
                className={`${
                  theme === 'bright' ? 'text-gray-600' : 'text-gray-400'
                }`}
              >
                Send your first message to {recipient?.name}
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isOwn = msg.sender === user?._id || msg.isSentByMe;
              const showTime = index === 0 || 
                new Date(messages[index - 1]?.timestamp).getTime() - new Date(msg.timestamp).getTime() > 300000;
              
              return (
                <div key={msg._id || index}>
                  {showTime && (
                    <div className="text-center my-4">
                      <span 
                        className={`px-3 py-1 text-xs rounded-full ${
                          theme === 'bright'
                          ? 'bg-white/70 text-gray-600 border border-gray-200'
                          : 'bg-gray-800/70 text-gray-300 border border-gray-600'
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleDateString([], {
                          weekday: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  
                  <div
                    className={`flex mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md ${
                        isOwn
                          ? theme === 'bright'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-br-md'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-md'
                          : theme === 'bright'
                            ? 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                            : 'bg-gray-700 border border-gray-600 text-white rounded-bl-md'
                      }`}
                    >
                      {msg.messageType === 'image' ? (
                        <div className="space-y-2">
                          <img 
                            src={msg.content} 
                            alt={msg.fileName || 'Shared image'}
                            className="max-w-full h-auto rounded-lg cursor-pointer"
                            onClick={() => window.open(msg.content, '_blank')}
                          />
                          {msg.fileName && (
                            <p className="text-xs opacity-75">{msg.fileName}</p>
                          )}
                        </div>
                      ) : msg.messageType === 'audio' ? (
                        <div className="flex items-center space-x-3">
                          <button className={`p-2 rounded-full ${
                            theme === 'bright' ? 'bg-white/20' : 'bg-gray-600'
                          }`}>
                            <Play className="h-4 w-4" />
                          </button>
                          <div className="flex-1">
                            <div className={`h-1 rounded-full ${
                              theme === 'bright' ? 'bg-white/30' : 'bg-gray-500'
                            }`}>
                              <div className={`h-1 rounded-full w-1/3 ${
                                theme === 'bright' ? 'bg-white' : 'bg-blue-400'
                              }`} />
                            </div>
                            <p className="text-xs mt-1 opacity-75">
                              {Math.floor(msg.duration / 60)}:{(msg.duration % 60).toString().padStart(2, '0')}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      )}
                      <div className={`flex items-center justify-end mt-2 space-x-1 ${
                        isOwn 
                          ? 'text-white/70' 
                          : theme === 'bright' 
                            ? 'text-gray-500' 
                            : 'text-gray-400'
                      }`}>
                        <span className="text-xs">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {isOwn && (
                          <CheckCheck 
                            className={`h-3 w-3 ${
                              msg.readBy?.length > 1 ? 'text-blue-200' : 'text-white/50'
                            }`} 
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {isTyping && (
            <div className="flex justify-start mb-2">
              <div 
                className={`px-4 py-3 rounded-2xl rounded-bl-md ${
                  theme === 'bright'
                  ? 'bg-white border border-gray-200'
                  : 'bg-gray-700 border border-gray-600'
                }`}
              >
                <div className="flex space-x-1">
                  <div 
                    className={`w-2 h-2 rounded-full animate-bounce ${
                      theme === 'bright' ? 'bg-gray-400' : 'bg-gray-400'
                    }`}
                    style={{ animationDelay: '0ms' }}
                  />
                  <div 
                    className={`w-2 h-2 rounded-full animate-bounce ${
                      theme === 'bright' ? 'bg-gray-400' : 'bg-gray-400'
                    }`}
                    style={{ animationDelay: '150ms' }}
                  />
                  <div 
                    className={`w-2 h-2 rounded-full animate-bounce ${
                      theme === 'bright' ? 'bg-gray-400' : 'bg-gray-400'
                    }`}
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* WhatsApp-style Message Input - Fixed at bottom */}
      <div 
        className={`fixed bottom-0 left-0 right-0 border-t backdrop-blur-sm z-50 ${
          theme === 'bright'
          ? 'bg-white/95 border-gray-200'
          : 'bg-gray-800/95 border-gray-700'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
            {/* Enhanced Attachment button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowImageUpload(!showImageUpload)}
                className={`p-3 rounded-full transition-all ${
                  theme === 'bright'
                  ? 'hover:bg-gray-100 text-gray-600'
                  : 'hover:bg-gray-700 text-gray-400'
                }`}
              >
                <Plus className="h-5 w-5" />
              </button>
              
              {/* Attachment menu */}
              {showImageUpload && (
                <div className={`absolute bottom-full left-0 mb-2 p-2 rounded-lg shadow-lg border ${
                  theme === 'bright'
                  ? 'bg-white border-gray-200'
                  : 'bg-gray-800 border-gray-600'
                }`}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg w-full text-left transition-all ${
                      theme === 'bright'
                      ? 'hover:bg-gray-100 text-gray-700'
                      : 'hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span className="text-sm">Photo</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            {/* Message Input Container */}
            <div 
              className={`flex-1 relative rounded-3xl border-2 transition-all ${
                theme === 'bright'
                ? 'bg-white border-gray-200 focus-within:border-orange-300'
                : 'bg-gray-700 border-gray-600 focus-within:border-blue-500'
              }`}
            >
              <div className="flex items-end">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Message ${recipient?.name}...`}
                  className={`flex-1 px-4 py-3 rounded-l-3xl border-none outline-none resize-none ${
                    theme === 'bright'
                    ? 'bg-transparent text-gray-900 placeholder-gray-500'
                    : 'bg-transparent text-white placeholder-gray-400'
                  }`}
                />
                
                {/* Enhanced Emoji and features */}
                <div className="flex items-center space-x-1 pr-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`p-2 rounded-full transition-all ${
                        theme === 'bright'
                        ? 'hover:bg-gray-100 text-gray-500'
                        : 'hover:bg-gray-600 text-gray-400'
                      }`}
                    >
                      <Smile className="h-5 w-5" />
                    </button>
                    
                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div className={`absolute bottom-full right-0 mb-2 p-3 rounded-lg shadow-lg border max-w-xs ${
                        theme === 'bright'
                        ? 'bg-white border-gray-200'
                        : 'bg-gray-800 border-gray-600'
                      }`}>
                        <div className="grid grid-cols-6 gap-2">
                          {emojis.map((emoji, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => addEmoji(emoji)}
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-lg"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Voice recording UI */}
              {isRecording && (
                <div className={`absolute -top-16 left-0 right-0 p-3 rounded-lg shadow-lg ${
                  theme === 'bright'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-red-900/20 border border-red-500/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                      <span className={`text-sm font-medium ${
                        theme === 'bright' ? 'text-red-700' : 'text-red-300'
                      }`}>
                        Recording: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Audio preview */}
              {audioBlob && !isRecording && (
                <div className={`absolute -top-16 left-0 right-0 p-3 rounded-lg shadow-lg ${
                  theme === 'bright'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-green-900/20 border border-green-500/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      theme === 'bright' ? 'text-green-700' : 'text-green-300'
                    }`}>
                      Voice message ready ({Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')})
                    </span>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setAudioBlob(null)}
                        className="p-1 rounded-full bg-gray-500 text-white hover:bg-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={sendVoiceMessage}
                        className="p-1 rounded-full bg-green-500 text-white hover:bg-green-600"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Send/Voice Button */}
            {message.trim() ? (
              <button
                type="submit"
                className={`p-3 rounded-full transition-all shadow-lg ${
                  theme === 'bright'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-orange-500/25'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-blue-500/25'
                }`}
              >
                <Send className="h-5 w-5" />
              </button>
            ) : audioBlob ? (
              <button
                type="button"
                onClick={sendVoiceMessage}
                className={`p-3 rounded-full transition-all shadow-lg ${
                  theme === 'bright'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                }`}
              >
                <Send className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={`p-3 rounded-full transition-all ${
                  isRecording
                  ? 'bg-red-500 text-white shadow-lg'
                  : theme === 'bright'
                    ? 'hover:bg-gray-100 text-gray-600'
                    : 'hover:bg-gray-700 text-gray-400'
                }`}
              >
                <Mic className="h-5 w-5" />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;