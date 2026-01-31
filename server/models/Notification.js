const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient of the notification
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Sender of the notification (optional for system notifications)
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Type of notification
  type: {
    type: String,
    enum: [
      'chat_message',
      'new_message', // Keep for backward compatibility
      'video_call_request',
      'video_call_missed',
      'video_call_accepted',
      'video_call_declined',
      'incoming_call',
      'missed_call',
      'call_answered',
      'call_rejected',
      'call_ended',
      'profile_view',
      'booking_request',
      'system_notification'
    ],
    required: true
  },
  
  // Notification title
  title: {
    type: String,
    required: true
  },
  
  // Notification message/content
  message: {
    type: String,
    required: true
  },
  
  // Related data (e.g., chat ID, call ID, etc.)
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Whether the notification has been read
  isRead: {
    type: Boolean,
    default: false
  },
  
  // Whether the notification has been seen (displayed to user)
  isSeen: {
    type: Boolean,
    default: false
  },
  
  // Action URL (where to redirect when clicked)
  actionUrl: {
    type: String
  },
  
  // Expiry date (for time-sensitive notifications)
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  try {
    const notification = new this(data);
    await notification.save();
    await notification.populate('sender', 'name avatar');
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.isSeen = true;
  return await this.save();
};

// Method to mark as seen
notificationSchema.methods.markAsSeen = async function() {
  this.isSeen = true;
  return await this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);
