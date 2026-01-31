const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Mathematics',
      'Science',
      'Languages',
      'Social Studies',
      'Arts',
      'Computer Science',
      'Business',
      'Test Preparation',
      'Other'
    ]
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  icon: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  teachersCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for text search
subjectSchema.index({ name: 'text', description: 'text' });

// Method to update teachers count
subjectSchema.methods.updateTeachersCount = async function() {
  const User = require('./User');
  const count = await User.countDocuments({
    role: 'teacher',
    specializations: this.name,
    isActive: true
  });
  
  this.teachersCount = count;
  return this.save();
};

module.exports = mongoose.model('Subject', subjectSchema);
