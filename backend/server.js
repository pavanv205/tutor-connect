// Trigger Vercel rebuild to apply new environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Environment Variable Validation ────────────────────────────────────────
const requiredVars = ['MONGODB_URI'];
const recommendedVars = ['JWT_SECRET'];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.warn(`⚠️  WARNING: Required environment variable ${varName} is not set.`);
  }
});

recommendedVars.forEach(varName => {
  if (!process.env[varName]) {
    console.warn(`⚠️  WARNING: Recommended environment variable ${varName} is not set. Using insecure default.`);
  }
});

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── MongoDB Connection ─────────────────────────────────────────────────────
// Disable command buffering so operations fail fast when offline
mongoose.set('bufferCommands', false);

// Prevent uncaught exception crash on connection errors
mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection background error:', err.message);
});

// Cached connection promise for serverless environments (avoid re-connecting on every invocation)
let dbConnectionPromise = null;

const connectDB = () => {
  if (dbConnectionPromise) return dbConnectionPromise;

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tutorconnect';

  dbConnectionPromise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,  // Fail fast on cold starts (5s instead of default 30s)
    socketTimeoutMS: 10000,          // Close sockets after 10s of inactivity
  }).then(async () => {
    console.log('MongoDB Connected Successfully');
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
    console.log('MongoDB Connection Failed');
    console.error(err.message);
    process.exit(1);
  });

  return dbConnectionPromise;
};

// Initiate connection on startup
connectDB();

// ─── Health Check Endpoint ──────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
    
    res.status(200).json({
      status: 'ok',
      database: dbStatus
    });
  } catch (err) {
    console.error('[API ERROR] Health check error:', err);
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: err.message
    });
  }
});

// ─── Routes ─────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const studentRequestRoutes = require('./routes/studentRequestRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/student-requests', studentRequestRoutes);

// ─── Global Error Handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const isAuthError = err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' || err.status === 401 || err.status === 403;
  const isDatabaseError = err.name === 'ValidationError' || err.code === 11000 || err.name.includes('Mongo') || err.message.includes('Mongoose') || err.message.includes('Mongo');

  if (isAuthError) {
    console.error(`[AUTH ERROR] ${req.method} ${req.originalUrl} - Status: ${err.status || 401} - Message: ${err.message}`);
  } else if (isDatabaseError) {
    console.error(`[DATABASE ERROR] ${req.method} ${req.originalUrl} - Message: ${err.message}`);
  } else {
    console.error(`[API SYSTEM ERROR] ${req.method} ${req.originalUrl} - Status: ${err.status || 500} - Message: ${err.message}`);
  }
  console.error('Stack:', err.stack);

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', ')
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// ─── Start Server (only when not running on Vercel) ─────────────────────────
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}

// Export app for Vercel serverless functions
module.exports = app;
