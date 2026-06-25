const User = require('../models/User');
const Tutor = require('../models/Tutor');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getFileUrl } = require('../utils/uploadHelper');

// Helper to log only in development mode
const devLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

const devError = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(...args);
  }
};

// Helper to generate JWT token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is missing.');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new tutor
// @route   POST /api/auth/register
// @access  Public
exports.registerTutor = async (req, res, next) => {
  devLog('--- [TUTOR REGISTRATION REQUEST RECEIVED] ---');
  let user = null;
  try {
    const data = req.body || {};
    const { name, email, password, phone, mobile } = data;

    // 1. Log Form Data Received (masking password)
    const logData = { ...data };
    if (logData.password) logData.password = '********';
    devLog('Form data received:', logData);

    // 2. Validate Missing Required Fields
    const requiredFields = [
      'name', 'email', 'password', 'gender', 'age', 'phone', 
      'state', 'city', 'streetAddress', 'pincode', 'degree', 
      'institution', 'passingYear', 'experienceYears', 'subjects', 
      'classes', 'teachingMode', 'hourlyRate', 'monthlyRate'
    ];
    
    const missing = [];
    requiredFields.forEach(field => {
      const val = data[field];
      if (val === undefined || val === null || val === '') {
        missing.push(field);
      }
    });

    if (missing.length > 0) {
      devLog('[VALIDATION WARNING] Missing required fields:', missing);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate password length
    if (password && password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate positive numbers
    const numAge = Number(data.age);
    if (isNaN(numAge) || numAge <= 0) {
      return res.status(400).json({ success: false, message: 'Age must be a valid positive number' });
    }

    const numPassingYear = Number(data.passingYear);
    if (isNaN(numPassingYear) || numPassingYear <= 1900 || numPassingYear > new Date().getFullYear() + 10) {
      return res.status(400).json({ success: false, message: 'Please provide a valid passing year' });
    }

    const numExp = Number(data.experienceYears);
    if (isNaN(numExp) || numExp < 0) {
      return res.status(400).json({ success: false, message: 'Experience years must be a non-negative number' });
    }

    const numHourly = Number(data.hourlyRate);
    const numMonthly = Number(data.monthlyRate);
    if (isNaN(numHourly) || numHourly < 0 || isNaN(numMonthly) || numMonthly < 0) {
      return res.status(400).json({ success: false, message: 'Rates must be valid non-negative numbers' });
    }

    // 3. Log Uploaded File Details
    if (req.files) {
      Object.keys(req.files).forEach(fieldName => {
        const file = req.files[fieldName][0];
        if (file) {
          devLog(`Uploaded file for field "${fieldName}":`, {
            filename: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            path: file.path // Cloudinary URL
          });
        }
      });
    }

    // 4. Check if user already exists
    let userExists;
    try {
      userExists = await User.findOne({ email });
    } catch (dbErr) {
      console.error(`[REGISTRATION DATABASE ERROR] Failed to query existing user | Method: ${req.method} | Path: ${req.originalUrl} | Email: ${email} | Error: ${dbErr.message}`);
      if (dbErr.stack) {
        console.error(dbErr.stack);
      }
      return res.status(500).json({
        success: false,
        message: `Database save failed: Failed to check user existence.`
      });
    }

    if (userExists) {
      devLog(`[REGISTRATION FAILED] Email already registered: ${email}`);
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // 5. Create User Document
    try {
      user = await User.create({
        name: name || data.fullName,
        email,
        password,
        role: 'Tutor'
      });
      devLog(`[DATABASE SAVE] Created User document, ID: ${user._id}`);
    } catch (userErr) {
      console.error(`[REGISTRATION USER ERROR] Failed to create User document | Method: ${req.method} | Path: ${req.originalUrl} | Email: ${email} | Error: ${userErr.message}`);
      if (userErr.stack) {
        console.error(userErr.stack);
      }
      return res.status(500).json({
        success: false,
        message: `Database save failed: User registration failed.`
      });
    }

    // 6. Extract Cloudinary File URLs
    let photoUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
    let certificateUrl = '';
    
    if (req.files && req.files['resume'] && req.files['resume'][0]) {
      photoUrl = getFileUrl(req.files['resume'][0]);
    }
    if (req.files && req.files['certificate'] && req.files['certificate'][0]) {
      certificateUrl = getFileUrl(req.files['certificate'][0]);
    }

    devLog('Cloudinary Upload Results:');
    devLog(`- Profile Photo (field "resume") URL: ${photoUrl}`);
    devLog(`- Certificate URL: ${certificateUrl}`);

    const parseIfJson = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
        try { return JSON.parse(val); } catch (e) { return [val]; }
      }
      return [val];
    };

    // 7. Create Tutor Profile Document
    let tutor;
    try {
      tutor = await Tutor.create({
        userId: user._id,
        fullName: name || data.fullName,
        mobile: phone || mobile || 'N/A',
        email: email,
        gender: data.gender,
        age: numAge,
        qualification: data.degree || data.qualification,
        university: data.institution || data.university,
        graduationYear: numPassingYear,
        experience: numExp,
        subjects: parseIfJson(data.subjects),
        classes: parseIfJson(data.classes),
        teachingMode: data.teachingMode || 'Both',
        hourlyRate: numHourly,
        monthlyRate: numMonthly,
        streetAddress: data.streetAddress,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        lat: data.lat ? Number(data.lat) : undefined,
        lng: data.lng ? Number(data.lng) : undefined,
        bio: data.bio,
        photo: photoUrl,
        resumeUrl: photoUrl,
        certificateUrl: certificateUrl
      });
      devLog(`[DATABASE SAVE] Created Tutor profile, ID: ${tutor._id}`);
    } catch (tutorErr) {
      console.error(`[REGISTRATION TUTOR ERROR] Failed to create Tutor profile | Method: ${req.method} | Path: ${req.originalUrl} | Email: ${email} | Error: ${tutorErr.message}`);
      if (tutorErr.stack) {
        console.error(tutorErr.stack);
      }
      
      // Rollback User creation to prevent orphan user documents
      if (user) {
        devLog(`[DATABASE ROLLBACK] Deleting User document due to Tutor profile creation failure, ID: ${user._id}`);
        await User.findByIdAndDelete(user._id);
      }
      
      return res.status(500).json({
        success: false,
        message: `Database save failed: Tutor profile creation failed.`
      });
    }

    // 8. Link Tutor profile back to User
    try {
      user.tutorProfile = tutor._id;
      await user.save();
      devLog(`[DATABASE UPDATE] Linked Tutor profile ${tutor._id} back to User ${user._id}`);
    } catch (linkErr) {
      console.error(`[REGISTRATION LINK ERROR] Failed to link Tutor profile to User | Method: ${req.method} | Path: ${req.originalUrl} | Email: ${email} | Error: ${linkErr.message}`);
      if (linkErr.stack) {
        console.error(linkErr.stack);
      }
      
      // Rollback both
      if (tutor) await Tutor.findByIdAndDelete(tutor._id);
      if (user) await User.findByIdAndDelete(user._id);
      
      return res.status(500).json({
        success: false,
        message: `Database save failed: Failed to complete profile association.`
      });
    }

    // 9. Generate token & Respond
    const token = generateToken(user._id);
    devLog('[REGISTRATION SUCCESS] Tutor registered successfully!');

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          tutorProfile: tutor._id
        }
      }
    });
  } catch (err) {
    console.error(`[REGISTRATION SYSTEM ERROR] Uncaught error in registerTutor | Method: ${req.method} | Path: ${req.originalUrl} | Error: ${err.message}`);
    if (err.stack) {
      console.error(err.stack);
    }
    next(err);
  }
};

