// backend/api/index.cjs
require('../config/env'); // Load environment variables
const mongoose = require('mongoose');
const app = require('../server'); // Express app instance

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('[API START] Missing MONGODB_URI');
  // Export minimal handler returning config error
  module.exports = (req, res) =>
    res.status(500).json({ success: false, message: 'Configuration error: MONGODB_URI missing' });
  return;
}

// Connect to MongoDB (Vercel will reuse this across invocations)
mongoose
  .connect(uri, { serverSelectionTimeoutMS: 5000, socketTimeoutMS: 10000 })
  .then(() => console.log('[API START] MongoDB connected'))
  .catch(err => {
    console.error('[API START] MongoDB connection failed:', err.message);
  });

// Export the Express app as the handler for Vercel
module.exports = app;
