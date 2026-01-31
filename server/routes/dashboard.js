const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Session = require('../models/Session');
const Call = require('../models/Call');
const Chat = require('../models/Chat');
const { authenticateToken } = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'student') {
      // Get total available teachers
      const totalTeachers = await User.countDocuments({ role: 'teacher', isActive: true });
      
      // Get user's learning statistics
      const user = await User.findById(userId)
        .populate('enrolledSubjects')
        .populate('sessions');
      
      // Calculate total learning hours from sessions
      const sessions = await Session.find({ 
        student: userId,
        status: 'completed'
      });
      
      const totalLearningHours = sessions.reduce((total, session) => {
        return total + (session.duration || 0);
      }, 0);

      // Get average rating given to student by teachers
      const ratingSessions = await Session.find({ 
        student: userId,
        teacherRating: { $exists: true }
      });
      
      const averageRating = ratingSessions.length > 0 
        ? ratingSessions.reduce((sum, session) => sum + session.teacherRating, 0) / ratingSessions.length 
        : 0;

      stats = {
        totalTeachers,
        totalLearningHours: Math.round(totalLearningHours / 60), // Convert minutes to hours
        enrolledSubjects: user.enrolledSubjects?.length || 0,
        averageRating: Math.round(averageRating * 10) / 10,
        weeklyProgress: await getWeeklyProgress(userId, 'student')
      };

    } else if (userRole === 'teacher') {
      // Get teacher's teaching statistics
      const user = await User.findById(userId);
      
      // Get active students count
      const activeStudents = await Session.distinct('student', { 
        teacher: userId,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      });

      // Calculate total teaching hours
      const sessions = await Session.find({ 
        teacher: userId,
        status: 'completed'
      });
      
      const totalTeachingHours = sessions.reduce((total, session) => {
        return total + (session.duration || 0);
      }, 0);

      // Get this week's teaching hours
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekSessions = await Session.find({ 
        teacher: userId,
        status: 'completed',
        createdAt: { $gte: weekStart }
      });
      
      const weeklyHours = weekSessions.reduce((total, session) => {
        return total + (session.duration || 0);
      }, 0);

      // Calculate total earnings
      const totalEarnings = sessions.reduce((total, session) => {
        return total + (session.amount || 0);
      }, 0);

      // Get average rating from students
      const ratingSessions = await Session.find({ 
        teacher: userId,
        studentRating: { $exists: true }
      });
      
      const averageRating = ratingSessions.length > 0 
        ? ratingSessions.reduce((sum, session) => sum + session.studentRating, 0) / ratingSessions.length 
        : 0;

      stats = {
        activeStudents: activeStudents.length,
        totalTeachingHours: Math.round(totalTeachingHours / 60), // Convert minutes to hours
        weeklyHours: Math.round(weeklyHours / 60),
        totalEarnings: Math.round(totalEarnings),
        averageRating: Math.round(averageRating * 10) / 10,
        monthlyProgress: await getMonthlyProgress(userId, 'teacher')
      };
    }

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard statistics',
      error: error.message 
    });
  }
});

// Get user activity over time
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { period = '7d' } = req.query;

    let startDate = new Date();
    
    switch(period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const activity = {};

    if (userRole === 'student') {
      // Get learning sessions
      activity.sessions = await Session.find({
        student: userId,
        createdAt: { $gte: startDate }
      }).populate('teacher', 'name');
      
      // Get chat activity
      activity.chats = await Chat.find({
        participants: userId,
        createdAt: { $gte: startDate }
      }).countDocuments();

    } else if (userRole === 'teacher') {
      // Get teaching sessions
      activity.sessions = await Session.find({
        teacher: userId,
        createdAt: { $gte: startDate }
      }).populate('student', 'name');
      
      // Get chat activity
      activity.chats = await Chat.find({
        participants: userId,
        createdAt: { $gte: startDate }
      }).countDocuments();
    }

    res.json(activity);
  } catch (error) {
    console.error('Activity fetch error:', error);
    res.status(500).json({ 
      message: 'Error fetching activity data',
      error: error.message 
    });
  }
});

// Helper function to get weekly progress for students
async function getWeeklyProgress(userId, role) {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  if (role === 'student') {
    const weekSessions = await Session.countDocuments({
      student: userId,
      createdAt: { $gte: weekStart }
    });
    return weekSessions;
  }
  
  return 0;
}

// Helper function to get monthly progress for teachers
async function getMonthlyProgress(userId, role) {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  if (role === 'teacher') {
    const monthStudents = await Session.distinct('student', {
      teacher: userId,
      createdAt: { $gte: monthStart }
    });
    return monthStudents.length;
  }
  
  return 0;
}

// Get teachers for student dashboard (limited/filtered results)
router.get('/teachers', authenticateToken, async (req, res) => {
  try {
    const {
      search,
      subject,
      minRating = 0,
      maxRate,
      page = 1,
      limit = 12 // Increase limit to show more teachers
    } = req.query;

    // Build query for dashboard - show all active teachers
    let query = {
      role: 'teacher',
      isActive: true,
      isProfileComplete: true
      // Remove rating filter to show all teachers initially
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

    // Add rating filter only if specified
    if (minRating > 0) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Add rate filter
    if (maxRate) {
      query.hourlyRate = { $lte: parseFloat(maxRate) };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query - show all teachers, sort by rating
    const teachers = await User.find(query)
      .select('-password -email')
      .sort({ rating: -1, totalRatings: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      teachers: teachers.map(teacher => ({
        ...teacher.toObject(),
        _id: teacher._id,
        name: teacher.name,
        bio: teacher.bio,
        specializations: teacher.specializations,
        hourlyRate: teacher.hourlyRate,
        rating: teacher.rating,
        totalRatings: teacher.totalRatings,
        experience: teacher.experience,
        avatar: teacher.avatar
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });

  } catch (error) {
    console.error('Dashboard teachers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;