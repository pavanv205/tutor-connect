const User = require('../models/User');
const Tutor = require('../models/Tutor');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getFileUrl } = require('../utils/uploadHelper');
const crypto = require('crypto');

// Active OTP cache for supporthometutorx@gmail.com admin login
let activeAdminOtp = null;
let activeAdminOtpExpires = null;

// Helper to verify Razorpay signature securely
const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  
  if (process.env.NODE_ENV === 'production') {
    if (!keySecret || keySecret === 'rzp_test_secret') {
      console.error('[CRITICAL SECURITY ERROR] Razorpay keys not configured in production mode. Refusing payment verification.');
      return false;
    }
    if (orderId && orderId.startsWith('order_mock_')) {
      console.error('[CRITICAL SECURITY WARNING] Mock order ID bypass attempted in production mode.');
      return false;
    }
  } else {
    if (!keySecret || keySecret === 'rzp_test_secret' || (orderId && orderId.startsWith('order_mock_'))) {
      console.log('[PAYMENT WARNING] Bypassing Razorpay signature verification (mock/sandbox mode)');
      return true;
    }
  }
  
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const generated = crypto
    .createHmac('sha256', keySecret)
    .update(orderId + '|' + paymentId)
    .digest('hex');

  return generated === signature;
};

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
      'subjects', 'classes', 'teachingMode', 'hourlyRate', 'monthlyRate'
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

    const actualOrderId = data.razorpay_order_id;
    const actualPaymentId = data.razorpay_payment_id || data.paymentId;
    const actualSignature = data.razorpay_signature;
    data.paymentId = actualPaymentId;

    // Verify payment status
    if (!actualPaymentId || data.paymentStatus !== 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Tutor profile registration requires a successful ₹29 tutor subscription plan payment.'
      });
    }

    // Secure verification
    if (!verifyRazorpaySignature(actualOrderId, actualPaymentId, actualSignature)) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Cryptographic signature is invalid.'
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

    const numPassingYear = (data.passingYear !== undefined && data.passingYear !== null && data.passingYear !== '') 
      ? Number(data.passingYear) 
      : undefined;
    if (numPassingYear !== undefined && (isNaN(numPassingYear) || numPassingYear <= 1900 || numPassingYear > new Date().getFullYear() + 10)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid passing year' });
    }

    const numExp = (data.experienceYears !== undefined && data.experienceYears !== null && data.experienceYears !== '') 
      ? Number(data.experienceYears) 
      : 0;
    if (data.experienceYears !== undefined && data.experienceYears !== null && data.experienceYears !== '' && (isNaN(numExp) || numExp < 0)) {
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

    // 4. Check if user already exists (case-insensitive check on User and Tutor models)
    const normalizedEmail = email.trim().toLowerCase();
    let userExists;
    const isOffline = mongoose.connection.readyState !== 1;
    if (isOffline) {
      console.log('🔌 MongoDB is offline. Running registerTutor in Fallback mode.');
      const dbFallback = require('../utils/dbFallback');
      const usersList = await dbFallback.getUsers();
      userExists = usersList.find(u => u.email.toLowerCase() === normalizedEmail && u.role === 'Tutor');
    } else {
      try {
        userExists = await User.findOne({ email: normalizedEmail, role: 'Tutor' });
      } catch (dbErr) {
        console.error(`[REGISTRATION DATABASE ERROR] Failed to query existing user | Method: ${req.method} | Path: ${req.originalUrl} | Email: ${email} | Error: ${dbErr.message}`);
        return res.status(500).json({
          success: false,
          message: `Database save failed: Failed to check user existence.`
        });
      }
    }

    if (userExists) {
      console.log(`[DEBUG FAIL] userExists triggered for role Tutor on email ${email}`);
      devLog(`[REGISTRATION FAILED] Email already registered: ${email}`);
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    let tutorExists;
    if (isOffline) {
      const dbFallback = require('../utils/dbFallback');
      const tutorsList = await dbFallback.getTutors();
      tutorExists = tutorsList.find(t => t.email.toLowerCase() === normalizedEmail);
    } else {
      try {
        tutorExists = await Tutor.findOne({ email: normalizedEmail });
      } catch (dbErr) {
        console.error(`[REGISTRATION DATABASE ERROR] Failed to query existing tutor | Error: ${dbErr.message}`);
      }
    }

    if (tutorExists) {
      console.log(`[DEBUG FAIL] tutorExists triggered on email ${email}`);
      devLog(`[REGISTRATION FAILED] Tutor profile email already registered: ${email}`);
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // 6. Extract Cloudinary/Local File URLs
    let photoUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
    let certificateUrl = '';
    
    if (req.files && req.files['resume'] && req.files['resume'][0]) {
      photoUrl = getFileUrl(req.files['resume'][0]);
    }
    if (req.files && req.files['certificate'] && req.files['certificate'][0]) {
      certificateUrl = getFileUrl(req.files['certificate'][0]);
    }

    const parseIfJson = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
        try { return JSON.parse(val); } catch (e) { return [val]; }
      }
      return [val];
    };

    if (isOffline) {
      const dbFallback = require('../utils/dbFallback');
      const userId = 'fallback-user-' + Math.random().toString(36).substr(2, 9);
      const tutorId = 'fallback-tutor-' + Math.random().toString(36).substr(2, 9);
      const hashedPassword = await bcrypt.hash(password, 10);
      let fallbackOwnReferralCode = 'HT';
      for (let i = 0; i < 6; i++) {
        fallbackOwnReferralCode += Math.floor(Math.random() * 6) + 1;
      }
      
      user = {
        _id: userId,
        name: name || data.fullName,
        email,
        password: hashedPassword,
        role: 'Tutor',
        tutorProfile: tutorId,
        paymentStatus: 'Paid',
        paymentId: data.paymentId,
        subscriptionExpiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };
      
      const tutor = {
        _id: tutorId,
        userId: userId,
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
        referralCode: data.referralCode || '',
        ownReferralCode: fallbackOwnReferralCode,
        lat: data.lat ? Number(data.lat) : undefined,
        lng: data.lng ? Number(data.lng) : undefined,
        bio: data.bio,
        photo: photoUrl,
        resumeUrl: photoUrl,
        certificateUrl: certificateUrl,
        isVerified: false,
        paymentStatus: data.paymentStatus || 'Pending',
        paymentId: data.paymentId || undefined,
        createdAt: new Date().toISOString()
      };
      
      await dbFallback.saveUser(user);
      await dbFallback.saveTutor(tutor);

      const token = generateToken(user._id);
      return res.status(201).json({
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
    }

    // 5. Create User Document
    try {
      user = await User.create({
        name: name || data.fullName,
        email,
        password,
        role: 'Tutor',
        paymentStatus: 'Paid',
        paymentId: data.paymentId,
        subscriptionExpiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
      });
      devLog(`[DATABASE SAVE] Created User document, ID: ${user._id}`);
    } catch (userErr) {
      console.error(`[REGISTRATION USER ERROR] Failed to create User document | Email: ${email} | Error: ${userErr.message}`);
      return res.status(500).json({
        success: false,
        message: `Database save failed: User registration failed.`
      });
    }

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
        referralCode: data.referralCode || '',
        lat: data.lat ? Number(data.lat) : undefined,
        lng: data.lng ? Number(data.lng) : undefined,
        bio: data.bio,
        photo: photoUrl,
        resumeUrl: photoUrl,
        certificateUrl: certificateUrl,
        paymentStatus: data.paymentStatus || 'Pending',
        paymentId: data.paymentId || undefined
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

// @desc    Register a new student
// @route   POST /api/auth/register-student
// @access  Public
exports.registerStudent = async (req, res, next) => {
  devLog('--- [STUDENT REGISTRATION REQUEST RECEIVED] ---');
  let user = null;
  try {
    let { name, email, password, phone, paymentStatus, paymentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    // Validate inputs
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and phone number.'
      });
    }

    const actualOrderId = razorpay_order_id;
    const actualPaymentId = razorpay_payment_id || paymentId;
    const actualSignature = razorpay_signature;
    paymentId = actualPaymentId;

    // Verify payment status
    if (!actualPaymentId || paymentStatus !== 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Student account registration requires a successful ₹29 registration fee payment.'
      });
    }

    // Secure verification
    if (!verifyRazorpaySignature(actualOrderId, actualPaymentId, actualSignature)) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Cryptographic signature is invalid.'
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
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists (case-insensitive check on User and Tutor models)
    const normalizedEmail = email.trim().toLowerCase();
    let userExists;
    const isOffline = mongoose.connection.readyState !== 1;
    if (isOffline) {
      console.log('🔌 MongoDB is offline. Running registerStudent in Fallback mode.');
      const dbFallback = require('../utils/dbFallback');
      const usersList = await dbFallback.getUsers();
      userExists = usersList.find(u => u.email.toLowerCase() === normalizedEmail && u.role === 'Student');
    } else {
      userExists = await User.findOne({ email: normalizedEmail, role: 'Student' });
    }

    if (userExists) {
      devLog(`[REGISTRATION FAILED] Email already registered: ${email}`);
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    let tutorExists;
    if (isOffline) {
      const dbFallback = require('../utils/dbFallback');
      const tutorsList = await dbFallback.getTutors();
      tutorExists = tutorsList.find(t => t.email.toLowerCase() === normalizedEmail);
    } else {
      tutorExists = await Tutor.findOne({ email: normalizedEmail });
    }

    if (tutorExists) {
      devLog(`[REGISTRATION FAILED] Student registration blocked. Tutor profile email already registered: ${email}`);
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    if (isOffline) {
      const dbFallback = require('../utils/dbFallback');
      const userId = 'fallback-student-' + Math.random().toString(36).substr(2, 9);
      const hashedPassword = await bcrypt.hash(password, 10);
      
      user = {
        _id: userId,
        name,
        email,
        password: hashedPassword,
        phone,
        role: 'Student',
        paymentStatus: 'Paid',
        paymentId,
        createdAt: new Date().toISOString()
      };
      
      await dbFallback.saveUser(user);

      const token = generateToken(user._id);
      return res.status(201).json({
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
          }
        }
      });
    }

    // Create user document
    user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'Student',
      paymentStatus: 'Paid',
      paymentId
    });

    devLog(`[DATABASE SAVE] Created Student User document, ID: ${user._id}`);

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (err) {
    console.error(`[REGISTRATION SYSTEM ERROR] Uncaught error in registerStudent | Error: ${err.message}`);
    next(err);
  }
};

