const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatSchema.index({ participants: 1 });
chatSchema.index({ 'messages.timestamp': -1 });

// Method to add a new message
chatSchema.methods.addMessage = function(senderId, content, messageType = 'text') {
  this.messages.push({
    sender: senderId,
    content: content,
    messageType: messageType
  });
  
  this.lastMessage = content;
  this.lastMessageTime = new Date();
  
  return this.save();
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function(userId) {
  this.messages.forEach(message => {
    if (message.sender.toString() !== userId.toString()) {
      message.isRead = true;
    }
  });
  
  return this.save();
};

// Static method to find or create chat between two users
chatSchema.statics.findOrCreateChat = async function(user1Id, user2Id) {
  let chat = await this.findOne({
    participants: { $all: [user1Id, user2Id] }
  }).populate('participants', 'name avatar role');
  
  if (!chat) {
    chat = new this({
      participants: [user1Id, user2Id]
    });
    await chat.save();
    chat = await chat.populate('participants', 'name avatar role');
  }
  
  return chat;
};

module.exports = mongoose.model('Chat', chatSchema);
