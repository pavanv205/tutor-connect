const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorMiddleware');

// Validate environment variables upfront on startup
require('./config/env');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable trust proxy so express-rate-limit can see the actual client IP behind Vercel reverse proxy
app.set('trust proxy', 1);


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
app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin === 'http://localhost' ||
      origin === 'capacitor://localhost' ||
      /https?:\/\/.*\.vercel\.app$/.test(origin) ||
      /https?:\/\/.*\.hometutorx\.in$/.test(origin) ||
      origin === 'https://hometutorx.in'
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/api', apiLimiter);
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
    
    // Safely check required variables without leaking sensitive values
    const criticalVars = ['MONGODB_URI', 'JWT_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    const missingVars = criticalVars.filter(key => !process.env[key] || process.env[key].trim() === '');

    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        database: dbStatus,
        configStatus: missingVars.length === 0 ? 'valid' : `Missing: ${missingVars.join(', ')}`
      }
    });
  } catch (err) {
    console.error('[API ERROR] Health check error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// ─── Routes ─────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const studentRequestRoutes = require('./routes/studentRequestRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/student-requests', studentRequestRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

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
    console.error('Local startup connection failed. Starting server in Fallback mode:', err.message);
    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT} (Fallback Mode)`);
    });
  });
}

// Export app for serverless function
module.exports = app;
