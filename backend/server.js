const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Mongoose to disable command buffering (fast fail when offline)
mongoose.set('bufferCommands', false);

// Prevent uncaught exception crash on connection errors
mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection background error:', err.message);
});

// Connect to MongoDB with graceful fallback
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tutorconnect', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('=========================================');
  console.log('✅ Connected to MongoDB successfully.');
  console.log('=========================================');
  
  // Seed default admin account if none exists
  try {
    const User = require('./models/User');
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
    }
  } catch (seedErr) {
    console.error('Admin seeding failed:', seedErr.message);
  }
}).catch((err) => {
  console.log('\n=========================================');
  console.log('⚠️  WARNING: Could not connect to MongoDB.');
  console.log('   The API server will continue running in OFFLINE mode.');
  console.log('   Please ensure MongoDB is running locally on port 27017');
  console.log('   OR configure MONGODB_URI in your backend/.env file.');
  console.log('   (e.g., MONGODB_URI=mongodb+srv://...)');
  console.log('=========================================\n');
});

// Routes
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tutorRoutes = require('./routes/tutorRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tutors', tutorRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
