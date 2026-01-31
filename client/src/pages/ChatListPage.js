import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Search, 
  Users,
  Video,
  Plus,
  Sparkles,
  ArrowRight,
  Clock,
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import TeacherProfileModal from '../components/TeacherProfileModal';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ChatListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { theme } = useTheme();
  const [conversations, setConversations] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'teachers'
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);

  // Load existing conversations
  const loadConversations = async () => {
    try {
      const response = await api.get('/chat/conversations');
      if (response.data.success) {
        setConversations(response.data.conversations || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Don't show error for new users with no conversations yet
      setConversations([]);
    }
  };

  // Load available teachers for new chats
  const loadTeachers = async () => {
    try {
      const response = await api.get('/users/teachers');
      if (response.data.success) {
        setTeachers(response.data.teachers || []);
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
      toast.error('Failed to load teachers');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadConversations(),
          loadTeachers()
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Socket event handling for real-time updates
  useEffect(() => {
    if (socket && user) {
      const handleNewMessage = (messageData) => {
        console.log('Received new message in chat list:', messageData);
        
        // Process if this user is involved (sender or receiver) - handle both _id and id formats
        const userId = user._id || user.id;
        const isReceiver = messageData.receiverId === userId;
        const isSender = messageData.senderId === userId;
        
        if (isReceiver || isSender) {
          console.log('📨 User involved in message - reloading conversations');
          
          // Force immediate refresh of conversations
          setTimeout(() => {
            loadConversations();
          }, 100); // Small delay to ensure database is updated
          
          // Show notification only if user is the receiver and not currently in the chat
          if (isReceiver && !isSender) {
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/chat/')) {
              toast.success(`New message from ${messageData.senderName || 'User'}`);
            }
          }
        }
      };

      const handleNewConversation = (conversationData) => {
        console.log('New conversation created:', conversationData);
        loadConversations();
      };

      const handleConversationUpdate = (updateData) => {
        console.log('Conversation updated:', updateData);
        
        // Reload conversations if current user is involved
        if (updateData.senderId === user._id || updateData.senderId === user.id || 
            updateData.receiverId === user._id || updateData.receiverId === user.id) {
          console.log('👥 User involved in conversation update - reloading conversations');
          
          // Force immediate refresh of conversations
          setTimeout(() => {
            loadConversations();
          }, 100); // Small delay to ensure database is updated
          
          // Show notification if current user is the receiver and not in chat
          if ((updateData.receiverId === user._id || updateData.receiverId === user.id) && 
              updateData.senderId !== user._id && updateData.senderId !== user.id) {
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/chat/')) {
              toast.success(`New message from ${updateData.senderName || 'User'}`);
            }
          }
        }
      };

      socket.on('receiveMessage', handleNewMessage);
      socket.on('newConversation', handleNewConversation);
      socket.on('conversationUpdated', handleConversationUpdate);

      return () => {
        socket.off('receiveMessage', handleNewMessage);
        socket.off('newConversation', handleNewConversation);
        socket.off('conversationUpdated', handleConversationUpdate);
      };
    }
  }, [socket, user]);

  // Filter teachers based on search
  const filteredTeachers = teachers.filter(teacher => 
    teacher?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (teacher.specializations && teacher.specializations.some(spec => 
      spec.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );

  // Start chat with a teacher
  const startChat = (teacherId) => {
    navigate(`/chat/${teacherId}`);
  };

  const showTeacherProfile = (teacher) => {
    setSelectedTeacher(teacher);
    setShowTeacherModal(true);
  };

  const closeTeacherModal = () => {
    setShowTeacherModal(false);
    setSelectedTeacher(null);
  };

  const handleStartChat = (teacherId) => {
    navigate(`/chat/${teacherId}`);
  };

  const handleStartVideoCall = async (teacherId) => {
    try {
      const response = await api.post('/calls/initiate', {
        receiverId: teacherId,
        type: 'video'
      });

      if (response.data.success) {
        toast.success('Video call initiated');
        navigate(`/video-call/${teacherId}?callId=${response.data.call._id}`);
      }
    } catch (error) {
      console.error('Error initiating video call:', error);
      toast.error('Failed to initiate video call');
    }
  };

  // Format last message time
  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMs = now - messageDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    return messageDate.toLocaleDateString();
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
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className={`w-16 h-16 border-4 rounded-full mb-4 mx-auto ${
              theme === 'bright'
              ? 'border-orange-500 border-t-transparent'
              : 'border-blue-500 border-t-transparent'
            }`}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`text-lg font-semibold ${
              theme === 'bright' ? 'text-gray-700' : 'text-white'
            }`}
          >
            Loading your chats...
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen transition-all duration-500 ${
        theme === 'bright' 
        ? 'bg-gradient-to-br from-yellow-50 via-white to-yellow-100' 
        : 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900'
      }`}
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className={`absolute top-20 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${
            theme === 'bright' 
            ? 'bg-gradient-to-tr from-yellow-200/30 via-transparent to-orange-200/30' 
            : 'bg-gradient-to-tr from-blue-600/20 via-transparent to-purple-600/20'
          }`}
        />
        <div 
          className={`absolute bottom-20 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 ${
            theme === 'bright' ? 'bg-orange-400' : 'bg-purple-500'
          }`}
        />
        <div 
          className={`absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl opacity-15 ${
            theme === 'bright' ? 'bg-yellow-400' : 'bg-blue-500'
          }`}
        />
      </div>

      {/* Header */}
      <div 
        className={`relative z-10 backdrop-blur-sm border-b shadow-lg ${
          theme === 'bright'
          ? 'bg-white/60 border-yellow-200/50'
          : 'bg-gray-800/60 border-gray-700/50'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <div 
                className={`p-4 rounded-2xl mr-4 shadow-lg ${
                  theme === 'bright'
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}
              >
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 
                  className={`text-4xl font-bold ${
                    theme === 'bright' ? 'text-gray-900' : 'text-white'
                  }`}
                >
                  Messages
                </h1>
                <p 
                  className={`text-lg ${
                    theme === 'bright' ? 'text-gray-600' : 'text-gray-300'
                  }`}
                >
                  Connect with your learning community
                </p>
              </div>
            </motion.div>
            
            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full lg:w-96"
            >
              <div className="relative">
                <Search 
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    theme === 'bright' ? 'text-gray-400' : 'text-gray-500'
                  }`} 
                />
                <input
                  type="text"
                  placeholder="Search teachers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all ${
                    theme === 'bright'
                    ? 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                    : 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                />
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`mt-8 flex rounded-2xl p-2 border backdrop-blur-sm ${
              theme === 'bright'
              ? 'bg-white/60 border-yellow-200/50'
              : 'bg-gray-800/60 border-gray-700/50'
            }`}
          >
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 py-3 px-6 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center ${
                activeTab === 'chats'
                  ? theme === 'bright'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : theme === 'bright'
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Recent Chats
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className={`flex-1 py-3 px-6 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center ${
                activeTab === 'teachers'
                  ? theme === 'bright'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : theme === 'bright'
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Users className="h-4 w-4 mr-2" />
              Find Teachers
            </button>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'chats' ? (
          /* Recent Chats Tab */
          <div className="space-y-6">
            {conversations.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`text-center py-16 rounded-3xl border backdrop-blur-sm ${
                  theme === 'bright'
                  ? 'bg-gradient-to-br from-white/80 via-yellow-50/80 to-orange-50/80 border-yellow-200 shadow-2xl shadow-yellow-500/10'
                  : 'bg-gradient-to-br from-gray-800/80 via-gray-900/80 to-blue-900/80 border-gray-700 shadow-2xl shadow-blue-500/10'
                }`}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${
                    theme === 'bright'
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  }`}
                >
                  <MessageCircle className="h-12 w-12 text-white" />
                </motion.div>
                <h3 
                  className={`text-3xl font-bold mb-4 ${
                    theme === 'bright' ? 'text-gray-900' : 'text-white'
                  }`}
                >
                  No conversations yet 
                  <span 
                    className={`bg-clip-text text-transparent bg-gradient-to-r ${
                      theme === 'bright' 
                      ? 'from-yellow-600 via-orange-500 to-red-500' 
                      : 'from-blue-400 via-purple-400 to-pink-400'
                    }`}
                  >
                    💬
                  </span>
                </h3>
                <p 
                  className={`text-lg mb-8 max-w-md mx-auto leading-relaxed ${
                    theme === 'bright' ? 'text-gray-600' : 'text-gray-300'
                  }`}
                >
                  Start chatting with teachers to see your conversations here and build meaningful learning connections
                </p>
                <motion.button
                  onClick={() => setActiveTab('teachers')}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`group inline-flex items-center px-8 py-4 font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl ${
                    theme === 'bright'
                    ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white hover:shadow-2xl hover:shadow-orange-500/25'
                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-500/25'
                  }`}
                >
                  <Sparkles className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Find Teachers
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </motion.div>
            ) : (
              conversations.filter(conversation => conversation.otherParticipant).map((conversation, index) => (
                <motion.div
                  key={conversation._id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => startChat(conversation.otherParticipant._id)}
                  className={`group p-6 rounded-2xl border backdrop-blur-sm cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    theme === 'bright'
                    ? 'bg-white/60 border-yellow-200/50 hover:bg-white/80 hover:border-yellow-300 hover:shadow-2xl hover:shadow-yellow-500/20'
                    : 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-700/80 hover:border-gray-600 hover:shadow-2xl hover:shadow-blue-500/20'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div 
                        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                          theme === 'bright'
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500'
                        }`}
                      >
                        <span className="text-white font-bold text-xl">
                          {conversation.otherParticipant?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 
                          className={`font-bold text-lg ${
                            theme === 'bright' ? 'text-gray-900' : 'text-white'
                          }`}
                        >
                          {conversation.otherParticipant?.name || 'Unknown User'}
                        </h3>
                        {conversation.lastMessageTime && (
                          <span 
                            className={`text-sm ${
                              theme === 'bright' ? 'text-gray-500' : 'text-gray-400'
                            }`}
                          >
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      
                      <p 
                        className={`text-sm capitalize mb-2 ${
                          theme === 'bright' ? 'text-gray-600' : 'text-gray-300'
                        }`}
                      >
                        {conversation.otherParticipant.role}
                      </p>
                      
                      {conversation.lastMessage && (
                        <p 
                          className={`text-sm truncate ${
                            theme === 'bright' ? 'text-gray-600' : 'text-gray-400'
                          }`}
                        >
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <ArrowRight 
                        className={`h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all ${
                          theme === 'bright' ? 'text-orange-500' : 'text-blue-400'
                        }`} 
                      />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          /* Find Teachers Tab */
          <div className="space-y-6">
            {filteredTeachers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`text-center py-16 rounded-3xl border backdrop-blur-sm ${
                  theme === 'bright'
                  ? 'bg-gradient-to-br from-white/80 via-yellow-50/80 to-orange-50/80 border-yellow-200 shadow-2xl shadow-yellow-500/10'
                  : 'bg-gradient-to-br from-gray-800/80 via-gray-900/80 to-blue-900/80 border-gray-700 shadow-2xl shadow-blue-500/10'
                }`}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${
                    theme === 'bright'
                    ? 'bg-gradient-to-r from-orange-400 to-red-400'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}
                >
                  <Users className="h-12 w-12 text-white" />
                </motion.div>
                <h3 
                  className={`text-3xl font-bold mb-4 ${
                    theme === 'bright' ? 'text-gray-900' : 'text-white'
                  }`}
                >
                  {searchQuery ? 'No teachers found ' : 'No teachers available yet '}
                  <span 
                    className={`bg-clip-text text-transparent bg-gradient-to-r ${
                      theme === 'bright' 
                      ? 'from-yellow-600 via-orange-500 to-red-500' 
                      : 'from-blue-400 via-purple-400 to-pink-400'
                    }`}
                  >
                    {searchQuery ? '🔍' : '👨‍🏫'}
                  </span>
                </h3>
                <p 
                  className={`text-lg max-w-md mx-auto leading-relaxed ${
                    theme === 'bright' ? 'text-gray-600' : 'text-gray-300'
                  }`}
                >
                  {searchQuery 
                    ? 'Try adjusting your search terms to find the perfect tutor'
                    : 'Teachers will appear here when they join our platform'
                  }
                </p>
              </motion.div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTeachers.map((teacher, index) => (
                  <motion.div
                    key={teacher._id}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -8 }}
                    className={`group p-6 rounded-3xl border backdrop-blur-sm transition-all duration-500 transform ${
                      theme === 'bright'
                      ? 'bg-white/60 border-yellow-200/50 hover:bg-white/80 hover:border-yellow-300 hover:shadow-2xl hover:shadow-yellow-500/20'
                      : 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-700/80 hover:border-gray-600 hover:shadow-2xl hover:shadow-blue-500/20'
                    }`}
                  >
                    {/* Teacher Header */}
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="relative">
                        <div 
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold cursor-pointer hover:scale-110 transition-transform duration-300 shadow-lg ${
                            theme === 'bright'
                            ? 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400'
                            : 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'
                          }`}
                          onClick={() => showTeacherProfile(teacher)}
                        >
                          {teacher.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 
                          className={`font-bold text-lg mb-1 group-hover:scale-105 transition-transform ${
                            theme === 'bright' ? 'text-gray-900' : 'text-white'
                          }`}
                        >
                          {teacher.name}
                        </h3>
                        <p 
                          className={`text-sm ${
                            theme === 'bright' ? 'text-gray-600' : 'text-gray-300'
                          }`}
                        >
                          {teacher.specializations?.join(', ') || 'General Tutor'}
                        </p>
                      </div>
                    </div>

                    {/* Rating & Rate */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <Star 
                          className={`h-4 w-4 mr-1 ${
                            theme === 'bright' ? 'text-yellow-500' : 'text-yellow-400'
                          }`} 
                        />
                        <span 
                          className={`font-semibold ${
                            theme === 'bright' ? 'text-gray-900' : 'text-white'
                          }`}
                        >
                          {teacher.rating || '5.0'}
                        </span>
                        <span 
                          className={`text-sm ml-1 ${
                            theme === 'bright' ? 'text-gray-500' : 'text-gray-400'
                          }`}
                        >
                          (24)
                        </span>
                      </div>
                      {teacher.hourlyRate && (
                        <div 
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            theme === 'bright'
                            ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700'
                            : 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 text-blue-300'
                          }`}
                        >
                          ${teacher.hourlyRate}/hr
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => startChat(teacher._id)}
                        className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center ${
                          theme === 'bright'
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        }`}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Chat
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStartVideoCall(teacher._id)}
                        className={`px-4 py-3 rounded-xl font-semibold transition-all border-2 ${
                          theme === 'bright'
                          ? 'border-gray-300 text-gray-700 bg-white/50 hover:bg-white hover:border-orange-300 hover:text-orange-600'
                          : 'border-gray-600 text-gray-300 bg-gray-800/50 hover:bg-gray-700 hover:border-blue-400 hover:text-blue-400'
                        }`}
                      >
                        <Video className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Teacher Profile Modal */}
      {showTeacherModal && selectedTeacher && (
        <TeacherProfileModal
          teacher={selectedTeacher}
          isOpen={showTeacherModal}
          onClose={closeTeacherModal}
          onStartChat={handleStartChat}
          onStartVideoCall={handleStartVideoCall}
        />
      )}
    </div>
  );
};

export default ChatListPage;
