import { createRequire } from 'module';
import mongoose from 'mongoose';

const require = createRequire(import.meta.url);
const app = require('../backend/server.js');

// Standard Vercel/Serverless MongoDB connection caching pattern using global object
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tutorconnect';
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');

  if (cached.conn) {
    console.log(`[MongoDB Cache] Reusing existing active connection to: ${maskedUri}`);
    return cached.conn;
  }

  if (!cached.promise) {
    console.log(`[MongoDB Connection] Initiating new connection handshake to: ${maskedUri}`);
    const opts = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log(`[MongoDB Connection] Connected successfully to: ${maskedUri}`);
      return mongooseInstance;
    }).catch((err) => {
      console.error(`[MongoDB Connection Error] Failed to connect: ${err.message}`);
      cached.promise = null; // Clear cached promise on failure to allow retry
      throw err;
    });
  } else {
    console.log('[MongoDB Cache] Awaiting existing in-progress connection promise...');
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel Serverless Function] MongoDB initialization failed:', err);
  }
  return app(req, res);
}
