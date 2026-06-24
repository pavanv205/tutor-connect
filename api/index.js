import { createRequire } from 'module';
import mongoose from 'mongoose';

const require = createRequire(import.meta.url);
const app = require('../backend/server.js');

let dbConnectionPromise = null;

const connectDB = async () => {
  // If connection is already established and active, return it
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  
  if (dbConnectionPromise) {
    return dbConnectionPromise;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tutorconnect';
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  console.log(`[Vercel Serverless] Initiating MongoDB Connection to: ${maskedUri}`);

  dbConnectionPromise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,  // Fail fast on cold starts (5s instead of default 30s)
    socketTimeoutMS: 10000,          // Close sockets after 10s of inactivity
  }).then(async (m) => {
    console.log(`[Vercel Serverless] MongoDB Connected Successfully`);
    // Seed default admin account if none exists
    try {
      const User = require('../backend/models/User');
      const adminExists = await User.findOne({ role: 'Admin' });
      if (!adminExists) {
        await User.create({
          name: 'System Admin',
          email: 'admin@tutorconnect.com',
          password: 'adminpassword123',
          role: 'Admin'
        });
        console.log('ℹ️ Default Admin Account Seeded');
      }
    } catch (seedErr) {
      console.error('Admin seeding failed:', seedErr.message);
    }

    // Seed default tutor account if none exists
    try {
      const User = require('../backend/models/User');
      const Tutor = require('../backend/models/Tutor');
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

        console.log('ℹ️ Default Tutor Account Seeded');
      }
    } catch (seedErr) {
      console.error('Tutor seeding failed:', seedErr.message);
    }
    return m;
  }).catch((err) => {
    console.error('[Vercel Serverless] MongoDB Connection Failed:', err.message);
    dbConnectionPromise = null; // Reset promise so a retry can occur on next call
    throw err;
  });

  return dbConnectionPromise;
};

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection failed in serverless function:', err);
  }
  return app(req, res);
}