// @desc    Login user (Admin or Tutor)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  let requestEmail = 'unknown';
  try {
    const { email, password } = req.body || {};
    requestEmail = email || 'unknown';

    console.log(`[LOGIN START] Login process initiated for email: ${requestEmail} | Method: ${req.method} | Path: ${req.originalUrl}`);

    // Diagnostic: Request body validation
    console.log(`[LOGIN DIAGNOSTIC] Request body validation. Method: ${req.method} | Path: ${req.originalUrl} | Body contains email: ${!!email}, password: ${!!password}`);

    // Validate email & password presence
    if (!email || !password) {
      console.log(`[LOGIN INFO] Login validation failed: Missing email or password for: ${requestEmail}`);
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      console.log(`[LOGIN INFO] Login validation failed: Invalid email format for: ${email}`);
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    // Diagnostic: User lookup
    console.log(`[LOGIN DIAGNOSTIC] User lookup started for email: ${email}. Method: ${req.method} | Path: ${req.originalUrl}`);
    const user = await User.findOne({ email }).select('+password');
    console.log(`[LOGIN DIAGNOSTIC] User lookup completed for email: ${email}. Found user: ${!!user}`);

    if (!user) {
      console.log(`[LOGIN INFO] User lookup failed: User not found for email: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Safety check to prevent crashes if user document doesn't have a password field
    if (!user.password) {
      console.error(`[AUTH ERROR] User document for ${email} is missing a password field in the database.`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Diagnostic: Password comparison
    console.log(`[LOGIN DIAGNOSTIC] Password comparison started for email: ${email}. Method: ${req.method} | Path: ${req.originalUrl}`);
    let isMatch = false;
    try {
      isMatch = await user.matchPassword(password);
    } catch (bcryptErr) {
      console.error(`[LOGIN ERROR] Password comparison failed | Method: ${req.method} | Path: ${req.originalUrl} | Email: ${email} | Error: ${bcryptErr.message}`);
      if (bcryptErr.stack) {
        console.error(bcryptErr.stack);
      }
      return res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
    }

    console.log(`[LOGIN DIAGNOSTIC] Password comparison completed for email: ${email}. Match: ${isMatch}`);

    if (!isMatch) {
      console.log(`[LOGIN INFO] Login failed: Password mismatch for email: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Safety check for JWT_SECRET before calling generateToken
    if (!process.env.JWT_SECRET) {
      console.error('[CRITICAL CONFIG ERROR] JWT_SECRET environment variable is missing on token generation request.');
      return res.status(500).json({ success: false, message: 'Internal server configuration error.' });
    }

    // Diagnostic: JWT generation
    console.log(`[LOGIN DIAGNOSTIC] JWT generation started for User ID: ${user._id}. Method: ${req.method} | Path: ${req.originalUrl}`);
    const token = generateToken(user._id);
    console.log(`[LOGIN DIAGNOSTIC] JWT generation completed for User ID: ${user._id}`);

    // Diagnostic: Response creation
    console.log(`[LOGIN DIAGNOSTIC] Response payload creation started. User ID: ${user._id} | Role: ${user.role}. Method: ${req.method} | Path: ${req.originalUrl}`);

    console.log(`[LOGIN SUCCESS] User successfully authenticated: ${email}`);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          tutorProfile: user.tutorProfile
        }
      }
    });
  } catch (err) {
    // Explicitly log the real error message and stack trace to server stdout/stderr
    console.error(`[LOGIN SYSTEM ERROR] Uncaught exception in login controller | Method: ${req.method} | Path: ${req.originalUrl} | Email: ${requestEmail} | Error: ${err.message}`);
    if (err.stack) {
      console.error(err.stack);
    }
    next(err);
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('tutorProfile').lean();
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(`[ME SYSTEM ERROR] Uncaught error in getMe | Method: ${req.method} | Path: ${req.originalUrl} | User ID: ${req.user?._id} | Error: ${err.message}`);
    if (err.stack) {
      console.error(err.stack);
    }
    next(err);
  }
};
