const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, requireTeacher, requireStudent } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      user: user.profileData
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  authenticateToken,
  body('name').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Name must be between 1 and 50 characters'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('phone').optional().custom((value) => {
    if (value && !value.match(/^\d{10}$/)) {
      throw new Error('Please enter a valid 10-digit phone number');
    }
    return true;
  }),
  body('specializations').optional().isArray().withMessage('Specializations must be an array'),
  body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('hourlyRate').optional().isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),
  body('grade').optional().isString().withMessage('Grade must be a string'),
  body('subjects').optional().isArray().withMessage('Subjects must be an array'),
  body('education').optional().isString().withMessage('Education must be a string'),
  body('availability').optional().isString().withMessage('Availability must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user._id);
    
    // Update fields directly from request body
    const updateableFields = [
      'name', 'bio', 'phone', 'avatar', 
      'specializations', 'experience', 'education', 
      'hourlyRate', 'availability', 'grade', 'subjects'
    ];

    // Update only fields that are provided in the request
    updateableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Update profile completion status
    user.updateProfileCompletion();
    
    await user.save();

    console.log('Profile updated successfully for user:', user.email);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.profileData
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/teachers
// @desc    Search and filter teachers
// @access  Private (Students and Teachers can view)
router.get('/teachers', [
  authenticateToken,
  // Removed requireStudent so teachers can also view teacher list
  query('search').optional().isString(),
  query('subject').optional().isString(),
  query('minRating').optional().isFloat({ min: 0, max: 5 }),
  query('maxRate').optional().isFloat({ min: 0 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
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

    const {
      search,
      subject,
      minRating = 0,
      maxRate,
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    let query = {
      role: 'teacher',
      isActive: true,
      isProfileComplete: true
    };

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { specializations: { $regex: search, $options: 'i' } }
      ];
    }

    // Add subject filter
    if (subject) {
      query.specializations = { $in: [subject] };
    }

    // Add rating filter
    if (minRating > 0) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Add rate filter
    if (maxRate) {
      query.hourlyRate = { $lte: parseFloat(maxRate) };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const teachers = await User.find(query)
      .select('-password -email')
      .sort({ rating: -1, totalRatings: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      teachers: teachers.map(teacher => teacher.profileData),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });

  } catch (error) {
    console.error('Search teachers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/user/:id
// @desc    Get user profile by ID
// @access  Private
router.get('/user/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      isActive: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        ...user.profileData
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/teacher/:id
// @desc    Get teacher profile by ID
// @access  Private
router.get('/teacher/:id', authenticateToken, async (req, res) => {
  try {
    const teacher = await User.findOne({
      _id: req.params.id,
      role: 'teacher',
      isActive: true
    }).select('-password -email');

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    res.json({
      success: true,
      teacher: teacher.profileData
    });

  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/students
// @desc    Get students (for teachers)
// @access  Private (Teachers)
router.get('/students', [
  authenticateToken,
  requireTeacher
], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const students = await User.find({
      role: 'student',
      isActive: true
    })
      .select('-password -email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments({
      role: 'student',
      isActive: true
    });

    res.json({
      success: true,
      students: students.map(student => student.profileData),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });

  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/avatar
// @desc    Update user avatar
// @access  Private
router.put('/avatar', [
  authenticateToken,
  body('avatar').isURL().withMessage('Avatar must be a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid avatar URL',
        errors: errors.array()
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      avatar: req.body.avatar
    });

    res.json({
      success: true,
      message: 'Avatar updated successfully'
    });

  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/dashboard-stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    let stats = {};

    if (user.role === 'teacher') {
      // Teacher stats
      const Session = require('../models/Session');
      const Chat = require('../models/Chat');

      const totalSessions = await Session.countDocuments({ teacher: user._id });
      const completedSessions = await Session.countDocuments({ 
        teacher: user._id, 
        status: 'completed' 
      });
      const activeChats = await Chat.countDocuments({
        participants: user._id,
        isActive: true
      });

      stats = {
        totalSessions,
        completedSessions,
        activeChats,
        rating: user.rating,
        totalRatings: user.totalRatings,
        specializations: user.specializations.length
      };
    } else {
      // Student stats
      const Session = require('../models/Session');
      const Chat = require('../models/Chat');

      const totalSessions = await Session.countDocuments({ student: user._id });
      const completedSessions = await Session.countDocuments({ 
        student: user._id, 
        status: 'completed' 
      });
      const activeChats = await Chat.countDocuments({
        participants: user._id,
        isActive: true
      });

      stats = {
        totalSessions,
        completedSessions,
        activeChats,
        subjects: user.subjects.length,
        grade: user.grade
      };
    }

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/update-session-time
// @desc    Update user's learning/teaching hours after video call or chat session
// @access  Private
router.post('/update-session-time', authenticateToken, async (req, res) => {
  try {
    const { duration, sessionType, partnerId } = req.body;
    
    if (!duration || !sessionType) {
      return res.status(400).json({
        success: false,
        message: 'Duration and session type are required'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Convert duration from minutes to hours for consistency
    const durationHours = duration / 60;

    // Update hours based on user role
    if (user.role === 'student') {
      user.totalLearningHours = (user.totalLearningHours || 0) + durationHours;
      user.weeklyHours = (user.weeklyHours || 0) + durationHours;
      
      // Update subjects and sessions count
      if (!user.enrolledSubjects) user.enrolledSubjects = [];
      user.sessionsCompleted = (user.sessionsCompleted || 0) + 1;
      
    } else if (user.role === 'teacher') {
      user.totalTeachingHours = (user.totalTeachingHours || 0) + durationHours;
      user.weeklyHours = (user.weeklyHours || 0) + durationHours;
      
      // Track active students
      if (!user.activeStudents) user.activeStudents = [];
      if (partnerId && !user.activeStudents.includes(partnerId)) {
        user.activeStudents.push(partnerId);
      }
      
      user.sessionsCompleted = (user.sessionsCompleted || 0) + 1;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Session time updated successfully',
      user: {
        totalLearningHours: user.totalLearningHours,
        totalTeachingHours: user.totalTeachingHours,
        weeklyHours: user.weeklyHours,
        sessionsCompleted: user.sessionsCompleted
      }
    });

  } catch (error) {
    console.error('Update session time error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
