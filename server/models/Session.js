const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    default: 60
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  meetingLink: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    default: ''
  },
  cost: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
sessionSchema.index({ student: 1, scheduledTime: -1 });
sessionSchema.index({ teacher: 1, scheduledTime: -1 });
sessionSchema.index({ status: 1 });

module.exports = mongoose.model('Session', sessionSchema);