// @desc    Login user (Admin or Tutor)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  let requestEmail = 'unknown';
  try {
    const { email, password, role } = req.body || {};
    requestEmail = email || 'unknown';

    console.log(`[LOGIN START] Login process initiated for email: ${requestEmail} | Method: ${req.method} | Path: ${req.originalUrl}`);

    const normalizedEmail = email ? email.trim().toLowerCase() : '';
    if (normalizedEmail === 'supporthometutor@gmail.com') {
      return res.status(403).json({ success: false, message: 'Admin login with this email is disabled.' });
    }
    if (normalizedEmail === 'supporthometutorx@gmail.com' || normalizedEmail === 'suporthometutorx@gmail.com') {
      if (normalizedEmail === 'supporthometutor@gmail.com') {
        return res.status(403).json({ success: false, message: 'Admin login with this email is disabled.' });
      }
      const primaryEmail = 'supporthometutorx@gmail.com';
      let user;
      const isOffline = mongoose.connection.readyState !== 1;
      if (isOffline) {
        const dbFallback = require('../utils/dbFallback');
        const usersList = await dbFallback.getUsers();
        user = usersList.find(u => u.email.toLowerCase() === primaryEmail);
        if (!user) {
          user = {
            _id: '6a3956421c7fc8576e26c6af',
            name: 'HomeTutorX Admin',
            email: primaryEmail,
            password: await bcrypt.hash('tutor@321', 10),
            role: 'Admin',
            createdAt: new Date().toISOString()
          };
          usersList.push(user);
        } else {
          user.password = await bcrypt.hash('tutor@321', 10);
        }
      } else {
        user = await User.findOne({ email: primaryEmail }).select('+password');
        if (!user) {
          user = await User.create({
            name: 'HomeTutorX Admin',
            email: primaryEmail,
            password: 'tutor@321',
            role: 'Admin'
          });
          user = await User.findOne({ email: primaryEmail }).select('+password');
        } else {
          const isPassMatch = await user.matchPassword('tutor@321');
          if (!isPassMatch) {
            user.password = 'tutor@321';
            await user.save();
          }
        }
      }

      // Check if the user entered the correct active OTP as the password
      if (password && activeAdminOtp && password.trim() === activeAdminOtp && Date.now() < activeAdminOtpExpires) {
        // OTP verified! Clear OTP and log in
        activeAdminOtp = null;
        activeAdminOtpExpires = null;
        
        console.log(`[ADMIN OTP LOGIN SUCCESS] ${primaryEmail} successfully authenticated via real-time OTP`);
        const token = generateToken(user._id);
        return res.status(200).json({
          success: true,
          data: {
            token,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              phone: user.phone
            }
          }
        });
      }

      // Check if the user entered the correct password to trigger SMTP OTP
      if (password && password.trim() === 'tutor@321') {
        // Generate a new 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const { sendOtp } = require('../services/emailService');
        await sendOtp(primaryEmail, otp);
        
        activeAdminOtp = otp;
        activeAdminOtpExpires = Date.now() + 10 * 60 * 1000; // 10 mins expiration
        
        console.log(`[ADMIN OTP SENT] OTP ${otp} generated and sent to ${primaryEmail} after password verification`);
        
        return res.status(200).json({
          success: true,
          requireOtp: true,
          message: 'Password verified. An OTP has been sent to your email.'
        });
      }

      // If it's neither the correct OTP nor the correct password:
      if (activeAdminOtp && Date.now() < activeAdminOtpExpires) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect OTP.'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Incorrect username or password.'
      });
    }

    // Block permanently decommissioned admin email addresses from logging in
    const blockedAdminEmails = [
      'supporthometutor@gmail.com',
      'suporthometutor@gmail.com'
    ];
    if (blockedAdminEmails.includes(normalizedEmail)) {
      console.log(`[LOGIN BLOCKED] Login attempt from decommissioned admin email: ${normalizedEmail}`);
      return res.status(401).json({
        success: false,
        message: 'Incorrect username or password.'
      });
    }

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
    console.log(`[LOGIN DIAGNOSTIC] User lookup started for email: ${email}.`);
    let user;
    const isOffline = mongoose.connection.readyState !== 1;
    if (isOffline) {
      console.log('🔌 MongoDB is offline. Running login in Fallback mode.');
      const dbFallback = require('../utils/dbFallback');
      const usersList = await dbFallback.getUsers();
      console.log('[LOGIN DIAGNOSTIC] Fallback users in memory:', usersList.map(u => u.email));
      user = usersList.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase() && (!role || u.role === role));
    } else {
      const query = role ? { email, role } : { email };
      user = await User.findOne(query).select('+password');
    }
    console.log(`[LOGIN DIAGNOSTIC] User lookup completed for email: ${email}. Found user: ${!!user}`);

    if (!user) {
      console.log(`[LOGIN INFO] User lookup failed: User not found for email: ${email}`);
      return res.status(401).json({ success: false, message: 'Please create an account' });
    }

    // Safety check to prevent crashes if user document doesn't have a password field
    if (!user.password) {
      console.error(`[AUTH ERROR] User document for ${email} is missing a password field in the database.`);
      return res.status(401).json({ success: false, message: 'Incorrect username or password.' });
    }

    // Diagnostic: Password comparison
    console.log(`[LOGIN DIAGNOSTIC] Password comparison started for email: ${email}.`);
    let isMatch = false;
    try {
      if (isOffline) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        isMatch = await user.matchPassword(password);
      }
    } catch (bcryptErr) {
      console.error(`[LOGIN ERROR] Password comparison failed | Email: ${email} | Error: ${bcryptErr.message}`);
      return res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
    }

    console.log(`[LOGIN DIAGNOSTIC] Password comparison completed for email: ${email}. Match: ${isMatch}`);

    if (!isMatch) {
      console.log(`[LOGIN INFO] Login failed: Password mismatch for email: ${email}`);
      return res.status(401).json({ success: false, message: 'Incorrect username or password.' });
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
          phone: user.phone,
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

// @desc    Resend Admin 2FA OTP
// @route   POST /api/auth/resend-admin-otp
// @access  Public
exports.resendAdminOtp = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    const normalizedEmail = email ? email.trim().toLowerCase() : '';
    if (normalizedEmail === 'supporthometutorx@gmail.com' || normalizedEmail === 'suporthometutorx@gmail.com') {
      const primaryEmail = 'supporthometutorx@gmail.com';
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const { sendOtp } = require('../services/emailService');
      await sendOtp(primaryEmail, otp);
      
      activeAdminOtp = otp;
      activeAdminOtpExpires = Date.now() + 10 * 60 * 1000; // 10 mins expiration
      
      console.log(`[ADMIN OTP RESENT] OTP ${otp} generated and sent to ${primaryEmail}`);
      
      return res.status(200).json({
        success: true,
        message: 'A new OTP has been sent to your email.'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid request'
      });
    }
  } catch (err) {
    console.error('[ADMIN OTP RESEND ERROR]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend OTP. Please try again.'
    });
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    let user;
    if (mongoose.connection.readyState !== 1) {
      console.log('🔌 MongoDB is offline. Running getMe in Fallback mode.');
      const dbFallback = require('../utils/dbFallback');
      const usersList = await dbFallback.getUsers();
      const rawUser = usersList.find(u => String(u._id) === String(req.user._id));
      if (rawUser) {
        user = { ...rawUser };
        const tutorsList = await dbFallback.getTutors();
        user.tutorProfile = tutorsList.find(t => String(t._id) === String(rawUser.tutorProfile)) || null;
      }
    } else {
      user = await User.findById(req.user._id).populate('tutorProfile').lean();
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(`[ME SYSTEM ERROR] Uncaught error in getMe | User ID: ${req.user?._id} | Error: ${err.message}`);
    next(err);
  }
};

