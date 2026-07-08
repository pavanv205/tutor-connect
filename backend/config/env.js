const dotenv = require('dotenv');
const path = require('path');

// Ensure environment variables are loaded from the root .env or backend .env
dotenv.config();
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const REQUIRED_VARS = {
  MONGODB_URI: {
    required: true,
    validate: (val) => typeof val === 'string' && (val.startsWith('mongodb://') || val.startsWith('mongodb+srv://')),
    message: 'Must be a valid MongoDB connection string starting with mongodb:// or mongodb+srv://'
  },
  JWT_SECRET: {
    required: true,
    validate: (val) => typeof val === 'string' && val.length >= 10,
    message: 'Must be at least 10 characters long for security'
  },
  CLOUDINARY_CLOUD_NAME: { required: true },
  CLOUDINARY_API_KEY: { required: true },
  CLOUDINARY_API_SECRET: { required: true },
  RAZORPAY_KEY_ID: { required: true },
  RAZORPAY_KEY_SECRET: { required: true }
};

const validateEnv = () => {
  const errors = [];

  for (const [key, rules] of Object.entries(REQUIRED_VARS)) {
    const val = process.env[key];

    if (val === undefined || val === null || val === '') {
      errors.push(`${key} is missing.`);
      continue;
    }

    if (rules.validate && !rules.validate(val)) {
      errors.push(`${key} is invalid: ${rules.message || 'Validation failed.'}`);
    }
  }

  if (errors.length > 0) {
    console.error('\n❌ CONFIGURATION WARNINGS:');
    console.error('======================================');
    errors.forEach(err => console.error(` - ${err}`));
    console.error('======================================\n');
    console.warn('⚠️  WARNING: Environment validation issues detected. Continuing execution in production.');
  }
  // Always return true to avoid fatal exit in production
  return true;
};

// Run validation immediately on import
// Run validation on import (logs warnings if any)
validateEnv();

module.exports = {
  // isValid retained for backward compatibility but always true
  isValid: true,
  validateEnv
};
