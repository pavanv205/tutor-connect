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
      devError('[DATABASE ERROR] Failed to query existing user:', dbErr);
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
      devError('[DATABASE ERROR] Failed to create User document:', userErr);
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
      devError('[DATABASE ERROR] Failed to create Tutor profile:', tutorErr);
      
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
      devError('[DATABASE ERROR] Failed to link Tutor profile to User:', linkErr);
      
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
    devError('[API SYSTEM ERROR] Uncaught error in registerTutor:', err);
    next(err);
  }
};

// @desc    Login user (Admin or Tutor)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password presence
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Safety check to prevent crashes if user document doesn't have a password field
    if (!user.password) {
      console.error(`[AUTH ERROR] User document for ${email} is missing a password field in the database.`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches (wrapped in try-catch to prevent bcrypt crashes)
    let isMatch = false;
    try {
      isMatch = await user.matchPassword(password);
    } catch (bcryptErr) {
      console.error('[AUTH ERROR] Password comparison failed:', bcryptErr.message);
      return res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Safety check for JWT_SECRET before calling generateToken
    if (!process.env.JWT_SECRET) {
      console.error('[CRITICAL CONFIG ERROR] JWT_SECRET environment variable is missing on token generation request.');
      return res.status(500).json({ success: false, message: 'Internal server configuration error.' });
    }

    // Generate token
    const token = generateToken(user._id);

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
    // Explicitly log the real error message to server stdout/stderr so it shows in Vercel logs
    console.error('[LOGIN SYSTEM ERROR] Uncaught exception in login controller:', err);
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
    next(err);
  }
};
