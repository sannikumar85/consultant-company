const express = require('express');
const { body, validationResult } = require('express-validator');
const Call = require('../models/Call');
const Notification = require('../models/Notification');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/calls/initiate
// @desc    Initiate a video call
// @access  Private
router.post('/initiate', [
  authenticateToken,
  body('receiverId').isMongoId().withMessage('Invalid receiver ID'),
  body('type').isIn(['video', 'voice']).withMessage('Call type must be video or voice')
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

    const callerId = req.user._id;
    const { receiverId, type = 'video' } = req.body;

    // Check if caller and receiver are different
    if (callerId.toString() === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot call yourself'
      });
    }

    // Check if there's an active call between these users
    const existingCall = await Call.findOne({
      $or: [
        { caller: callerId, receiver: receiverId },
        { caller: receiverId, receiver: callerId }
      ],
      status: { $in: ['initiated', 'ringing', 'answered'] }
    });

    if (existingCall) {
      return res.status(400).json({
        success: false,
        message: 'There is already an active call between these users'
      });
    }

    // Create new call
    const call = await Call.create({
      caller: callerId,
      receiver: receiverId,
      type,
      status: 'initiated',
      initiatedAt: new Date()
    });

    await call.populate('caller', 'name avatar');
    await call.populate('receiver', 'name avatar');

    // Create notification for receiver
    await Notification.createNotification({
      recipient: receiverId,
      sender: callerId,
      type: 'incoming_call',
      title: `Incoming ${type} call`,
      message: `${req.user.name} is calling you`,
      data: {
        callId: call._id,
        callType: type,
        callerName: req.user.name,
        callerAvatar: req.user.avatar
      }
    });

    res.json({
      success: true,
      call,
      message: 'Call initiated'
    });

  } catch (error) {
    console.error('Initiate call error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/calls/:id/answer
// @desc    Answer a call
// @access  Private
router.put('/:id/answer', authenticateToken, async (req, res) => {
  try {
    const callId = req.params.id;
    const userId = req.user._id;

    const call = await Call.findById(callId)
      .populate('caller', 'name avatar')
      .populate('receiver', 'name avatar');

    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Check if user is the receiver
    if (call.receiver._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to answer this call'
      });
    }

    // Check if call can be answered
    if (!['initiated', 'ringing'].includes(call.status)) {
      return res.status(400).json({
        success: false,
        message: 'Call cannot be answered'
      });
    }

    // Update call status
    call.status = 'answered';
    call.answeredAt = new Date();
    await call.save();

    // Create notification for caller
    await Notification.createNotification({
      recipient: call.caller._id,
      sender: userId,
      type: 'call_answered',
      title: 'Call answered',
      message: `${req.user.name} answered your call`,
      data: {
        callId: call._id,
        callType: call.type
      }
    });

    res.json({
      success: true,
      call,
      message: 'Call answered'
    });

  } catch (error) {
    console.error('Answer call error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/calls/:id/reject
// @desc    Reject a call
// @access  Private
router.put('/:id/reject', authenticateToken, async (req, res) => {
  try {
    const callId = req.params.id;
    const userId = req.user._id;

    const call = await Call.findById(callId)
      .populate('caller', 'name avatar')
      .populate('receiver', 'name avatar');

    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Check if user is the receiver
    if (call.receiver._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reject this call'
      });
    }

    // Check if call can be rejected
    if (!['initiated', 'ringing'].includes(call.status)) {
      return res.status(400).json({
        success: false,
        message: 'Call cannot be rejected'
      });
    }

    // Update call status
    call.status = 'rejected';
    call.endedAt = new Date();
    await call.save();

    // Create notification for caller
    await Notification.createNotification({
      recipient: call.caller._id,
      sender: userId,
      type: 'call_rejected',
      title: 'Call rejected',
      message: `${req.user.name} rejected your call`,
      data: {
        callId: call._id,
        callType: call.type
      }
    });

    res.json({
      success: true,
      call,
      message: 'Call rejected'
    });

  } catch (error) {
    console.error('Reject call error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/calls/:id/end
// @desc    End a call
// @access  Private
router.put('/:id/end', authenticateToken, async (req, res) => {
  try {
    const callId = req.params.id;
    const userId = req.user._id;

    const call = await Call.findById(callId)
      .populate('caller', 'name avatar')
      .populate('receiver', 'name avatar');

    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Check if user is participant
    const isParticipant = [call.caller._id.toString(), call.receiver._id.toString()]
      .includes(userId.toString());

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to end this call'
      });
    }

    // Check if call can be ended
    if (call.status === 'ended' || call.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Call already ended'
      });
    }

    // Update call status
    const wasAnswered = call.status === 'answered';
    call.status = 'ended';
    call.endedAt = new Date();

    // Calculate duration if call was answered
    if (wasAnswered && call.answeredAt) {
      call.duration = Math.floor((call.endedAt - call.answeredAt) / 1000); // in seconds
    }

    await call.save();

    // Create notification for the other participant
    const otherParticipant = userId.toString() === call.caller._id.toString() 
      ? call.receiver._id 
      : call.caller._id;

    await Notification.createNotification({
      recipient: otherParticipant,
      sender: userId,
      type: 'call_ended',
      title: 'Call ended',
      message: `${req.user.name} ended the call`,
      data: {
        callId: call._id,
        callType: call.type,
        duration: call.duration
      }
    });

    res.json({
      success: true,
      call,
      message: 'Call ended'
    });

  } catch (error) {
    console.error('End call error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/calls/:id/missed
// @desc    Mark call as missed (when receiver doesn't answer within timeout)
// @access  Private
router.put('/:id/missed', authenticateToken, async (req, res) => {
  try {
    const callId = req.params.id;
    const userId = req.user._id;

    const call = await Call.findById(callId)
      .populate('caller', 'name avatar')
      .populate('receiver', 'name avatar');

    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Check if user is the caller (only caller can mark as missed)
    if (call.caller._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only caller can mark call as missed'
      });
    }

    // Check if call can be marked as missed
    if (!['initiated', 'ringing'].includes(call.status)) {
      return res.status(400).json({
        success: false,
        message: 'Call cannot be marked as missed'
      });
    }

    // Update call status
    call.status = 'missed';
    call.endedAt = new Date();
    await call.save();

    // Create missed call notification for receiver
    await Notification.createNotification({
      recipient: call.receiver._id,
      sender: call.caller._id,
      type: 'missed_call',
      title: 'Missed call',
      message: `You missed a ${call.type} call from ${call.caller.name}`,
      data: {
        callId: call._id,
        callType: call.type,
        callerName: call.caller.name,
        callerAvatar: call.caller.avatar,
        missedAt: call.endedAt
      }
    });

    res.json({
      success: true,
      call,
      message: 'Call marked as missed'
    });

  } catch (error) {
    console.error('Mark call as missed error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/calls/history
// @desc    Get call history for user
// @access  Private
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, type } = req.query;

    // Build query
    const query = {
      $or: [
        { caller: userId },
        { receiver: userId }
      ]
    };

    if (type && ['video', 'voice'].includes(type)) {
      query.type = type;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get call history
    const calls = await Call.find(query)
      .populate('caller', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort({ initiatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Call.countDocuments(query);

    res.json({
      success: true,
      calls,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get call history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/calls/active
// @desc    Get active calls for user
// @access  Private
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const activeCalls = await Call.find({
      $or: [
        { caller: userId },
        { receiver: userId }
      ],
      status: { $in: ['initiated', 'ringing', 'answered'] }
    })
      .populate('caller', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort({ initiatedAt: -1 });

    res.json({
      success: true,
      activeCalls
    });

  } catch (error) {
    console.error('Get active calls error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
