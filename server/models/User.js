const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  
  // User Type
  role: {
    type: String,
    enum: ['student', 'teacher'],
    required: [true, 'Role is required']
  },
  
  // Profile Information
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    default: ''
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        // Only validate if phone is provided and not empty
        if (!v || v === '') return true;
        return /^\d{10}$/.test(v);
      },
      message: 'Please enter a valid 10-digit phone number'
    }
  },
  
  // Teacher-specific fields
  specializations: [{
    type: String,
    trim: true
  }],
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative'],
    default: 0
  },
  education: {
    type: String,
    default: ''
  },
  hourlyRate: {
    type: Number,
    min: [0, 'Rate cannot be negative'],
    default: 0
  },
  availability: {
    type: String,
    default: ''
  },
  
  // Student-specific fields
  grade: {
    type: String,
    default: ''
  },
  subjects: [{
    type: String,
    trim: true
  }],
  enrolledSubjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  totalLearningHours: {
    type: Number,
    default: 0
  },
  
  // Teacher-specific tracking
  totalTeachingHours: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  activeStudents: {
    type: Number,
    default: 0
  },
  weeklyHours: {
    type: Number,
    default: 0
  },
  
  // Common fields
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  
  // Profile completion
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for text search
userSchema.index({ 
  name: 'text', 
  specializations: 'text', 
  bio: 'text' 
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update profile completion status
userSchema.methods.updateProfileCompletion = function() {
  if (this.role === 'teacher') {
    this.isProfileComplete = !!(
      this.name && 
      this.email && 
      this.bio && 
      this.specializations.length > 0 && 
      this.experience >= 0 && 
      this.hourlyRate > 0
    );
  } else {
    this.isProfileComplete = !!(
      this.name && 
      this.email && 
      this.grade && 
      this.subjects.length > 0
    );
  }
};

// Method to calculate average rating
userSchema.methods.updateRating = function(newRating) {
  this.rating = ((this.rating * this.totalRatings) + newRating) / (this.totalRatings + 1);
  this.totalRatings += 1;
};

// Virtual for getting user's full profile
userSchema.virtual('profileData').get(function() {
  const baseProfile = {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    bio: this.bio,
    phone: this.phone,
    rating: this.rating,
    totalRatings: this.totalRatings,
    isProfileComplete: this.isProfileComplete,
    createdAt: this.createdAt
  };

  if (this.role === 'teacher') {
    return {
      ...baseProfile,
      specializations: this.specializations,
      experience: this.experience,
      education: this.education,
      hourlyRate: this.hourlyRate,
      availability: this.availability
    };
  } else {
    return {
      ...baseProfile,
      grade: this.grade,
      subjects: this.subjects
    };
  }
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
