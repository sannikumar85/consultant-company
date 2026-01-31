const express = require('express');
const { body, validationResult } = require('express-validator');
const Subject = require('../models/Subject');
const { authenticateToken, requireTeacher } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/subjects
// @desc    Get all subjects
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const subjects = await Subject.find(query)
      .sort({ name: 1 })
      .select('name category description icon teachersCount');
    
    res.json({
      success: true,
      subjects
    });
    
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/subjects/categories
// @desc    Get all subject categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Subject.distinct('category', { isActive: true });
    
    res.json({
      success: true,
      categories
    });
    
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/subjects
// @desc    Create a new subject (Admin only - simplified for demo)
// @access  Private
router.post('/', [
  authenticateToken,
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Subject name is required'),
  body('category').isIn([
    'Mathematics', 'Science', 'Languages', 'Social Studies', 
    'Arts', 'Computer Science', 'Business', 'Test Preparation', 'Other'
  ]).withMessage('Invalid category'),
  body('description').optional().isLength({ max: 500 })
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

    const { name, category, description, icon } = req.body;

    // Check if subject already exists
    const existingSubject = await Subject.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject already exists'
      });
    }

    const subject = new Subject({
      name,
      category,
      description,
      icon
    });

    await subject.save();

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      subject
    });

  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/subjects/:id
// @desc    Update a subject (Admin only - simplified for demo)
// @access  Private
router.put('/:id', [
  authenticateToken,
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('category').optional().isIn([
    'Mathematics', 'Science', 'Languages', 'Social Studies', 
    'Arts', 'Computer Science', 'Business', 'Test Preparation', 'Other'
  ]),
  body('description').optional().isLength({ max: 500 })
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

    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const allowedFields = ['name', 'category', 'description', 'icon', 'isActive'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        subject[field] = req.body[field];
      }
    });

    await subject.save();

    res.json({
      success: true,
      message: 'Subject updated successfully',
      subject
    });

  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/subjects/popular
// @desc    Get most popular subjects (by teacher count)
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const subjects = await Subject.find({ isActive: true })
      .sort({ teachersCount: -1 })
      .limit(limit)
      .select('name category teachersCount icon');
    
    res.json({
      success: true,
      subjects
    });
    
  } catch (error) {
    console.error('Get popular subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/subjects/seed
// @desc    Seed initial subjects (Development only)
// @access  Private
router.post('/seed', authenticateToken, async (req, res) => {
  try {
    // Check if subjects already exist
    const existingCount = await Subject.countDocuments();
    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Subjects already seeded'
      });
    }

    const initialSubjects = [
      // Mathematics
      { name: 'Algebra', category: 'Mathematics', description: 'Linear equations, quadratic equations, and algebraic expressions' },
      { name: 'Calculus', category: 'Mathematics', description: 'Differential and integral calculus' },
      { name: 'Geometry', category: 'Mathematics', description: 'Shapes, angles, and geometric proofs' },
      { name: 'Statistics', category: 'Mathematics', description: 'Data analysis, probability, and statistical methods' },
      
      // Science
      { name: 'Physics', category: 'Science', description: 'Mechanics, thermodynamics, and electromagnetism' },
      { name: 'Chemistry', category: 'Science', description: 'Organic, inorganic, and physical chemistry' },
      { name: 'Biology', category: 'Science', description: 'Cell biology, genetics, and ecology' },
      
      // Languages
      { name: 'English', category: 'Languages', description: 'Grammar, literature, and writing skills' },
      { name: 'Spanish', category: 'Languages', description: 'Spanish language learning and conversation' },
      { name: 'French', category: 'Languages', description: 'French language learning and conversation' },
      
      // Computer Science
      { name: 'Programming', category: 'Computer Science', description: 'Various programming languages and concepts' },
      { name: 'Web Development', category: 'Computer Science', description: 'HTML, CSS, JavaScript, and frameworks' },
      { name: 'Data Structures', category: 'Computer Science', description: 'Arrays, trees, graphs, and algorithms' },
      
      // Test Preparation
      { name: 'SAT Prep', category: 'Test Preparation', description: 'SAT test preparation and strategies' },
      { name: 'ACT Prep', category: 'Test Preparation', description: 'ACT test preparation and strategies' },
      
      // Others
      { name: 'History', category: 'Social Studies', description: 'World history and historical analysis' },
      { name: 'Art', category: 'Arts', description: 'Drawing, painting, and art theory' },
      { name: 'Music', category: 'Arts', description: 'Music theory and instrument instruction' }
    ];

    await Subject.insertMany(initialSubjects);

    res.json({
      success: true,
      message: `${initialSubjects.length} subjects seeded successfully`
    });

  } catch (error) {
    console.error('Seed subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
