const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Tutor = require('./models/Tutor');

const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tutorconnect';
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  console.log(`Connecting to MongoDB for seeding: ${maskedUri}`);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB connection established.');

    // 1. Seed Admin Account
    const adminExists = await User.findOne({ role: 'Admin' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@tutorconnect.com',
        password: 'adminpassword123',
        role: 'Admin'
      });
      console.log('ℹ️ Default Admin Account Seeded:');
      console.log('   Email: admin@tutorconnect.com');
      console.log('   Password: adminpassword123');
      console.log('=========================================');
    } else {
      console.log('Admin account already exists. Skipping...');
    }

    // 2. Seed Tutor Account
    const tutorExists = await User.findOne({ email: 'tutor@tutorconnect.com' });
    if (!tutorExists) {
      const user = await User.create({
        name: 'Default Tutor',
        email: 'tutor@tutorconnect.com',
        password: 'tutor123',
        role: 'Tutor'
      });

      const tutor = await Tutor.create({
        userId: user._id,
        fullName: 'Default Tutor',
        mobile: '9876543210',
        email: 'tutor@tutorconnect.com',
        gender: 'Male',
        age: 30,
        qualification: 'M.Sc. Physics',
        university: 'Stanford University',
        graduationYear: 2018,
        experience: 5,
        subjects: ['Mathematics', 'Physics'],
        classes: ['Class 9-10', 'Class 11-12'],
        teachingMode: 'Both',
        hourlyRate: 50,
        monthlyRate: 8000,
        streetAddress: 'Madhapur',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
        lat: 17.4483,
        lng: 78.3741,
        bio: 'Passionate mathematics and physics tutor with 5+ years of experience helping students achieve academic excellence.',
        photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
        resumeUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
        isVerified: true
      });

      user.tutorProfile = tutor._id;
      await user.save();

      console.log('ℹ️ Default Tutor Account Seeded:');
      console.log('   Email: tutor@tutorconnect.com');
      console.log('   Password: tutor123');
      console.log('=========================================');
    } else {
      console.log('Tutor account already exists. Skipping...');
    }

    console.log('Database seeding process completed.');
  } catch (error) {
    console.error('Seeding error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

seedDatabase();
