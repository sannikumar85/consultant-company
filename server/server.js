const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Import models
const Chat = require('./models/Chat');
const Notification = require('./models/Notification');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const subjectRoutes = require('./routes/subjects');
const chatRoutes = require('./routes/chat');
const emailRoutes = require('./routes/email');
const webrtcRoutes = require('./routes/webrtc');
const notificationRoutes = require('./routes/notifications');
const callRoutes = require('./routes/calls');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const server = http.createServer(app);

// Socket.io setup for real-time chat
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Simplified rate limiting for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path.startsWith('/api/auth/test');
  }
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB with retry logic
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tutoring-platform';
    console.log('🔄 Connecting to MongoDB...');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB successfully!');
    console.log(`📍 Database: ${mongoose.connection.name}`);
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('⚠️ Server will continue running but database features will not work');
    console.error('💡 Please check:');
    console.error('   1. MongoDB Atlas IP whitelist (add 0.0.0.0/0 for testing)');
    console.error('   2. Database credentials in .env file');
    console.error('   3. Network connection');
    return false;
  }
};

// Initialize MongoDB connection
connectDB();

const PORT = process.env.PORT || 3001;

// Routes
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running!',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to check active users
app.get('/debug/active-users', (req, res) => {
  res.json({
    success: true,
    activeUsers: Array.from(activeUsers.keys()),
    totalUsers: activeUsers.size,
    userSocketMap: Object.fromEntries(activeUsers),
    timestamp: new Date().toISOString()
  });
});

