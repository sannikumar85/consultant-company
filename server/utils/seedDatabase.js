const User = require('../models/User');
const Subject = require('../models/Subject');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Check if already seeded
    const existingStudent = await User.findOne({ email: 'student@demo.com' });
    const existingTeacher = await User.findOne({ email: 'teacher@demo.com' });
    
    if (existingStudent && existingTeacher) {
      console.log('✅ Database already seeded with demo accounts');
      console.log('📧 Demo Accounts:');
      console.log('   Student: student@demo.com | password');
      console.log('   Teacher: teacher@demo.com | password');
      return;
    }

    // Remove existing demo users to ensure clean slate
    if (existingStudent) await User.deleteOne({ email: 'student@demo.com' });
    if (existingTeacher) await User.deleteOne({ email: 'teacher@demo.com' });
    console.log('🗑️ Cleaned up existing demo users');

    // Create fresh demo student
    const demoStudent = new User({
      name: 'Demo Student',
      email: 'student@demo.com',
      password: 'password',
      role: 'student',
      grade: '10th Grade',
      subjects: ['Mathematics', 'Physics', 'Chemistry'],
      isProfileComplete: true,
      isEmailVerified: true
    });
    await demoStudent.save();
    console.log('✅ Demo student created: student@demo.com');

    // Create fresh demo teacher
    const demoTeacher = new User({
      name: 'Demo Teacher',
      email: 'teacher@demo.com',
      password: 'password',
      role: 'teacher',
      bio: 'Experienced mathematics and science teacher with 5+ years of teaching experience.',
      specializations: ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
      experience: 5,
      hourlyRate: 25,
      education: 'M.Sc. Mathematics from University of Science (2018)',
      availability: 'Monday-Friday: 9:00 AM - 5:00 PM',
      rating: 4.8,
      totalRatings: 25,
      isProfileComplete: true,
      isEmailVerified: true
    });
    await demoTeacher.save();
    console.log('✅ Demo teacher created: teacher@demo.com');

    // Seed subjects
    const subjects = [
      { name: 'Mathematics', category: 'Mathematics' },
      { name: 'Physics', category: 'Science' },
      { name: 'Chemistry', category: 'Science' },
      { name: 'Biology', category: 'Science' },
      { name: 'English', category: 'Languages' },
      { name: 'History', category: 'Social Studies' },
      { name: 'Geography', category: 'Social Studies' },
      { name: 'Computer Science', category: 'Computer Science' },
      { name: 'Economics', category: 'Business' },
      { name: 'Psychology', category: 'Social Studies' }
    ];

    for (const subject of subjects) {
      const existingSubject = await Subject.findOne({ name: subject.name });
      if (!existingSubject) {
        await Subject.create({
          name: subject.name,
          description: `Learn ${subject.name} with expert tutors`,
          category: subject.category
        });
        console.log(`✅ Subject created: ${subject.name}`);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('📧 Demo Accounts:');
    console.log('   Student: student@demo.com | password');
    console.log('   Teacher: teacher@demo.com | password');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  }
};

module.exports = seedDatabase;
