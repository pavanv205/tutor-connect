const User = require('../models/User');
const Tutor = require('../models/Tutor');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getFileUrl } = require('../utils/uploadHelper');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'tutorconnect_secret_key_123', {
    expiresIn: '30d'
  });
};

// @desc    Register a new tutor
// @route   POST /api/auth/register
// @access  Public
exports.registerTutor = async (req, res, next) => {
  console.log('--- [TUTOR REGISTRATION REQUEST RECEIVED] ---');
  let user = null;
  try {
    const data = req.body || {};
    const { name, email, password, phone, mobile } = data;

    // 1. Log Form Data Received (masking password)
    const logData = { ...data };
    if (logData.password) logData.password = '********';
    console.log('Form data received:', logData);

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
      console.warn('[VALIDATION WARNING] Missing required fields:', missing);
      console.log('API response status: 400 Bad Request');
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`
      });
    }

    // 3. Log Uploaded File Details
    if (req.files) {
      Object.keys(req.files).forEach(fieldName => {
        const file = req.files[fieldName][0];
        if (file) {
          console.log(`Uploaded file for field "${fieldName}":`, {
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
      console.error('[DATABASE ERROR] Failed to query existing user:', dbErr);
      console.log('API response status: 500 Internal Server Error');
      return res.status(500).json({
        success: false,
        message: `Database save failed: Failed to check user existence. ${dbErr.message}`
      });
    }

    if (userExists) {
      console.warn(`[REGISTRATION FAILED] Email already registered: ${email}`);
      console.log('API response status: 400 Bad Request');
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
      console.log(`[DATABASE SAVE] Created User document, ID: ${user._id}`);
    } catch (userErr) {
      console.error('[DATABASE ERROR] Failed to create User document:', userErr);
      console.log('API response status: 500 Internal Server Error');
      return res.status(500).json({
        success: false,
        message: `Database save failed: User registration failed. ${userErr.message}`
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

    console.log('Cloudinary Upload Results:');
    console.log(`- Profile Photo (field "resume") URL: ${photoUrl}`);
    console.log(`- Certificate URL: ${certificateUrl}`);

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
        age: data.age ? Number(data.age) : undefined,
        qualification: data.degree || data.qualification,
        university: data.institution || data.university,
        graduationYear: data.passingYear ? Number(data.passingYear) : undefined,
        experience: data.experienceYears ? Number(data.experienceYears) : undefined,
        subjects: parseIfJson(data.subjects),
        classes: parseIfJson(data.classes),
        teachingMode: data.teachingMode || 'Both',
        hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : undefined,
        monthlyRate: data.monthlyRate ? Number(data.monthlyRate) : undefined,
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
      console.log(`[DATABASE SAVE] Created Tutor profile, ID: ${tutor._id}`);
    } catch (tutorErr) {
      console.error('[DATABASE ERROR] Failed to create Tutor profile:', tutorErr);
      
      // Rollback User creation to prevent orphan user documents
      if (user) {
        console.log(`[DATABASE ROLLBACK] Deleting User document due to Tutor profile creation failure, ID: ${user._id}`);
        await User.findByIdAndDelete(user._id);
      }
      
      console.log('API response status: 500 Internal Server Error');
      return res.status(500).json({
        success: false,
        message: `Database save failed: Tutor profile creation failed. ${tutorErr.message}`
      });
    }

    // 8. Link Tutor profile back to User
    try {
      user.tutorProfile = tutor._id;
      await user.save();
      console.log(`[DATABASE UPDATE] Linked Tutor profile ${tutor._id} back to User ${user._id}`);
    } catch (linkErr) {
      console.error('[DATABASE ERROR] Failed to link Tutor profile to User:', linkErr);
      
      // Rollback both
      if (tutor) await Tutor.findByIdAndDelete(tutor._id);
      if (user) await User.findByIdAndDelete(user._id);
      
      console.log('API response status: 500 Internal Server Error');
      return res.status(500).json({
        success: false,
        message: `Database save failed: Failed to complete profile association. ${linkErr.message}`
      });
    }

    // 9. Generate token & Respond
    const token = generateToken(user._id);
    console.log('[REGISTRATION SUCCESS] Tutor registered successfully!');
    console.log('API response status: 201 Created');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tutorProfile: tutor._id
      }
    });
  } catch (err) {
    console.error('[API SYSTEM ERROR] Uncaught error in registerTutor:', err);
    console.log('API response status: 500 Internal Server Error');
    next(err);
  }
};

// @desc    Login user (Admin or Tutor)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tutorProfile: user.tutorProfile
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // req.user is attached by protect middleware
    const user = await User.findById(req.user._id).populate('tutorProfile').lean();
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};
