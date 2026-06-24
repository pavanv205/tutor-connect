// Trigger Vercel rebuild to apply new environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorMiddleware');

dotenv.config();
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable trust proxy so express-rate-limit can see the actual client IP behind Vercel reverse proxy
app.set('trust proxy', 1);

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

// ─── Rate Limiter Configuration ─────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(apiLimiter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── MongoDB Connection ─────────────────────────────────────────────────────
// Disable command buffering so operations fail fast when offline
mongoose.set('bufferCommands', false);

// Prevent uncaught exception crash on connection errors
mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection background error:', err.message);
});

// Database connection logic moved to serverless handler api/index.js and local startup block

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
app.use(errorHandler);

// ─── Start Server (only when executed directly, not on import) ─────────────────────────
if (require.main === module) {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tutorconnect';
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  console.log(`[Local Startup] Connecting to MongoDB: ${maskedUri}`);

  mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
  }).then(() => {
    console.log('MongoDB Connected Successfully (Local)');
    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  }).catch((err) => {
    console.error('Local startup connection failed. Server not started:', err.message);
  });
}

// Export app for serverless function
module.exports = app;
