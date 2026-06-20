const User = require('../models/User');
const Tutor = require('../models/Tutor');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const dbFallback = require('../utils/dbFallback');
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
  try {
    const data = req.body || {};
    const { name, email, password, phone, mobile } = data;

    // Fallback if MongoDB is offline
    if (mongoose.connection.readyState !== 1) {
      console.log('🔌 MongoDB is offline. Running registerTutor in Fallback mode.');
      const users = await dbFallback.getUsers();
      const userExists = users.some(u => u.email === email);
      if (userExists) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const userId = 'fallback-user-' + Math.random().toString(36).substr(2, 9);
      const tutorId = 'fallback-tutor-' + Math.random().toString(36).substr(2, 9);

      const newUser = {
        _id: userId,
        name: name || data.fullName,
        email,
        password: hashedPassword,
        role: 'Tutor',
        tutorProfile: tutorId,
        createdAt: new Date().toISOString()
      };

      let photoUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
      if (req.file) {
        photoUrl = getFileUrl(req.file);
      }

      const parseIfJson = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
          try { return JSON.parse(val); } catch (e) { return [val]; }
        }
        return [val];
      };

      const newTutor = {
        _id: tutorId,
        userId: userId,
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
        isVerified: false,
        createdAt: new Date().toISOString()
      };

      await dbFallback.saveUser(newUser);
      await dbFallback.saveTutor(newTutor);

      const token = generateToken(userId);

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: userId,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          tutorProfile: tutorId
        }
      });
    }

    // Check if user already exists in Mongoose
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create User document first
    const user = await User.create({
      name: name || data.fullName,
      email,
      password,
      role: 'Tutor'
    });

    // Handle file upload if present
    let photoUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
    if (req.file) {
      photoUrl = getFileUrl(req.file); // Cloudinary secure URL or Local URL
    }

    const parseIfJson = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
        try { return JSON.parse(val); } catch (e) { return [val]; }
      }
      return [val];
    };

    // Create associated Tutor profile with all details from the form
    const tutor = await Tutor.create({
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
      resumeUrl: photoUrl
    });

    // Link Tutor profile back to User
    user.tutorProfile = tutor._id;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

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

    // Fallback if MongoDB is offline
    if (mongoose.connection.readyState !== 1) {
      console.log('🔌 MongoDB is offline. Running login in Fallback mode.');
      const users = await dbFallback.getUsers();
      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);
      return res.status(200).json({
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
    // Fallback if MongoDB is offline
    if (mongoose.connection.readyState !== 1) {
      console.log('🔌 MongoDB is offline. Running getMe in Fallback mode.');
      const users = await dbFallback.getUsers();
      const user = users.find(u => String(u._id) === String(req.user._id));
      if (!user) {
        return res.status(401).json({ success: false, message: 'No user found' });
      }

      let tutorProfile = null;
      if (user.role === 'Tutor' && user.tutorProfile) {
        tutorProfile = await dbFallback.getTutorById(user.tutorProfile);
      }

      // Create a shallow copy without password for safety
      const userCopy = { ...user };
      delete userCopy.password;

      return res.status(200).json({
        success: true,
        data: {
          ...userCopy,
          tutorProfile
        }
      });
    }

    // req.user is attached by protect middleware
    const user = await User.findById(req.user._id).populate('tutorProfile');
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};