// @desc    Check if email already exists
// @route   POST /api/auth/check-email
// @access  Public
exports.checkEmail = async (req, res, next) => {
  try {
    const { email, role } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    // Check User model
    let userExists;
    const isOffline = mongoose.connection.readyState !== 1;
    if (isOffline) {
      const dbFallback = require('../utils/dbFallback');
      const usersList = await dbFallback.getUsers();
      userExists = usersList.find(u => u.email.toLowerCase() === normalizedEmail && (!role || u.role === role));
    } else {
      const query = role ? { email: normalizedEmail, role } : { email: normalizedEmail };
      userExists = await User.findOne(query);
    }

    if (userExists) {
      return res.json({ success: true, exists: true, message: 'Email already registered' });
    }

    // Check Tutor model
    let tutorExists;
    if (isOffline) {
      const dbFallback = require('../utils/dbFallback');
      const tutorsList = await dbFallback.getTutors();
      tutorExists = tutorsList.find(t => t.email.toLowerCase() === normalizedEmail);
    } else {
      tutorExists = await Tutor.findOne({ email: normalizedEmail });
    }

    if (tutorExists) {
      return res.json({ success: true, exists: true, message: 'Email already registered' });
    }

    return res.json({ success: true, exists: false });
  } catch (err) {
    next(err);
  }
};

