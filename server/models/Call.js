const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
  // Caller (who initiated the call)
  caller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Receiver (who received the call)
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Call type
  type: {
    type: String,
    enum: ['video', 'voice'],
    default: 'video'
  },
  
  // Call status
  status: {
    type: String,
    enum: [
      'initiated',    // Call request sent
      'ringing',      // Call is ringing
      'answered',     // Call was answered
      'rejected',     // Call was rejected
      'missed',       // Call was not answered
      'ended',        // Call ended normally
      'failed'        // Call failed due to technical issues
    ],
    default: 'initiated'
  },
  
  // Call session details
  sessionId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Call duration (in seconds)
  duration: {
    type: Number,
    default: 0
  },
  
  // Time when call was started (accepted)
  startTime: {
    type: Date
  },
  
  // Time when call was ended
  endTime: {
    type: Date
  },
  
  // Reason for call ending
  endReason: {
    type: String,
    enum: ['normal', 'rejected', 'missed', 'network_error', 'timeout'],
    default: 'normal'
  },
  
  // Quality rating (1-5 stars, optional)
  quality: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Technical details
  technical: {
    callerId: String,
    calleeId: String,
    turnServers: [String],
    networkType: String
  }
}, {
  timestamps: true
});

// Indexes
callSchema.index({ caller: 1, createdAt: -1 });
callSchema.index({ receiver: 1, createdAt: -1 });
callSchema.index({ sessionId: 1 });
callSchema.index({ status: 1, createdAt: -1 });

// Virtual for call participants
callSchema.virtual('participants').get(function() {
  return [this.caller, this.receiver];
});

// Method to update call status
callSchema.methods.updateStatus = async function(status, additionalData = {}) {
  this.status = status;
  
  switch (status) {
    case 'answered':
      this.startTime = new Date();
      break;
    case 'ended':
    case 'rejected':
    case 'missed':
    case 'failed':
      this.endTime = new Date();
      if (this.startTime) {
        this.duration = Math.floor((this.endTime - this.startTime) / 1000);
      }
      if (additionalData.endReason) {
        this.endReason = additionalData.endReason;
      }
      break;
  }
  
  // Add any additional data
  Object.assign(this, additionalData);
  
  return await this.save();
};

// Method to get call summary
callSchema.methods.getSummary = function() {
  return {
    id: this._id,
    caller: this.caller,
    receiver: this.receiver,
    type: this.type,
    status: this.status,
    duration: this.duration,
    startTime: this.startTime,
    endTime: this.endTime,
    endReason: this.endReason,
    quality: this.quality,
    createdAt: this.createdAt
  };
};

// Static method to create call
callSchema.statics.createCall = async function(callerId, receiverId, type = 'video') {
  const sessionId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const call = new this({
    caller: callerId,
    receiver: receiverId,
    type,
    sessionId,
    status: 'initiated'
  });
  
  await call.save();
  await call.populate('caller receiver', 'name avatar');
  return call;
};

// Ensure virtual fields are serialized
callSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Call', callSchema);