// Debug route to check saved chats
app.get('/api/debug/chats', async (req, res) => {
  try {
    const chats = await Chat.find({}).populate('participants', 'name email').lean();
    res.json({
      success: true,
      count: chats.length,
      chats: chats.map(chat => ({
        _id: chat._id,
        participants: chat.participants,
        messageCount: chat.messages.length,
        lastMessage: chat.lastMessage,
        lastMessageTime: chat.lastMessageTime,
        messages: chat.messages.slice(-3) // Last 3 messages
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/webrtc', webrtcRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Socket.io connection handling with authentication
const activeUsers = new Map();
const jwt = require('jsonwebtoken');

// Socket authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('⚠️ Socket connection without token - allowing for development');
      // For development, allow connections without tokens
      socket.userId = 'anonymous';
      socket.userName = 'Anonymous User';
      socket.userRole = 'student';
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from database
    const User = require('./models/User');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      console.log('❌ Socket connection rejected: Invalid or inactive user');
      // For development, still allow connection but mark as anonymous
      socket.userId = 'anonymous';
      socket.userName = 'Anonymous User';
      socket.userRole = 'student';
      return next();
    }

    // Add user to socket
    socket.userId = user._id.toString();
    socket.userName = user.name;
    socket.userRole = user.role;
    
    console.log(`✅ Socket authenticated for user: ${user.name} (${user._id})`);
    next();
  } catch (error) {
    console.log('⚠️ Socket authentication error, allowing anonymous connection:', error.message);
    // For development, allow connections even with auth errors
    socket.userId = 'anonymous';
    socket.userName = 'Anonymous User'; 
    socket.userRole = 'student';
    next();
  }
});

io.on('connection', (socket) => {
  console.log(`🔗 User connected: ${socket.userName} (${socket.id})`);

  // Join user to their room
  socket.on('join', (userId) => {
    // Use provided userId or authenticated user ID
    const actualUserId = userId || socket.userId;
    const displayName = socket.userName || `User-${actualUserId}`;
    
    // Remove from previous active users entry if exists
    for (const [key, value] of activeUsers.entries()) {
      if (value === socket.id) {
        activeUsers.delete(key);
      }
    }
    
    // Join user to their specific room
    socket.join(actualUserId);
    activeUsers.set(actualUserId, socket.id);
    
    console.log(`👤 User ${displayName} (${actualUserId}) joined room`);
    console.log(`🔗 Active users: ${Array.from(activeUsers.keys()).join(', ')}`);
    console.log(`🏠 All rooms for this socket:`, Array.from(socket.rooms));
    
    // Confirm join to client
    socket.emit('joinConfirmed', { userId: actualUserId, status: 'connected' });
    
    // Broadcast updated active users list to all clients
    io.emit('activeUsersUpdate', Array.from(activeUsers.keys()));
  });

  // Handle chat messages with improved reliability and database persistence
  socket.on('sendMessage', async (messageData) => {
    try {
      const { receiverId, senderId, message, chatId, messageId, senderName, messageType } = messageData;
      
      console.log(`📨 Processing message from ${senderId} to ${receiverId}: ${message}`);
      console.log(`📋 Message data:`, messageData);
      console.log(`🔗 Active users: ${Array.from(activeUsers.keys()).join(', ')}`);
      
      // Validate required fields
      if (!receiverId || !senderId || !message) {
        console.error('❌ Invalid message data - missing required fields');
        console.error('❌ receiverId:', receiverId, 'senderId:', senderId, 'message:', message);
        socket.emit('messageFailed', { 
          error: 'Missing required fields',
          messageId: messageId 
        });
        return;
      }
      
      // Validate that sender and receiver are different
      if (senderId === receiverId) {
        console.error('❌ Cannot send message to yourself');
        socket.emit('messageFailed', { 
          error: 'Cannot send message to yourself',
          messageId: messageId 
        });
        return;
      }
      
      // Save message to database using Chat model helpers
      try {
        // Use existing helper to find or create the chat
        const chat = await Chat.findOrCreateChat(senderId, receiverId);

        // Add the message using schema method so structure matches
        await chat.addMessage(senderId, message, messageType || 'text');

        console.log(`💾 Message saved to database for chat between ${senderId} and ${receiverId}`);
        
      } catch (dbError) {
        console.error('❌ Database error while saving message:', dbError);
        socket.emit('messageFailed', { 
          error: 'Failed to save message to database',
          messageId: messageId 
        });
        return;
      }
      
      // Send message to the specific recipient using rooms
      const recipientOnline = activeUsers.has(receiverId);
      const senderOnline = activeUsers.has(senderId);
      
      const messagePayload = {
        receiverId: receiverId,
        senderId,
        message,
        messageType: messageType || 'text',
        chatId,
        messageId,
        senderName,
        timestamp: new Date().toISOString()
      };
      
      // Send to recipient if online (using room instead of socket ID)
      if (recipientOnline) {
        console.log(`📡 Sending message to recipient room: ${receiverId}`);
        console.log(`📋 Message: "${message}" from ${senderId} to ${receiverId}`);
        io.to(receiverId).emit('receiveMessage', messagePayload);
        console.log(`📤 Message delivered successfully to ${receiverId}`);
      } else {
        console.log(`📵 Recipient ${receiverId} is offline`);
        console.log(`🔍 Available users: ${Array.from(activeUsers.keys()).join(', ')}`);
      }
      
      // Send confirmation back to sender (using room instead of socket ID)
      if (senderOnline) {
        io.to(senderId).emit('messageConfirmed', {
          messageId,
          timestamp: messagePayload.timestamp,
          delivered: recipientOnline
        });
        console.log(`✅ Message confirmation sent to sender ${senderId}`);
      }

      // Create notification for the receiver
      try {
        const sender = await User.findById(senderId).select('name');
        const notification = await Notification.createNotification({
          recipient: receiverId,
          sender: senderId,
          type: 'chat_message',
          title: 'New Message',
          message: `${sender?.name || 'Someone'} sent you a message`,
          data: {
            chatId: `${senderId}-${receiverId}`,
            senderId: senderId,
            senderName: sender?.name || senderName,
            messagePreview: message.substring(0, 50)
          },
          actionUrl: `/chat/${senderId}`
        });
        
        console.log(`🔔 Notification created for receiver ${receiverId}`);
        
        // Emit notification to receiver via socket using rooms
        if (recipientOnline) {
          io.to(receiverId).emit('newNotification', {
            notification: notification,
            unreadCount: await Notification.countDocuments({ recipient: receiverId, isRead: false })
          });
          console.log(`🔔 Notification emitted to recipient ${receiverId}`);
        }
      } catch (notifError) {
        console.error('❌ Error creating notification:', notifError);
      }

      // Emit conversation update events to both sender and receiver
      // This ensures Recent Chats list updates for both users
      const conversationUpdateData = {
        senderId,
        receiverId,
        lastMessage: message,
        senderName: senderName,
        timestamp: new Date().toISOString()
      };

      // Send to sender to update their Recent Chats using rooms
      if (senderOnline) {
        io.to(senderId).emit('conversationUpdated', conversationUpdateData);
        console.log(`📋 Conversation update sent to sender ${senderId}`);
      }

      // Send to receiver to update their Recent Chats using rooms
      if (recipientOnline) {
        io.to(receiverId).emit('conversationUpdated', conversationUpdateData);
        console.log(`📋 Conversation update sent to recipient ${receiverId}`);
      }
      
      console.log(`✅ Message processed and saved successfully from ${senderId} to ${receiverId}`);
      
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('messageFailed', { error: 'Failed to process message' });
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.userName} (${socket.id})`);
    
    // Remove user from active users
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        console.log(`❌ Removed user ${userId} from active users`);
        break;
      }
    }
    
    // Broadcast updated active users list
    io.emit('activeUsersUpdate', Array.from(activeUsers.keys()));
    console.log(`🔗 Updated active users: ${Array.from(activeUsers.keys()).join(', ')}`);
  });

  // Handle video call initiation
  socket.on('initiateCall', (callData) => {
    const { receiverId, callerId, callerName } = callData;
    socket.to(receiverId).emit('incomingCall', {
      callerId,
      callerName,
      callId: socket.id
    });
  });

  // Handle call acceptance
  socket.on('acceptCall', (callData) => {
    const { callerId } = callData;
    socket.to(callerId).emit('callAccepted', {
      accepterId: socket.id
    });
  });

  // Handle call rejection
  socket.on('rejectCall', (callData) => {
    const { callerId } = callData;
    socket.to(callerId).emit('callRejected');
  });

  // Handle video call initiation with improved reliability
  socket.on('initiateVideoCall', async (callData) => {
    const { receiverId, callerName, callerId: frontendCallerId } = callData;
    const callerId = socket.userId !== 'anonymous' ? socket.userId : frontendCallerId;
    
    console.log(`🎥 Video call initiated from ${socket.userName} (${callerId}) to ${receiverId}`);
    console.log(`📋 Call data:`, callData);
    
    try {
      // Validate call data
      if (!callerId || !receiverId) {
        console.error('❌ Missing caller or receiver ID');
        return socket.emit('videoCallFailed', {
          error: 'Missing caller or receiver information'
        });
      }
      
      // Validate that caller and receiver are different
      if (callerId === receiverId) {
        console.log('❌ Cannot call yourself');
        return socket.emit('videoCallFailed', {
          error: 'Cannot call yourself'
        });
      }

      // Check if receiver exists in active users
      const receiverOnline = activeUsers.has(receiverId);
      console.log(`📋 Receiver ${receiverId} online status:`, receiverOnline);
      
      // Create call ID
      const callId = callData.callId || `call_${callerId}_${receiverId}_${Date.now()}`;
      
      // Always emit success to caller for better UX
      socket.emit('videoCallInitiated', {
        callId,
        receiverId,
        status: receiverOnline ? 'calling' : 'calling_offline',
        message: receiverOnline ? 
          'Video call initiated' : 
          'Video call initiated (recipient will be notified when online)'
      });
      
      console.log(`✅ Call initiation confirmed to caller`);
      
      if (receiverOnline) {
        const receiverSocketId = activeUsers.get(receiverId);
        
        // Send call invitation to receiver
        io.to(receiverSocketId).emit('incomingVideoCall', {
          callerId,
          callerName: socket.userName || callerName || 'Unknown',
          callId: callId
        });
        
        console.log(`📞 Video call invitation sent to receiver ${receiverId}`);
      }
      
    } catch (error) {
      console.error('Error initiating video call:', error);
      socket.emit('videoCallFailed', {
        error: 'Failed to initiate call',
        details: error.message
      });
    }
  });

  socket.on('acceptVideoCall', async (callData) => {
    const { callId, callerId } = callData;
    const accepterId = socket.userId; // Use authenticated user ID
    
    console.log(`📹 Video call accepted by ${socket.userName} (${accepterId}) for call ${callId}`);
    
    try {
      // Update call status in database
      const Call = require('./models/Call');
      await Call.findByIdAndUpdate(callId, {
        status: 'answered',
        answeredAt: new Date()
      });

      if (activeUsers.has(callerId)) {
        const callerSocketId = activeUsers.get(callerId);
        io.to(callerSocketId).emit('videoCallAccepted', {
          accepterId,
          accepterName: socket.userName,
          callId
        });
      }
      
      console.log(`✅ Video call acceptance sent to caller ${callerId}`);
    } catch (error) {
      console.error('Error updating call status:', error);
    }
  });

  socket.on('rejectVideoCall', async (callData) => {
    const { callId, callerId } = callData;
    const rejecterId = socket.userId; // Use authenticated user ID
    
    console.log(`📹 Video call rejected by ${socket.userName} (${rejecterId}) for call ${callId}`);
    
    try {
      // Update call status in database
      const Call = require('./models/Call');
      await Call.findByIdAndUpdate(callId, {
        status: 'rejected',
        endedAt: new Date()
      });

      if (activeUsers.has(callerId)) {
        const callerSocketId = activeUsers.get(callerId);
        io.to(callerSocketId).emit('videoCallRejected', {
          rejecterId,
          rejecterName: socket.userName,
          callId
        });
      }
      
      console.log(`✅ Video call rejection sent to caller ${callerId}`);
    } catch (error) {
      console.error('Error updating call status:', error);
    }
  });

  socket.on('endVideoCall', async (callData) => {
    const { callId, receiverId } = callData;
    const callerId = socket.userId; // Use authenticated user ID
    
    console.log(`📹 Video call ended by ${socket.userName} (${callerId}) for call ${callId}`);
    
    try {
      // Update call status in database
      const Call = require('./models/Call');
      const call = await Call.findById(callId);
      if (call && call.status === 'answered' && call.answeredAt) {
        const duration = Math.floor((new Date() - call.answeredAt) / 1000);
        await Call.findByIdAndUpdate(callId, {
          status: 'ended',
          endedAt: new Date(),
          duration
        });
      } else if (call) {
        await Call.findByIdAndUpdate(callId, {
          status: 'ended',
          endedAt: new Date()
        });
      }

      // Notify both parties
      if (activeUsers.has(callerId)) {
        const callerSocketId = activeUsers.get(callerId);
        io.to(callerSocketId).emit('videoCallEnded', { 
          callId,
          endedBy: socket.userName
        });
      }
      
      if (receiverId && activeUsers.has(receiverId)) {
        const receiverSocketId = activeUsers.get(receiverId);
        io.to(receiverSocketId).emit('videoCallEnded', { 
          callId,
          endedBy: socket.userName
        });
      }
      
      console.log(`✅ Video call ended successfully`);
    } catch (error) {
      console.error('Error ending call:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`👋 User disconnected: ${socket.userName} (${socket.id})`);
    
    // Remove user from active users
    if (socket.userId) {
      activeUsers.delete(socket.userId);
      console.log(`🔄 Removed user ${socket.userName} from active users`);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
  // Handle user disconnect
  socket.on('disconnect', () => {
    const userId = socket.userId;
    const userName = socket.userName;
    
    console.log(`👋 User disconnected: ${userName} (${userId})`);
    
    // Remove from active users
    if (userId && activeUsers.has(userId)) {
      activeUsers.delete(userId);
      console.log(`🔌 Removed ${userId} from active users`);
    }
    
    // Broadcast user offline status
    socket.broadcast.emit('userOffline', userId);
    
    console.log(`📊 Remaining active users: ${activeUsers.size}`);
  });

});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Import seeding function
const seedDatabase = require('./utils/seedDatabase');

server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  
  // Wait for MongoDB connection before seeding
  setTimeout(async () => {
    if (mongoose.connection.readyState === 1) {
      // Seed database with demo data
      await seedDatabase();
    } else {
      console.log('⏭️ Skipping database seeding (MongoDB not connected)');
      console.log('📧 Demo accounts will not be available until database is connected');
    }
  }, 2000);
});

module.exports = { app, io };