// @desc    Renew subscription
// @route   POST /api/auth/renew-subscription
// @access  Private
exports.renewSubscription = async (req, res, next) => {
  devLog('--- [RENEW SUBSCRIPTION REQUEST RECEIVED] ---');
  try {
    let { paymentId, paymentStatus, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    const actualOrderId = razorpay_order_id;
    const actualPaymentId = razorpay_payment_id || paymentId;
    const actualSignature = razorpay_signature;
    paymentId = actualPaymentId;

    if (!actualPaymentId || paymentStatus !== 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Subscription renewal requires a successful ₹29 payment.'
      });
    }

    // Secure verification
    if (!verifyRazorpaySignature(actualOrderId, actualPaymentId, actualSignature)) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Cryptographic signature is invalid.'
      });
    }

    const newExpiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

    let user;
    if (mongoose.connection.readyState !== 1) {
      console.log('🔌 MongoDB is offline. Running renewSubscription in Fallback mode.');
      const dbFallback = require('../utils/dbFallback');
      const usersList = await dbFallback.getUsers();
      const rawUser = usersList.find(u => String(u._id) === String(req.user._id));
      if (!rawUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      rawUser.paymentId = paymentId;
      rawUser.paymentStatus = 'Paid';
      rawUser.subscriptionExpiresAt = newExpiresAt.toISOString();
      await dbFallback.saveUser(rawUser);
      user = rawUser;
    } else {
      user = await User.findByIdAndUpdate(
        req.user._id,
        {
          paymentId,
          paymentStatus: 'Paid',
          subscriptionExpiresAt: newExpiresAt
        },
        { new: true }
      ).populate('tutorProfile');
    }

    res.status(200).json({
      success: true,
      message: 'Subscription successfully renewed for 6 months.',
      data: user
    });
  } catch (err) {
    console.error(`[RENEW SYSTEM ERROR] Uncaught error in renewSubscription | Error: ${err.message}`);
    next(err);
  }
};

