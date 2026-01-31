const express = require('express');
const { body, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/chat/conversations
// @desc    Get all conversations for the current user
// @access  Private
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Chat.find({
      participants: userId,
      isActive: true
    })
    .populate('participants', 'name avatar role')
    .sort({ lastMessageTime: -1 });

    // Format conversations for frontend
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== userId.toString()
      );

      return {
        _id: conv._id,
        otherParticipant: otherParticipant,
        lastMessage: conv.lastMessage,
        lastMessageTime: conv.lastMessageTime,
        unreadCount: conv.messages.filter(
          msg => msg.sender.toString() !== userId.toString() && !msg.isRead
        ).length
      };
    });

    res.json({
      success: true,
      conversations: formattedConversations
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/chat/conversation/:userId
// @desc    Get or create conversation with specific user
// @access  Private
router.get('/conversation/:userId', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    // Check if the other user exists
    const otherUser = await User.findById(otherUserId).select('name avatar role');
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find or create conversation
    const conversation = await Chat.findOrCreateChat(currentUserId, otherUserId);

    // Mark messages as read for current user
    await conversation.markAsRead(currentUserId);

    // Format messages for frontend
    const formattedMessages = conversation.messages.map(msg => ({
      _id: msg._id,
      sender: msg.sender,
      content: msg.content,
      messageType: msg.messageType,
      timestamp: msg.timestamp,
      isRead: msg.isRead,
      isSentByMe: msg.sender.toString() === currentUserId.toString()
    }));

    res.json({
      success: true,
      conversation: {
        _id: conversation._id,
        participant: otherUser,
        messages: formattedMessages
      }
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/chat/send
// @desc    Send a message
// @access  Private
router.post('/send', [
  authenticateToken,
  body('receiverId').isMongoId().withMessage('Invalid receiver ID'),
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message content is required'),
  body('messageType').optional().isIn(['text', 'image', 'file']).withMessage('Invalid message type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const senderId = req.user._id;
    const { receiverId, content, messageType = 'text' } = req.body;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Find or create conversation
    const conversation = await Chat.findOrCreateChat(senderId, receiverId);

    // Add message to conversation
    await conversation.addMessage(senderId, content, messageType);

    // Populate the conversation with participant details
    await conversation.populate('participants', 'name avatar role');

    // Get the newly added message
    const newMessage = conversation.messages[conversation.messages.length - 1];

    res.json({
      success: true,
      message: 'Message sent successfully',
      messageData: {
        _id: newMessage._id,
        sender: senderId,
        content: newMessage.content,
        messageType: newMessage.messageType,
        timestamp: newMessage.timestamp,
        chatId: conversation._id,
        isSentByMe: true
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/chat/mark-read/:chatId
// @desc    Mark all messages in a chat as read
// @access  Private
router.put('/mark-read/:chatId', authenticateToken, async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user._id;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    await chat.markAsRead(userId);

    res.json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/chat/conversation/:chatId
// @desc    Delete a conversation (soft delete)
// @access  Private
router.delete('/conversation/:chatId', authenticateToken, async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user._id;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Soft delete - mark as inactive
    chat.isActive = false;
    await chat.save();

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });

  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/chat/unread-count
// @desc    Get total unread messages count
// @access  Private
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Chat.find({
      participants: userId,
      isActive: true
    });

    let totalUnread = 0;
    
    conversations.forEach(conv => {
      const unreadCount = conv.messages.filter(
        msg => msg.sender.toString() !== userId.toString() && !msg.isRead
      ).length;
      totalUnread += unreadCount;
    });

    res.json({
      success: true,
      unreadCount: totalUnread
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