// @desc    Delete logged in user's account
// @route   POST /api/auth/delete-account
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const isOffline = mongoose.connection.readyState !== 1;
    let user;

    if (isOffline) {
      console.log('🔌 MongoDB is offline. Running deleteAccount in Fallback mode.');
      const dbFallback = require('../utils/dbFallback');
      const usersList = await dbFallback.getUsers();
      
      // Find the user by ID
      const rawUser = usersList.find(u => String(u._id) === String(req.user._id));
      if (!rawUser) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      // Check if email matches
      if (rawUser.email.toLowerCase() !== email.trim().toLowerCase()) {
        return res.status(400).json({ success: false, message: 'Invalid email address.' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, rawUser.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid password.' });
      }

      // If tutor, delete tutor profile in fallback too
      if (rawUser.role === 'Tutor') {
        const tutorsList = await dbFallback.getTutors();
        const tutorIdx = tutorsList.findIndex(t => String(t.userId) === String(rawUser._id));
        if (tutorIdx !== -1) {
          tutorsList.splice(tutorIdx, 1);
        }
      }

      // Delete user from fallback list
      const userIdx = usersList.findIndex(u => String(u._id) === String(rawUser._id));
      if (userIdx !== -1) {
        usersList.splice(userIdx, 1);
      }

      return res.status(200).json({
        success: true,
        message: 'Account successfully deleted.'
      });
    }

    // Database mode
    user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Verify email matches the user's email
    if (user.email.toLowerCase() !== email.trim().toLowerCase()) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    // Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid password.' });
    }

    // If Tutor, delete tutor profile
    if (user.role === 'Tutor') {
      await Tutor.findOneAndDelete({ userId: user._id });
    }

    // Delete user
    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      success: true,
      message: 'Account successfully deleted.'
    });
  } catch (err) {
    console.error(`[DELETE SYSTEM ERROR] Uncaught error in deleteAccount | Error: ${err.message}`);
    next(err);
  }
};
